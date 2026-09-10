"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Store, Product, Order, OperationalExpense, OrderStatus, MembershipPlan, LandingPage } from "@/types";
import { initialStore, initialProducts, initialOrders, initialExpenses, quotaPackages, initialLandingPages } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";

interface StoreContextType {
  store: Store;
  products: Product[];
  orders: Order[];
  expenses: OperationalExpense[];
  landingPages: LandingPage[];
  updateStore: (updates: Partial<Store>) => void;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createOrder: (newOrder: Omit<Order, "id" | "createdAt">) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string) => void;
  topupQuota: (packageCode: string) => void;
  upgradePlan: (plan: MembershipPlan) => void;
  addExpense: (expense: Omit<OperationalExpense, "id" | "date">) => void;
  deleteExpense: (id: string) => void;
  createLandingPage: (lpData: Omit<LandingPage, "id" | "createdAt">) => LandingPage;
  updateLandingPage: (id: string, updates: Partial<LandingPage>) => void;
  deleteLandingPage: (id: string) => void;
  getLandingPageBySlug: (slug: string) => LandingPage | undefined;
  recordLandingPageView: (slug: string) => void;
  financialMetrics: {
    totalOmset: number;
    totalHPP: number;
    totalShipping: number;
    totalExpenses: number;
    labaBersih: number;
    marginPercent: number;
    completedOrdersCount: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(initialStore);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [expenses, setExpenses] = useState<OperationalExpense[]>(initialExpenses);
  const [landingPages, setLandingPages] = useState<LandingPage[]>(initialLandingPages || []);
  const [isSupabaseUser, setIsSupabaseUser] = useState(false);

  const loadDataFromSupabase = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsSupabaseUser(false);
        // Fallback to localStorage for unauthenticated demo
        const savedStore = localStorage.getItem("koza_store");
        const savedProducts = localStorage.getItem("koza_products");
        const savedOrders = localStorage.getItem("koza_orders");
        const savedExpenses = localStorage.getItem("koza_expenses");
        const savedLPs = localStorage.getItem("koza_landing_pages");

        if (savedStore) setStore(JSON.parse(savedStore));
        if (savedProducts) setProducts(JSON.parse(savedProducts));
        if (savedOrders) setOrders(JSON.parse(savedOrders));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
        if (savedLPs) setLandingPages(JSON.parse(savedLPs));
        return;
      }

      setIsSupabaseUser(true);

      // 1. Fetch store owned by authenticated seller
      const { data: storeRow, error: storeErr } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (storeErr || !storeRow) {
        console.warn("No store found for user, using initial store", storeErr);
        return;
      }

      const activeStore: Store = {
        id: storeRow.id,
        slug: storeRow.slug,
        name: storeRow.name,
        description: storeRow.description || "",
        logoUrl: storeRow.logo_url || "",
        whatsappNumber: storeRow.whatsapp_number,
        originCity: storeRow.origin_city || "Kota Jakarta Selatan",
        originDistrict: storeRow.origin_district || "Kebayoran Baru",
        quotaBalance: storeRow.quota_balance,
        plan: (storeRow.plan as MembershipPlan) || "NON_PRO",
        planExpiryDate: storeRow.plan_expiry_date || undefined,
        bankName: storeRow.bank_name || undefined,
        bankAccountNumber: storeRow.bank_account_number || undefined,
        bankAccountName: storeRow.bank_account_name || undefined,
        qrisImageUrl: storeRow.qris_image_url || undefined,
        createdAt: storeRow.created_at,
      };
      setStore(activeStore);

      // 2. Fetch products for this store
      const { data: prodsRows } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeRow.id)
        .order("created_at", { ascending: false });

      if (prodsRows) {
        setProducts(
          prodsRows.map((p: any) => ({
            id: p.id,
            storeId: p.store_id,
            name: p.name,
            slug: p.slug,
            description: p.description || "",
            sellingPrice: p.selling_price,
            costPrice: p.cost_price,
            weightGrams: p.weight_grams,
            stock: p.stock,
            imageUrl: p.image_url || "",
            category: p.category || "Umum",
            isActive: p.is_active,
            createdAt: p.created_at,
          }))
        );
      }

      // 3. Fetch orders for this store
      const { data: ordsRows } = await supabase
        .from("orders")
        .select("*")
        .eq("store_id", storeRow.id)
        .order("created_at", { ascending: false });

      if (ordsRows) {
        setOrders(
          ordsRows.map((o: any) => ({
            id: o.id,
            orderNumber: o.order_number,
            storeId: o.store_id,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerAddress: o.customer_address,
            destinationCity: o.destination_city,
            destinationDistrict: o.destination_district,
            courierName: o.courier_name,
            courierService: o.courier_service,
            shippingCost: o.shipping_cost,
            itemsTotal: o.items_total,
            grandTotal: o.grand_total,
            totalCostPrice: o.total_cost_price,
            netProfit: o.net_profit,
            status: o.status as OrderStatus,
            trackingNumber: o.tracking_number || undefined,
            paymentMethod: o.payment_method,
            items: o.items || [],
            createdAt: o.created_at,
          }))
        );
      }

      // 4. Fetch expenses for this store
      const { data: expsRows } = await supabase
        .from("expenses")
        .select("*")
        .eq("store_id", storeRow.id)
        .order("created_at", { ascending: false });

      if (expsRows) {
        setExpenses(
          expsRows.map((e: any) => ({
            id: e.id,
            storeId: e.store_id,
            category: e.category,
            description: e.description,
            amount: e.amount,
            date: e.expense_date || e.created_at,
          }))
        );
      }

      // 5. Fetch landing pages for this store
      const { data: lpsRows } = await supabase
        .from("landing_pages")
        .select("*")
        .eq("store_id", storeRow.id)
        .order("created_at", { ascending: false });

      if (lpsRows) {
        setLandingPages(
          lpsRows.map((lp: any) => {
            const b = lp.blocks || {};
            return {
              id: lp.id,
              storeId: lp.store_id,
              productId: lp.product_id || undefined,
              slug: lp.slug,
              title: lp.title,
              theme: lp.theme || "EMERALD",
              tone: lp.tone || "URGENT",
              builderMode: lp.builder_mode || "AI",
              blocks: b.blocks || (Array.isArray(b) ? b : undefined),
              design: b.design || undefined,
              seo: b.seo || undefined,
              hero: b.hero || {
                badge: "PROMO TERBATAS",
                headline: lp.title,
                subheadline: "",
                ctaText: "Pesan Sekarang",
                heroImageUrl: "",
                countdownHours: 24,
              },
              problemSection: b.problemSection || { title: "", subtitle: "", painPoints: [] },
              solutionSection: b.solutionSection || { title: "", description: "", highlights: [] },
              features: b.features || [],
              testimonials: b.testimonials || [],
              guarantee: b.guarantee || {
                title: "Garansi 100% Kepuasan",
                description: "Barang rusak atau tidak sesuai kami ganti baru tanpa ribet.",
              },
              faq: b.faq || [],
              pricing: b.pricing || {
                normalPrice: 0,
                promoPrice: 0,
                discountPercent: 0,
                scarcityText: "",
              },
              pixels: {
                metaPixelId: lp.meta_pixel_id || b.pixels?.metaPixelId || undefined,
                tiktokPixelId: lp.tiktok_pixel_id || b.pixels?.tiktokPixelId || undefined,
              },
              analytics: {
                viewsCount: lp.views_count || 0,
                ordersCount: 0,
                conversionRate: 0,
              },
              isPublished: lp.is_published ?? true,
              createdAt: lp.created_at,
            };
          })
        );
      }
    } catch (err) {
      console.error("Failed to load store data from Supabase:", err);
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();

    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        loadDataFromSupabase();
      } else if (event === "SIGNED_OUT") {
        setIsSupabaseUser(false);
        setStore(initialStore);
        setProducts(initialProducts);
        setOrders(initialOrders);
        setExpenses(initialExpenses);
        setLandingPages(initialLandingPages || []);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [loadDataFromSupabase]);

  // Sync to localStorage only when in unauthenticated / demo mode
  useEffect(() => {
    if (isSupabaseUser) return;
    try {
      localStorage.setItem("koza_store", JSON.stringify(store));
      localStorage.setItem("koza_products", JSON.stringify(products));
      localStorage.setItem("koza_orders", JSON.stringify(orders));
      localStorage.setItem("koza_expenses", JSON.stringify(expenses));
      localStorage.setItem("koza_landing_pages", JSON.stringify(landingPages));
    } catch (e) {
      console.error("Failed to save local state:", e);
    }
  }, [store, products, orders, expenses, landingPages, isSupabaseUser]);

  const updateStore = (updates: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...updates }));

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.whatsappNumber !== undefined) payload.whatsapp_number = updates.whatsappNumber;
      if (updates.originCity !== undefined) payload.origin_city = updates.originCity;
      if (updates.originDistrict !== undefined) payload.origin_district = updates.originDistrict;
      if (updates.logoUrl !== undefined) payload.logo_url = updates.logoUrl;
      if (updates.bankName !== undefined) payload.bank_name = updates.bankName;
      if (updates.bankAccountNumber !== undefined) payload.bank_account_number = updates.bankAccountNumber;
      if (updates.bankAccountName !== undefined) payload.bank_account_name = updates.bankAccountName;
      if (updates.qrisImageUrl !== undefined) payload.qris_image_url = updates.qrisImageUrl;

      supabase.from("stores").update(payload).eq("id", store.id).then();
    }
  };

  const addProduct = (prodData: Omit<Product, "id" | "createdAt">) => {
    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "prod-" + Date.now();
    const createdAt = new Date().toISOString();

    const newProd: Product = {
      ...prodData,
      id: newId,
      createdAt,
    };
    setProducts((prev) => [newProd, ...prev]);

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("products").insert({
        id: newId,
        store_id: store.id,
        name: prodData.name,
        slug: prodData.slug,
        description: prodData.description,
        selling_price: prodData.sellingPrice,
        cost_price: prodData.costPrice,
        weight_grams: prodData.weightGrams,
        stock: prodData.stock,
        image_url: prodData.imageUrl,
        category: prodData.category,
        is_active: prodData.isActive,
      }).then();
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );

    if (isSupabaseUser) {
      const supabase = createClient();
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.sellingPrice !== undefined) payload.selling_price = updates.sellingPrice;
      if (updates.costPrice !== undefined) payload.cost_price = updates.costPrice;
      if (updates.weightGrams !== undefined) payload.weight_grams = updates.weightGrams;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      supabase.from("products").update(payload).eq("id", id).then();
    }
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));

    if (isSupabaseUser) {
      const supabase = createClient();
      supabase.from("products").delete().eq("id", id).then();
    }
  };

  const createOrder = (orderData: Omit<Order, "id" | "createdAt">) => {
    if (store.quotaBalance <= 0) {
      return { success: false, error: "Kuota order toko Anda sudah habis. Silakan isi ulang kuota untuk menerima pesanan." };
    }

    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "ord-" + Date.now();
    const createdAt = new Date().toISOString();

    const newOrder: Order = {
      ...orderData,
      id: newId,
      createdAt,
    };

    setOrders((prev) => [newOrder, ...prev]);

    const newQuota = Math.max(0, store.quotaBalance - 1);
    setStore((prev) => ({
      ...prev,
      quotaBalance: newQuota,
    }));

    setProducts((prev) =>
      prev.map((p) => {
        const item = newOrder.items.find((i) => i.productId === p.id);
        if (item) {
          const nextStock = Math.max(0, p.stock - item.quantity);
          if (isSupabaseUser) {
            const supabase = createClient();
            supabase.from("products").update({ stock: nextStock }).eq("id", p.id).then();
          }
          return { ...p, stock: nextStock };
        }
        return p;
      })
    );

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("stores").update({ quota_balance: newQuota }).eq("id", store.id).then();
      supabase.from("orders").insert({
        id: newId,
        store_id: store.id,
        order_number: newOrder.orderNumber,
        customer_name: newOrder.customerName,
        customer_phone: newOrder.customerPhone,
        customer_address: newOrder.customerAddress,
        destination_city: newOrder.destinationCity,
        destination_district: newOrder.destinationDistrict,
        courier_name: newOrder.courierName,
        courier_service: newOrder.courierService,
        shipping_cost: newOrder.shippingCost,
        items_total: newOrder.itemsTotal,
        grandTotal: newOrder.grandTotal,
        total_cost_price: newOrder.totalCostPrice,
        net_profit: newOrder.netProfit,
        status: newOrder.status,
        tracking_number: newOrder.trackingNumber,
        payment_method: newOrder.paymentMethod,
        items: newOrder.items,
      }).then();
    }

    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
          };
        }
        return o;
      })
    );

    if (isSupabaseUser) {
      const supabase = createClient();
      const payload: any = { status };
      if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
      supabase.from("orders").update(payload).eq("id", orderId).then();
    }
  };

  const topupQuota = (packageCode: string) => {
    const pkg = quotaPackages.find((p) => p.code === packageCode);
    if (!pkg) return;
    const newBalance = store.quotaBalance + pkg.quota;
    setStore((prev) => ({
      ...prev,
      quotaBalance: newBalance,
    }));

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("stores").update({ quota_balance: newBalance }).eq("id", store.id).then();
    }
  };

  const upgradePlan = (plan: MembershipPlan) => {
    const bonusQuota = plan === "PRO_MONTHLY" ? 100 : plan === "PRO_ANNUAL" ? 500 : 0;
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "PRO_MONTHLY") expiry.setDate(expiry.getDate() + 30);
    if (plan === "PRO_ANNUAL") expiry.setDate(expiry.getDate() + 365);
    const newBalance = store.quotaBalance + bonusQuota;

    setStore((prev) => ({
      ...prev,
      plan,
      planExpiryDate: expiry.toISOString(),
      quotaBalance: newBalance,
    }));

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("stores").update({
        plan,
        plan_expiry_date: expiry.toISOString(),
        quota_balance: newBalance,
      }).eq("id", store.id).then();
    }
  };

  const addExpense = (expData: Omit<OperationalExpense, "id" | "date">) => {
    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "exp-" + Date.now();
    const date = new Date().toISOString();

    const newExp: OperationalExpense = {
      ...expData,
      id: newId,
      date,
    };
    setExpenses((prev) => [newExp, ...prev]);

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("expenses").insert({
        id: newId,
        store_id: store.id,
        category: expData.category,
        description: expData.description,
        amount: expData.amount,
        expense_date: date,
      }).then();
    }
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    if (isSupabaseUser) {
      const supabase = createClient();
      supabase.from("expenses").delete().eq("id", id).then();
    }
  };

  // Landing Page CRUD
  const createLandingPage = (lpData: Omit<LandingPage, "id" | "createdAt">): LandingPage => {
    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "lp-" + Date.now();
    const createdAt = new Date().toISOString();

    const newLp: LandingPage = {
      ...lpData,
      id: newId,
      createdAt,
    };
    setLandingPages((prev) => [newLp, ...prev]);

    if (isSupabaseUser && store.id) {
      const supabase = createClient();
      supabase.from("landing_pages").insert({
        id: newId,
        store_id: store.id,
        product_id: lpData.productId || null,
        slug: lpData.slug,
        title: lpData.title,
        theme: lpData.theme,
        tone: lpData.tone,
        builder_mode: lpData.builderMode || "AI",
        blocks: lpData,
        meta_pixel_id: lpData.pixels?.metaPixelId || null,
        tiktok_pixel_id: lpData.pixels?.tiktokPixelId || null,
        views_count: 0,
      }).then();
    }

    return newLp;
  };

  const updateLandingPage = (id: string, updates: Partial<LandingPage>) => {
    setLandingPages((prev) =>
      prev.map((lp) => (lp.id === id ? { ...lp, ...updates } : lp))
    );

    if (isSupabaseUser) {
      const supabase = createClient();
      const payload: any = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.theme !== undefined) payload.theme = updates.theme;
      if (updates.tone !== undefined) payload.tone = updates.tone;
      if (updates.builderMode !== undefined) payload.builder_mode = updates.builderMode;
      if (updates.pixels?.metaPixelId !== undefined) payload.meta_pixel_id = updates.pixels.metaPixelId;
      if (updates.pixels?.tiktokPixelId !== undefined) payload.tiktok_pixel_id = updates.pixels.tiktokPixelId;
      payload.blocks = updates;

      supabase.from("landing_pages").update(payload).eq("id", id).then();
    }
  };

  const deleteLandingPage = (id: string) => {
    setLandingPages((prev) => prev.filter((lp) => lp.id !== id));

    if (isSupabaseUser) {
      const supabase = createClient();
      supabase.from("landing_pages").delete().eq("id", id).then();
    }
  };

  const getLandingPageBySlug = (slug: string) => {
    return landingPages.find((lp) => lp.slug === slug);
  };

  const recordLandingPageView = (slug: string) => {
    setLandingPages((prev) =>
      prev.map((lp) => {
        if (lp.slug === slug) {
          const viewsCount = (lp.analytics?.viewsCount || 0) + 1;
          const ordersCount = lp.analytics?.ordersCount || 0;
          const conversionRate = viewsCount > 0 ? Number(((ordersCount / viewsCount) * 100).toFixed(1)) : 0;

          if (isSupabaseUser && lp.id) {
            const supabase = createClient();
            supabase.from("landing_pages").update({ views_count: viewsCount }).eq("id", lp.id).then();
          }

          return {
            ...lp,
            analytics: {
              viewsCount,
              ordersCount,
              conversionRate,
            },
          };
        }
        return lp;
      })
    );
  };

  // Financial calculations
  const paidOrders = orders.filter((o) => o.status === "SELESAI" || o.status === "DIPROSES");
  const totalOmset = paidOrders.reduce((sum, o) => sum + o.itemsTotal, 0);
  const totalHPP = paidOrders.reduce((sum, o) => sum + o.totalCostPrice, 0);
  const totalShipping = paidOrders.reduce((sum, o) => sum + o.shippingCost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const labaBersih = totalOmset - totalHPP - totalExpenses;
  const marginPercent = totalOmset > 0 ? (labaBersih / totalOmset) * 100 : 0;

  return (
    <StoreContext.Provider
      value={{
        store,
        products,
        orders,
        expenses,
        landingPages,
        updateStore,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        topupQuota,
        upgradePlan,
        addExpense,
        deleteExpense,
        createLandingPage,
        updateLandingPage,
        deleteLandingPage,
        getLandingPageBySlug,
        recordLandingPageView,
        financialMetrics: {
          totalOmset,
          totalHPP,
          totalShipping,
          totalExpenses,
          labaBersih,
          marginPercent,
          completedOrdersCount: paidOrders.length,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
