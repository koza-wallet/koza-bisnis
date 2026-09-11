"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store-context";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Check, 
  ExternalLink, 
  Plus, 
  Layers, 
  Palette, 
  Globe, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Sparkles, 
  Copy,
  Layout,
  PanelLeftClose,
  PanelLeftOpen,
  Edit3,
  Columns,
  ArrowUpDown
} from "lucide-react";
import { BuilderBlock, BuilderPageDesign, BuilderPageSEO, BlockType } from "@/types/builder";
import { createDefaultBlock } from "@/lib/builder-templates";
import { BlockRenderer } from "@/components/builder/block-renderer";
import { BlockSettingsForm } from "@/components/builder/block-settings-form";
import { AddSectionModal } from "@/components/builder/add-section-modal";
import { DevicePreviewFrame } from "@/components/builder/device-preview-frame";
import { useTheme } from "@/lib/theme-context";

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const router = useRouter();
  const { landingPages, updateLandingPage, store } = useStore();
  const { theme } = useTheme();

  const lp = landingPages.find((p) => p.id === id);

  // Editor Tabs: "KONTEN" | "DESAIN" | "SEO"
  const [activeTab, setActiveTab] = useState<"KONTEN" | "DESAIN" | "SEO">("KONTEN");

  // Viewport: "DESKTOP" | "TABLET" | "MOBILE"
  const [viewport, setViewport] = useState<"DESKTOP" | "TABLET" | "MOBILE">("MOBILE");

  // State for Blocks, Design, and SEO
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [design, setDesign] = useState<BuilderPageDesign>({
    fontFamily: "Outfit",
    pageWidth: "CONTAINED",
    primaryColor: "#10b981",
    backgroundColor: "#020617",
    textColor: "#f8fafc",
    cardRadius: "xl",
    themePreset: "EMERALD",
  });
  const [seo, setSeo] = useState<BuilderPageSEO>({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    noIndex: false,
  });

  // Active block being edited
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  // Modal for adding sections
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);

  // Editor Sidebar Collapse state
  const [isEditorSidebarOpen, setIsEditorSidebarOpen] = useState(true);

  // Mobile responsive layout states
  const [mobileViewMode, setMobileViewMode] = useState<"EDITOR" | "PREVIEW" | "SPLIT">("EDITOR");
  const [splitPreviewPosition, setSplitPreviewPosition] = useState<"TOP" | "BOTTOM">("TOP");

  // Save feedback state
  const [isSaved, setIsSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load existing data from LP
  useEffect(() => {
    if (lp) {
      if (lp.blocks && lp.blocks.length > 0) {
        setBlocks(lp.blocks);
      } else {
        // Fallback: create starter blocks from existing AI landing page fields if any
        setBlocks([
          createDefaultBlock("ANNOUNCEMENT_BAR"),
          createDefaultBlock("HERO_BANNER"),
          createDefaultBlock("FEATURES_GRID"),
          createDefaultBlock("TESTIMONIALS"),
          createDefaultBlock("CHECKOUT_FORM"),
          createDefaultBlock("FAQ_ACCORDION"),
        ]);
      }

      if (lp.design) {
        setDesign(lp.design);
      }

      if (lp.seo) {
        setSeo(lp.seo);
      } else {
        setSeo({
          metaTitle: lp.title || "Landing Page KoZa",
          metaDescription: lp.hero?.subheadline || "Beli produk original berkualitas dengan promo terbatas hari ini!",
          metaKeywords: "ecommerce, diskon, toko online",
          noIndex: false,
        });
      }
    }
  }, [lp]);

  if (!lp) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <h1 className="text-xl font-bold">Landing Page Tidak Ditemukan</h1>
        <p className="text-xs text-slate-400 mt-2">ID landing page tidak valid atau telah dihapus.</p>
        <Link
          href="/dashboard/landing-pages"
          className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
        >
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  // Handle Save
  const handleSave = () => {
    updateLandingPage(id, {
      builderMode: "MANUAL_BERDU",
      blocks,
      design,
      seo,
    });

    setIsSaved(true);
    setHasUnsavedChanges(false);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Toggle status Draft <-> Terbit
  const handleTogglePublish = () => {
    updateLandingPage(id, { isPublished: !lp.isPublished });
  };

  // Reordering helpers
  const moveBlock = (index: number, direction: "UP" | "DOWN") => {
    const newBlocks = [...blocks];
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newBlocks.length) return;

    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIdx];
    newBlocks[targetIdx] = temp;

    setBlocks(newBlocks);
    setHasUnsavedChanges(true);
  };

  const toggleBlockVisibility = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, isVisible: !b.isVisible } : b))
    );
    setHasUnsavedChanges(true);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    if (selectedBlockId === blockId) setSelectedBlockId(null);
    setHasUnsavedChanges(true);
  };

  const duplicateBlock = (block: BuilderBlock) => {
    const newBlock: BuilderBlock = {
      ...block,
      id: "blk-" + Date.now(),
      title: `${block.title} (Salinan)`,
      settings: JSON.parse(JSON.stringify(block.settings)),
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const addBlockByType = (type: BlockType) => {
    const newBlock = createDefaultBlock(type);
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    setHasUnsavedChanges(true);
  };

  const updateBlock = (updatedBlock: BuilderBlock) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === updatedBlock.id ? updatedBlock : b))
    );
    setHasUnsavedChanges(true);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  // Preset Design Themes
  const applyThemePreset = (preset: "EMERALD" | "MIDNIGHT" | "ROSE" | "ELECTRIC") => {
    switch (preset) {
      case "EMERALD":
        setDesign((prev) => ({
          ...prev,
          themePreset: "EMERALD",
          primaryColor: "#10b981",
          backgroundColor: "#020617",
          textColor: "#f8fafc",
          fontFamily: "Outfit",
        }));
        break;
      case "MIDNIGHT":
        setDesign((prev) => ({
          ...prev,
          themePreset: "MIDNIGHT",
          primaryColor: "#f59e0b",
          backgroundColor: "#030712",
          textColor: "#f9fafb",
          fontFamily: "Plus Jakarta Sans",
        }));
        break;
      case "ROSE":
        setDesign((prev) => ({
          ...prev,
          themePreset: "ROSE",
          primaryColor: "#f43f5e",
          backgroundColor: "#09090b",
          textColor: "#ffffff",
          fontFamily: "Poppins",
        }));
        break;
      case "ELECTRIC":
        setDesign((prev) => ({
          ...prev,
          themePreset: "ELECTRIC",
          primaryColor: "#8b5cf6",
          backgroundColor: "#0b0813",
          textColor: "#f5f3ff",
          fontFamily: "Inter",
        }));
        break;
    }
    setHasUnsavedChanges(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden transition-colors">
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 flex items-center justify-between z-30 shrink-0 transition-colors">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <Link
            href="/dashboard/landing-pages"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {/* Toggle Editor Panel Sidebar Button */}
          <button
            type="button"
            onClick={() => setIsEditorSidebarOpen(!isEditorSidebarOpen)}
            title={isEditorSidebarOpen ? "Sembunyikan Panel Editor" : "Tampilkan Panel Editor"}
            className="hidden sm:flex px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold items-center gap-1.5 transition-colors shrink-0"
          >
            {isEditorSidebarOpen ? (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="hidden md:inline">Tutup Panel</span>
              </>
            ) : (
              <>
                <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline font-bold text-emerald-600 dark:text-emerald-400">Buka Panel</span>
              </>
            )}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-xs">
                {lp.title}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold shrink-0">
                Editor Visual
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${
                  lp.isPublished
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {lp.isPublished ? "Terbit" : "Draft"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[250px]">
              /lp/{lp.slug}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {hasUnsavedChanges && (
            <span className="hidden sm:inline-block text-[11px] text-amber-500 dark:text-amber-400 animate-pulse font-medium">
              • Belum disimpan
            </span>
          )}

          <button
            type="button"
            onClick={handleTogglePublish}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              lp.isPublished
                ? "border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                : "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lp.isPublished ? "Jadikan Draft" : "Terbitkan Sekarang"}</span>
          </button>

          <a
            href={`/lp/${lp.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Preview Halaman</span>
          </a>

          <button
            type="button"
            onClick={handleSave}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isSaved
                ? "bg-emerald-500 text-slate-950"
                : "bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95"
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MOBILE RESPONSIVE SUBHEADER / VIEW SWITCHER */}
      <div className="sm:hidden border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-3 py-2 flex items-center justify-between gap-2 shrink-0 z-20 transition-colors">
        {/* Segmented Mode Switcher: Editor | Preview | Split */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex-1">
          <button
            type="button"
            onClick={() => setMobileViewMode("EDITOR")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileViewMode === "EDITOR"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode("PREVIEW")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileViewMode === "PREVIEW"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileViewMode("SPLIT")}
            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              mobileViewMode === "SPLIT"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split</span>
          </button>
        </div>

        {/* Position Toggle for Split Mode: Top vs Bottom */}
        {mobileViewMode === "SPLIT" && (
          <button
            type="button"
            onClick={() => setSplitPreviewPosition((prev) => (prev === "TOP" ? "BOTTOM" : "TOP"))}
            className="px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
            title="Tukar posisi live preview (Atas / Bawah)"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">{splitPreviewPosition === "TOP" ? "Preview Atas" : "Preview Bawah"}</span>
          </button>
        )}
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE */}
      <div className="flex-1 flex flex-col sm:flex-row overflow-hidden relative">
        {/* LEFT COLUMN: EDITOR SIDEBAR (380px) */}
        <aside
          className={`bg-white dark:bg-slate-950 flex flex-col z-20 transition-all duration-200 ${
            isEditorSidebarOpen
              ? "sm:flex sm:flex-none sm:w-[380px] lg:w-[400px] sm:h-full sm:order-1 sm:border-r border-slate-200 dark:border-slate-800"
              : "sm:hidden"
          } ${
            mobileViewMode === "EDITOR"
              ? "flex flex-1 w-full h-full order-1 overflow-hidden"
              : mobileViewMode === "PREVIEW"
              ? "hidden"
              : `flex flex-1 w-full min-h-0 ${splitPreviewPosition === "TOP" ? "order-2" : "order-1"}`
          }`}
        >
          {selectedBlock ? (
            /* Sub-Drawer: Block Settings Form */
            <BlockSettingsForm
              block={selectedBlock}
              onChange={updateBlock}
              onClose={() => setSelectedBlockId(null)}
              onDelete={deleteBlock}
            />
          ) : (
            /* Main Sidebar with 3 Tabs: Konten, Desain, SEO */
            <>
              {/* 3 Tab Navigation Header */}
              <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 p-1.5 gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("KONTEN")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "KONTEN"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-transparent"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Konten</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("DESAIN")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "DESAIN"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-transparent"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900"
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Desain</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("SEO")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "SEO"
                      ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-slate-200/80 dark:border-transparent"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>SEO & Pixel</span>
                </button>
              </div>

              {/* Tab 1: KONTEN (Daftar Seksi Modular) */}
              {activeTab === "KONTEN" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-400">Susunan Seksi ({blocks.length})</h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Klik seksi untuk mengedit konten teks & gambar</p>
                    </div>
                  </div>

                  {/* Block List */}
                  <div className="space-y-2">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlockId(block.id)}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          !block.isVisible
                            ? "bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 opacity-50"
                            : "bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-slate-850"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Reorder Buttons */}
                          <div className="flex flex-col gap-0.5 text-slate-400 dark:text-slate-500" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveBlock(index, "UP")}
                              className="p-0.5 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === blocks.length - 1}
                              onClick={() => moveBlock(index, "DOWN")}
                              className="p-0.5 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                              {block.title}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                              {block.type}
                            </p>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => duplicateBlock(block)}
                            title="Duplikat Seksi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleBlockVisibility(block.id)}
                            title={block.isVisible ? "Sembunyikan" : "Tampilkan"}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Eye className={`w-3.5 h-3.5 ${!block.isVisible ? "line-through text-rose-500" : ""}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(block.id)}
                            title="Hapus Seksi"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Big "+ Tambah Seksi" Button */}
                  <button
                    type="button"
                    onClick={() => setIsAddSectionOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Seksi Baru</span>
                  </button>
                </div>
              )}

              {/* Tab 2: DESAIN (Global Theme Settings) */}
              {activeTab === "DESAIN" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
                  {/* Preset Themes */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Preset Tema Warna</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "EMERALD", name: "Emerald Pro", color: "#10b981" },
                        { id: "MIDNIGHT", name: "Midnight Luxe", color: "#f59e0b" },
                        { id: "ROSE", name: "Rose Bloom", color: "#f43f5e" },
                        { id: "ELECTRIC", name: "Electric Purple", color: "#8b5cf6" },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => applyThemePreset(t.id as any)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            design.themePreset === t.id
                              ? "border-emerald-500 bg-emerald-50/60 dark:bg-slate-900 shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: t.color }} />
                          <span className="font-semibold text-slate-900 dark:text-white">{t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Pilihan Font Halaman</label>
                    <select
                      value={design.fontFamily}
                      onChange={(e: any) => {
                        setDesign((prev) => ({ ...prev, fontFamily: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    >
                      <option value="Outfit">Outfit (Modern Luxury - Default)</option>
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Clean & Tech)</option>
                      <option value="Inter">Inter (Sleek Minimalist)</option>
                      <option value="Poppins">Poppins (Friendly & Bold)</option>
                    </select>
                  </div>

                  {/* Color Customization */}
                  <div className="space-y-3">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">Warna Kustom</label>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Warna Primer / Tombol</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Digunakan pada tombol CTA & highlight</p>
                      </div>
                      <input
                        type="color"
                        value={design.primaryColor}
                        onChange={(e) => {
                          setDesign((prev) => ({ ...prev, primaryColor: e.target.value, themePreset: "CUSTOM" }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Warna Latar Belakang</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Warna dasar landing page</p>
                      </div>
                      <input
                        type="color"
                        value={design.backgroundColor}
                        onChange={(e) => {
                          setDesign((prev) => ({ ...prev, backgroundColor: e.target.value, themePreset: "CUSTOM" }));
                          setHasUnsavedChanges(true);
                        }}
                        className="w-8 h-8 rounded border border-slate-300 dark:border-slate-700 bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Card Radius */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">Kelengkungan Sudut Kartu (Border Radius)</label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {(["sm", "md", "lg", "xl", "2xl"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setDesign((prev) => ({ ...prev, cardRadius: r }));
                            setHasUnsavedChanges(true);
                          }}
                          className={`py-2 rounded-lg border text-center font-bold text-xs uppercase transition-all ${
                            design.cardRadius === r
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: SEO & PIXEL */}
              {activeTab === "SEO" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Title (Judul Tab Browser & Google)</label>
                    <input
                      type="text"
                      value={seo.metaTitle}
                      onChange={(e) => {
                        setSeo((prev) => ({ ...prev, metaTitle: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Judul SEO menarik..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Description (Snippet Pencarian)</label>
                    <textarea
                      rows={3}
                      value={seo.metaDescription}
                      onChange={(e) => {
                        setSeo((prev) => ({ ...prev, metaDescription: e.target.value }));
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Deskripsi ringkas yang muncul di Google atau saat link dibagikan di WhatsApp..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="h-px bg-slate-200 dark:bg-slate-800" />

                  {/* Tracking Pixel */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Tracking Iklan Berbayar</h3>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Meta Pixel ID (Facebook / Instagram Ads)</label>
                      <input
                        type="text"
                        value={lp.pixels?.metaPixelId || ""}
                        onChange={(e) => {
                          updateLandingPage(id, {
                            pixels: { ...lp.pixels, metaPixelId: e.target.value },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Contoh: 123456789012345"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">TikTok Pixel ID</label>
                      <input
                        type="text"
                        value={lp.pixels?.tiktokPixelId || ""}
                        onChange={(e) => {
                          updateLandingPage(id, {
                            pixels: { ...lp.pixels, tiktokPixelId: e.target.value },
                          });
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Contoh: C1234567890ABC"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Viewport Switcher Bar */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between shrink-0">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Viewport Preview</span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewport("DESKTOP")}
                    title="Desktop Preview (100%)"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewport === "DESKTOP"
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport("TABLET")}
                    title="Tablet Preview (768px)"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewport === "TABLET"
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Tablet className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewport("MOBILE")}
                    title="Mobile iPhone Preview (390px)"
                    className={`p-1.5 rounded-lg transition-colors ${
                      viewport === "MOBILE"
                        ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* RIGHT COLUMN: LIVE WYSIWYG PREVIEW CANVAS */}
        <main
          className={`bg-slate-100/90 dark:bg-[#07090E] transition-colors relative ${
            // Desktop styling
            viewport === "DESKTOP"
              ? "sm:flex sm:flex-1 sm:h-full sm:order-2 sm:p-0 sm:overflow-y-auto sm:items-start sm:justify-center"
              : "sm:flex sm:flex-1 sm:h-full sm:order-2 sm:p-6 sm:overflow-y-auto sm:items-start sm:justify-center"
          } ${
            // Mobile styling
            mobileViewMode === "EDITOR"
              ? "hidden"
              : mobileViewMode === "PREVIEW"
              ? "flex flex-1 w-full h-full p-0 order-1 overflow-y-auto items-start justify-center"
              : `flex w-full h-[45vh] sm:h-auto overflow-y-auto p-2 items-start justify-center shrink-0 ${
                  splitPreviewPosition === "TOP"
                    ? "order-1 border-b border-slate-200 dark:border-slate-800"
                    : "order-2 border-t border-slate-200 dark:border-slate-800"
                }`
          }`}
        >
          {/* Floating Button to re-open Editor Panel if closed */}
          {!isEditorSidebarOpen && (
            <button
              type="button"
              onClick={() => setIsEditorSidebarOpen(true)}
              className="hidden sm:flex absolute top-4 left-4 z-20 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 items-center gap-1.5 transition-all animate-fade-in"
            >
              <PanelLeftOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Buka Panel Editor</span>
            </button>
          )}

          {(() => {
            const previewContent = (
              <div className="divide-y divide-slate-800/40">
                {blocks.map((block) => (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    design={design}
                    isPreview={true}
                    isSelected={selectedBlockId === block.id}
                    onSelect={(blockId) => setSelectedBlockId(blockId)}
                    storeName={store?.name || "KoZa Store"}
                    storePhone={store?.whatsappNumber || "6281234567890"}
                  />
                ))}

                {blocks.length === 0 && (
                  <div className="py-20 text-center px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Layout className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Halaman Masih Kosong</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                      Mulai tambahkan seksi pertama seperti Hero Banner atau Announcement Bar untuk membangun halaman Anda.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddSectionOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500"
                    >
                      + Tambah Seksi
                    </button>
                  </div>
                )}
              </div>
            );

            const pageStyle: React.CSSProperties = {
              backgroundColor: design.backgroundColor,
              color: design.textColor,
              fontFamily: design.fontFamily,
            };

            if (viewport === "DESKTOP") {
              return (
                <div className="transition-all duration-300 w-full min-h-full rounded-none border-0 shadow-none my-0" style={pageStyle}>
                  {previewContent}
                </div>
              );
            }

            return (
              <div
                className={`transition-all duration-300 ${
                  viewport === "TABLET"
                    ? "rounded-2xl border border-slate-300/80 dark:border-slate-800 shadow-xl overflow-hidden my-4"
                    : "rounded-none sm:rounded-[44px] border-0 sm:border-[10px] border-slate-800 shadow-none sm:shadow-2xl overflow-hidden my-0 sm:my-4 sm:ring-1 sm:ring-slate-700/50"
                }`}
              >
                {/* iPhone Notch Simulator on Mobile Viewport (Only visible on desktop simulator) */}
                {viewport === "MOBILE" && (
                  <div className="hidden sm:flex h-6 bg-slate-950 items-center justify-center sticky top-0 z-30">
                    <div className="w-24 h-3.5 bg-black rounded-full" />
                  </div>
                )}

                {/* Dirender di dalam iframe supaya breakpoint Tailwind (sm:/md:/lg:/xl:) dihitung
                    terhadap lebar device simulasi (390/768px), bukan lebar browser asli */}
                <DevicePreviewFrame
                  width={viewport === "TABLET" ? 768 : 390}
                  isDark={theme === "dark"}
                  className="w-full block"
                >
                  <div style={pageStyle}>{previewContent}</div>
                </DevicePreviewFrame>
              </div>
            );
          })()}
        </main>
      </div>

      {/* Floating Quick Action Pill for Mobile */}
      {mobileViewMode === "EDITOR" ? (
        <button
          type="button"
          onClick={() => setMobileViewMode("PREVIEW")}
          className="sm:hidden fixed bottom-5 right-4 z-40 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-emerald-400/30 backdrop-blur-md active:scale-95 transition-all"
        >
          <Eye className="w-4 h-4" />
          <span>Lihat Preview</span>
        </button>
      ) : mobileViewMode === "PREVIEW" ? (
        <button
          type="button"
          onClick={() => setMobileViewMode("EDITOR")}
          className="sm:hidden fixed bottom-5 right-4 z-40 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-xs shadow-xl flex items-center gap-2 border border-slate-700/50 backdrop-blur-md active:scale-95 transition-all"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Konten</span>
        </button>
      ) : null}

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSelectBlockType={addBlockByType}
      />
    </div>
  );
}
