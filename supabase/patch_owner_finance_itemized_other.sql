-- ==============================================================================
-- PATCH: Itemized "Lainnya" cost di platform_operating_costs (KoZa Bisnis)
-- Bug ditemukan: field other_cost_idr cuma 1 angka polos, jadi tiap kali
-- owner simpan biaya baru (mis. "Claude Pro" lalu "Gemini Pro"), catatan
-- sebelumnya ketimpa/hilang. Diganti jadi daftar item bernama yang bisa
-- ditambah satu-satu tanpa saling menghapus.
-- ==============================================================================

ALTER TABLE public.platform_operating_costs
ADD COLUMN IF NOT EXISTS other_costs_items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Migrasi data lama: kalau ada nilai other_cost_idr/notes tersimpan sebelumnya,
-- jadikan 1 item awal di array baru supaya tidak hilang begitu saja.
UPDATE public.platform_operating_costs
SET other_costs_items = jsonb_build_array(
    jsonb_build_object('label', COALESCE(NULLIF(notes, ''), 'Lainnya'), 'amount', other_cost_idr)
)
WHERE other_cost_idr > 0 AND other_costs_items = '[]'::jsonb;
