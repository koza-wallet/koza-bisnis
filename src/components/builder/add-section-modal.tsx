"use client";

import React, { useState } from "react";
import { 
  X, 
  Search, 
  Plus, 
  Sparkles, 
  Film, 
  Image as ImageIcon, 
  Grid, 
  MessageSquare, 
  HelpCircle, 
  ShoppingBag, 
  Clock, 
  Flame, 
  Layers, 
  Type,
  Layout
} from "lucide-react";
import { BlockCatalogItem, BlockType, BlockCategory } from "@/types/builder";
import { BLOCK_CATALOG } from "@/lib/builder-templates";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlockType: (type: BlockType) => void;
}

const CATEGORY_TABS: { id: "ALL" | BlockCategory; label: string }[] = [
  { id: "ALL", label: "Semua Seksi" },
  { id: "HEADER_HERO", label: "Header & Hero" },
  { id: "MEDIA_SHOWCASE", label: "Media & Galeri" },
  { id: "CONTENT_STORY", label: "Konten & Teks" },
  { id: "TRUST_PROOF", label: "Social Proof" },
  { id: "SCARCITY_URGENCY", label: "Urgensi / FOMO" },
  { id: "SALES_CHECKOUT", label: "Checkout & Tombol" },
];

export function AddSectionModal({
  isOpen,
  onClose,
  onSelectBlockType,
}: AddSectionModalProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | BlockCategory>("ALL");

  if (!isOpen) return null;

  const filteredItems = BLOCK_CATALOG.filter((item) => {
    const matchesCategory = activeCategory === "ALL" || item.category === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Sparkles": return <Sparkles className="w-5 h-5" />;
      case "Film": return <Film className="w-5 h-5" />;
      case "ImageIcon": return <ImageIcon className="w-5 h-5" />;
      case "Grid": return <Grid className="w-5 h-5" />;
      case "Type": return <Type className="w-5 h-5" />;
      case "MessageSquare": return <MessageSquare className="w-5 h-5" />;
      case "HelpCircle": return <HelpCircle className="w-5 h-5" />;
      case "Clock": return <Clock className="w-5 h-5" />;
      case "Flame": return <Flame className="w-5 h-5" />;
      case "ShoppingBag": return <ShoppingBag className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Layout className="w-5 h-5 text-emerald-400" />
              <span>Tambah Seksi Baru</span>
            </h2>
            <p className="text-xs text-slate-400">Pilih komponen siap pakai untuk dipasang pada landing page Anda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filters */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari jenis seksi (contoh: Hero, Checkout, Testimoni, Video)..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seksi Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.type}
              onClick={() => {
                onSelectBlockType(item.type);
                onClose();
              }}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/60 hover:bg-slate-800/60 transition-all cursor-pointer group flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                {getIcon(item.iconName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <h3 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors truncate">
                    {item.name}
                  </h3>
                  {item.badge && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
              <div className="shrink-0 self-center">
                <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center group-hover:border-emerald-500 group-hover:text-emerald-400 transition-colors">
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              Tidak ada seksi yang cocok dengan pencarian "{search}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
