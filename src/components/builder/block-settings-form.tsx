"use client";

import React from "react";
import { 
  X, 
  Trash2, 
  Settings2, 
  Eye, 
  EyeOff 
} from "lucide-react";
import { BuilderBlock } from "@/types/builder";

interface BlockSettingsFormProps {
  block: BuilderBlock;
  onChange: (updatedBlock: BuilderBlock) => void;
  onClose: () => void;
  onDelete: (blockId: string) => void;
}

export function BlockSettingsForm({
  block,
  onChange,
  onClose,
  onDelete,
}: BlockSettingsFormProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({
      ...block,
      settings: {
        ...block.settings,
        [key]: value,
      },
    });
  };

  const updateTitle = (newTitle: string) => {
    onChange({
      ...block,
      title: newTitle,
    });
  };

  const toggleVisibility = () => {
    onChange({
      ...block,
      isVisible: !block.isVisible,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-white">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-emerald-400" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengaturan Blok</h3>
            <p className="text-sm font-bold text-white truncate max-w-[180px]">{block.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleVisibility}
            title={block.isVisible ? "Sembunyikan" : "Tampilkan"}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              block.isVisible
                ? "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {block.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            title="Hapus Blok"
            className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Form Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        {/* Nama Label Blok di Editor */}
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Label Seksi (Internal)</label>
          <input
            type="text"
            value={block.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
          />
        </div>

        <div className="h-px bg-slate-800" />

        {/* Dynamic Fields Per Block Type */}
        {renderTypeSpecificInputs(block, updateSetting)}
      </div>
    </div>
  );
}

function renderTypeSpecificInputs(
  block: BuilderBlock,
  updateSetting: (key: string, value: any) => void
) {
  const { settings } = block;

  switch (block.type) {
    case "HERO_BANNER":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Badge Text (Atas)</label>
            <input
              type="text"
              value={settings.badge || ""}
              onChange={(e) => updateSetting("badge", e.target.value)}
              placeholder="Contoh: ✨ SPECIAL LAUNCHING"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Headline Utama</label>
            <textarea
              rows={2}
              value={settings.headline || ""}
              onChange={(e) => updateSetting("headline", e.target.value)}
              placeholder="Judul besar penarik perhatian"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Subheadline / Deskripsi Singkat</label>
            <textarea
              rows={3}
              value={settings.subheadline || ""}
              onChange={(e) => updateSetting("subheadline", e.target.value)}
              placeholder="Penjelasan ringkas manfaat utama produk"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">URL Foto Produk (Hero Image)</label>
            <input
              type="text"
              value={settings.heroImageUrl || ""}
              onChange={(e) => updateSetting("heroImageUrl", e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Teks Tombol CTA</label>
              <input
                type="text"
                value={settings.ctaText || ""}
                onChange={(e) => updateSetting("ctaText", e.target.value)}
                placeholder="Pesan Sekarang"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Link Target CTA</label>
              <input
                type="text"
                value={settings.ctaLink || ""}
                onChange={(e) => updateSetting("ctaLink", e.target.value)}
                placeholder="#checkout-section"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div>
              <p className="font-semibold text-white">Tampilkan Countdown Urgensi</p>
              <p className="text-[11px] text-slate-400">Pemicu FOMO psikologis</p>
            </div>
            <input
              type="checkbox"
              checked={!!settings.showCountdown}
              onChange={(e) => updateSetting("showCountdown", e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
            />
          </div>
        </div>
      );

    case "ANNOUNCEMENT_BAR":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Isi Pesan Pengumuman</label>
            <input
              type="text"
              value={settings.text || ""}
              onChange={(e) => updateSetting("text", e.target.value)}
              placeholder="GRATIS ONGKIR SELURUH INDONESIA"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Highlight Badge (Opsional)</label>
            <input
              type="text"
              value={settings.highlightText || ""}
              onChange={(e) => updateSetting("highlightText", e.target.value)}
              placeholder="KODE: MERDEKA"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Warna Background</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.bgColor || "#10b981"}
                  onChange={(e) => updateSetting("bgColor", e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-slate-400 font-mono text-[11px]">{settings.bgColor}</span>
              </div>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Warna Teks</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.textColor || "#ffffff"}
                  onChange={(e) => updateSetting("textColor", e.target.value)}
                  className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                />
                <span className="text-slate-400 font-mono text-[11px]">{settings.textColor}</span>
              </div>
            </div>
          </div>
        </div>
      );

    case "VIDEO_EMBED":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Link Video YouTube</label>
            <input
              type="text"
              value={settings.videoUrl || ""}
              onChange={(e) => updateSetting("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Rasio Tampilan</label>
            <select
              value={settings.aspectRatio || "16:9"}
              onChange={(e) => updateSetting("aspectRatio", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            >
              <option value="16:9">16:9 (Landscape - Standar)</option>
              <option value="9:16">9:16 (Portrait - TikTok / Reels)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Keterangan / Caption Video</label>
            <input
              type="text"
              value={settings.caption || ""}
              onChange={(e) => updateSetting("caption", e.target.value)}
              placeholder="Tonton unboxing dan review jujur di atas"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      );

    case "RICH_TEXT":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Seksi (Opsional)</label>
            <input
              type="text"
              value={settings.title || ""}
              onChange={(e) => updateSetting("title", e.target.value)}
              placeholder="Cerita di Balik Produk Kami"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Isi Konten Teks</label>
            <textarea
              rows={6}
              value={settings.content || ""}
              onChange={(e) => updateSetting("content", e.target.value)}
              placeholder="Tuliskan cerita, narasi masalah solusi..."
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Perataan Teks</label>
              <select
                value={settings.alignment || "center"}
                onChange={(e) => updateSetting("alignment", e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
              >
                <option value="left">Rata Kiri</option>
                <option value="center">Rata Tengah</option>
                <option value="right">Rata Kanan</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 mt-5">
              <span className="text-slate-300 font-medium">Kotak Highlight</span>
              <input
                type="checkbox"
                checked={!!settings.highlightBox}
                onChange={(e) => updateSetting("highlightBox", e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </div>
          </div>
        </div>
      );

    case "CHECKOUT_FORM":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Formulir</label>
            <input
              type="text"
              value={settings.title || ""}
              onChange={(e) => updateSetting("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Promo (Rp)</label>
              <input
                type="number"
                value={settings.promoPrice || 0}
                onChange={(e) => updateSetting("promoPrice", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Harga Normal/Coret (Rp)</label>
              <input
                type="number"
                value={settings.normalPrice || 0}
                onChange={(e) => updateSetting("normalPrice", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Teks Tombol Kirim Pesanan</label>
            <input
              type="text"
              value={settings.buttonText || ""}
              onChange={(e) => updateSetting("buttonText", e.target.value)}
              placeholder="KIRIM PESANAN SEKARANG"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>
        </div>
      );

    case "COUNTDOWN_TIMER":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Judul Countdown</label>
            <input
              type="text"
              value={settings.title || ""}
              onChange={(e) => updateSetting("title", e.target.value)}
              placeholder="Flash Sale Berakhir Dalam:"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Durasi Timer (Jam)</label>
            <input
              type="number"
              value={settings.hours || 8}
              onChange={(e) => updateSetting("hours", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
            />
          </div>
        </div>
      );

    case "STOCK_COUNTER":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Label Peringatan</label>
            <input
              type="text"
              value={settings.label || ""}
              onChange={(e) => updateSetting("label", e.target.value)}
              placeholder="Stok Hampir Habis!"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stok Tersisa (Pcs)</label>
              <input
                type="number"
                value={settings.currentStock || 7}
                onChange={(e) => updateSetting("currentStock", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Stok Awal Total</label>
              <input
                type="number"
                value={settings.initialStock || 50}
                onChange={(e) => updateSetting("initialStock", Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
              />
            </div>
          </div>
        </div>
      );

    case "SPACER_DIVIDER":
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Tinggi Jarak (Pixel)</label>
            <input
              type="number"
              value={settings.height || 32}
              onChange={(e) => updateSetting("height", Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Gaya Jarak</label>
            <select
              value={settings.style || "space"}
              onChange={(e) => updateSetting("style", e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white focus:border-emerald-500 outline-none"
            >
              <option value="space">Spasi Kosong Transparan</option>
              <option value="line">Garis Pemisah Halus (Divider)</option>
            </select>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-400 text-xs">
          Pengaturan khusus untuk {block.title} dapat disesuaikan pada opsi di atas.
        </div>
      );
  }
}
