"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Store, Product, Order, OperationalExpense, OrderStatus, MembershipPlan } from "@/types";
import { initialStore, initialProducts, initialOrders, initialExpenses, quotaPackages } from "@/lib/mock-data";

interface StoreContextType {
  store: Store;
  products: Product[];
  orders: Order[];
  expenses: OperationalExpense[];
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage if available
  useEffect(() => {
    try {
      const savedStore = localStorage.getItem("koza_store");
      const savedProducts = localStorage.getItem("koza_products");
      const savedOrders = localStorage.getItem("koza_orders");
      const savedExpenses = localStorage.getItem("koza_expenses");

      if (savedStore) setStore(JSON.parse(savedStore));
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    } catch (e) {
      console.error("Failed to load local state:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("koza_store", JSON.stringify(store));
      localStorage.setItem("koza_products", JSON.stringify(products));
      localStorage.setItem("koza_orders", JSON.stringify(orders));
      localStorage.setItem("koza_expenses", JSON.stringify(expenses));
    } catch (e) {
      console.error("Failed to save local state:", e);
    }
  }, [store, products, orders, expenses, isLoaded]);

  const updateStore = (updates: Partial<Store>) => {
    setStore((prev) => ({ ...prev, ...updates }));
  };

  const addProduct = (prodData: Omit<Product, "id" | "createdAt">) => {
    const newProd: Product = {
      ...prodData,
      id: "prod-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createOrder = (orderData: Omit<Order, "id" | "createdAt">) => {
    if (store.quotaBalance <= 0) {
      return { success: false, error: "Kuota order toko Anda sudah habis. Silakan isi ulang kuota untuk menerima pesanan." };
    }

    const newOrder: Order = {
      ...orderData,
      id: "ord-" + Date.now(),
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Kurangi kuota toko 1
    setStore((prev) => ({
      ...prev,
      quotaBalance: Math.max(0, prev.quotaBalance - 1),
    }));

    // Kurangi stok produk
    setProducts((prev) =>
      prev.map((p) => {
        const item = newOrder.items.find((i) => i.productId === p.id);
        if (item) {
          return { ...p, stock: Math.max(0, p.stock - item.quantity) };
        }
        return p;
      })
    );

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
  };

  const topupQuota = (packageCode: string) => {
    const pkg = quotaPackages.find((p) => p.code === packageCode);
    if (!pkg) return;
    setStore((prev) => ({
      ...prev,
      quotaBalance: prev.quotaBalance + pkg.quota,
    }));
  };

  const upgradePlan = (plan: MembershipPlan) => {
    const bonusQuota = plan === "PRO_MONTHLY" ? 100 : plan === "PRO_ANNUAL" ? 500 : 0;
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "PRO_MONTHLY") expiry.setDate(expiry.getDate() + 30);
    if (plan === "PRO_ANNUAL") expiry.setDate(expiry.getDate() + 365);

    setStore((prev) => ({
      ...prev,
      plan,
      planExpiryDate: expiry.toISOString(),
      quotaBalance: prev.quotaBalance + bonusQuota,
    }));
  };

  const addExpense = (expData: Omit<OperationalExpense, "id" | "date">) => {
    const newExp: OperationalExpense = {
      ...expData,
      id: "exp-" + Date.now(),
      date: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
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
