"use client";

import { Plus, Trash2 } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

export interface SizeRow {
  id: string;
  size: string;
  stock_quantity: number;
}

export interface ColorGroup {
  id: string;
  color_name: string;
  color_hex: string;
  image_urls: string[];
  sizes: SizeRow[];
}

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "OS"];

interface VariantsEditorProps {
  groups: ColorGroup[];
  onChange: (groups: ColorGroup[]) => void;
}

export default function VariantsEditor({ groups, onChange }: VariantsEditorProps) {
  // ── Color Group helpers ──────────────────────────────────────────────────
  const addGroup = () => {
    onChange([
      ...groups,
      {
        id: crypto.randomUUID(),
        color_name: "",
        color_hex: "#000000",
        image_urls: [],
        sizes: [{ id: crypto.randomUUID(), size: "S", stock_quantity: 0 }],
      },
    ]);
  };

  const removeGroup = (gid: string) => {
    if (groups.length === 1) return;
    onChange(groups.filter((g) => g.id !== gid));
  };

  const updateGroup = (gid: string, field: keyof ColorGroup, value: any) => {
    onChange(groups.map((g) => (g.id === gid ? { ...g, [field]: value } : g)));
  };

  // ── Size Row helpers ─────────────────────────────────────────────────────
  const addSize = (gid: string) => {
    onChange(
      groups.map((g) =>
        g.id === gid
          ? { ...g, sizes: [...g.sizes, { id: crypto.randomUUID(), size: "S", stock_quantity: 0 }] }
          : g
      )
    );
  };

  const removeSize = (gid: string, sid: string) => {
    onChange(
      groups.map((g) =>
        g.id === gid ? { ...g, sizes: g.sizes.filter((s) => s.id !== sid) } : g
      )
    );
  };

  const updateSize = (gid: string, sid: string, field: keyof SizeRow, value: any) => {
    onChange(
      groups.map((g) =>
        g.id === gid
          ? { ...g, sizes: g.sizes.map((s) => (s.id === sid ? { ...s, [field]: value } : s)) }
          : g
      )
    );
  };

  // ── Image helpers ────────────────────────────────────────────────────────
  const addImage = (gid: string) => {
    onChange(
      groups.map((g) =>
        g.id === gid ? { ...g, image_urls: [...g.image_urls, ""] } : g
      )
    );
  };

  const updateImage = (gid: string, idx: number, url: string) => {
    onChange(
      groups.map((g) => {
        if (g.id !== gid) return g;
        const urls = [...g.image_urls];
        urls[idx] = url;
        return { ...g, image_urls: urls };
      })
    );
  };

  const removeImage = (gid: string, idx: number) => {
    onChange(
      groups.map((g) =>
        g.id === gid
          ? { ...g, image_urls: g.image_urls.filter((_, i) => i !== idx) }
          : g
      )
    );
  };

  return (
    <div className="space-y-4">
      {groups.map((group, gIdx) => (
        <div
          key={group.id}
          className="border border-[#EFEFEF] rounded-sm bg-white shadow-sm hover:border-[#C7A17A] transition-colors"
        >
          {/* ── Card Header: Color ── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#EFEFEF] bg-[#FAFAFA]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <input
                type="color"
                value={group.color_hex}
                onChange={(e) => updateGroup(group.id, "color_hex", e.target.value)}
                className="w-9 h-9 border border-[#EFEFEF] p-0.5 cursor-pointer rounded-sm flex-shrink-0 bg-white"
                title="Pick colour"
              />
              <input
                type="text"
                value={group.color_name}
                onChange={(e) => updateGroup(group.id, "color_name", e.target.value)}
                placeholder="Color name (e.g. Midnight Blue)"
                className="flex-1 border border-[#EFEFEF] px-3 py-1.5 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors rounded-sm"
              />
              <span className="text-xs text-[#999999] hidden sm:block shrink-0">
                Colour {gIdx + 1}
              </span>
            </div>
            {groups.length > 1 && (
              <button
                type="button"
                onClick={() => removeGroup(group.id)}
                className="ml-3 text-[#999999] hover:text-red-500 transition-colors p-1"
                title="Remove colour"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5 space-y-5">
            {/* ── Sizes & Stock table ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Sizes & Stock
                </label>
                <button
                  type="button"
                  onClick={() => addSize(group.id)}
                  className="flex items-center gap-1 text-xs font-medium text-[#C7A17A] hover:text-[#b8926b] transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Size
                </button>
              </div>

              <div className="border border-[#EFEFEF] rounded-sm overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-[1fr_100px_36px] bg-[#F9F9F9] border-b border-[#EFEFEF] px-3 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999]">Size</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] text-center">Stock</span>
                  <span />
                </div>

                {/* Size rows */}
                {group.sizes.map((sizeRow) => (
                  <div
                    key={sizeRow.id}
                    className="grid grid-cols-[1fr_100px_36px] items-center border-b border-[#EFEFEF] last:border-b-0 px-3 py-2 gap-2 hover:bg-[#FAFAFA] transition-colors"
                  >
                    {/* Size selector + optional custom input */}
                    <div className="flex items-center gap-2">
                      <select
                        value={PRESET_SIZES.includes(sizeRow.size) ? sizeRow.size : "Custom"}
                        onChange={(e) =>
                          updateSize(
                            group.id,
                            sizeRow.id,
                            "size",
                            e.target.value === "Custom" ? "" : e.target.value
                          )
                        }
                        className="border border-[#EFEFEF] px-2 py-1.5 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors rounded-sm w-28"
                      >
                        {PRESET_SIZES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                        <option value="Custom">Custom…</option>
                      </select>

                      {!PRESET_SIZES.includes(sizeRow.size) && (
                        <input
                          type="text"
                          value={sizeRow.size}
                          onChange={(e) => updateSize(group.id, sizeRow.id, "size", e.target.value)}
                          placeholder="e.g. 32W"
                          className="flex-1 border border-[#EFEFEF] px-2 py-1.5 text-sm focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors rounded-sm"
                        />
                      )}
                    </div>

                    {/* Stock */}
                    <input
                      type="number"
                      min={0}
                      value={sizeRow.stock_quantity}
                      onChange={(e) =>
                        updateSize(group.id, sizeRow.id, "stock_quantity", parseInt(e.target.value) || 0)
                      }
                      className="border border-[#EFEFEF] px-2 py-1.5 text-sm text-center font-mono focus:outline-none focus:border-[#C7A17A] bg-[#FAF8F5] focus:bg-white transition-colors rounded-sm w-full"
                    />

                    {/* Remove size */}
                    <button
                      type="button"
                      onClick={() => removeSize(group.id, sizeRow.id)}
                      disabled={group.sizes.length === 1}
                      className="flex items-center justify-center text-[#CCCCCC] hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Remove size"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Quick-add all sizes */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_SIZES.filter((s) => !group.sizes.some((r) => r.size === s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      onChange(
                        groups.map((g) =>
                          g.id === group.id
                            ? { ...g, sizes: [...g.sizes, { id: crypto.randomUUID(), size: s, stock_quantity: 0 }] }
                            : g
                        )
                      )
                    }
                    className="text-[10px] font-medium px-2 py-1 border border-dashed border-[#CCCCCC] text-[#999999] hover:border-[#C7A17A] hover:text-[#C7A17A] transition-colors rounded-sm"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Color Media Gallery ── */}
            <div className="pt-4 border-t border-[#EFEFEF]">
              <label className="block text-xs font-semibold text-[#666666] uppercase tracking-wider mb-1">
                Colour Media Gallery
              </label>
              <p className="text-xs text-[#999999] mb-3">
                Photos for this colour option. Shown when the customer selects this colour.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.image_urls.map((img, imgIdx) => (
                  <div key={imgIdx} className="relative group/img">
                    <ImageUploader
                      value={img}
                      onChange={(url) => updateImage(group.id, imgIdx, url)}
                      label=""
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(group.id, imgIdx)}
                      className="absolute top-1 right-1 p-1 bg-white border border-[#EFEFEF] shadow-sm text-red-400 hover:bg-red-500 hover:text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-all z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => addImage(group.id)}
                  className="border border-dashed border-[#EFEFEF] hover:border-[#C7A17A] rounded-sm flex flex-col items-center justify-center cursor-pointer transition-colors aspect-square w-full bg-[#FAF8F5]"
                >
                  <Plus className="w-5 h-5 text-[#999999] mb-1" />
                  <span className="text-[10px] font-medium text-[#999999] uppercase tracking-wider text-center px-2">
                    Add Image
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Add Colour button */}
      <button
        type="button"
        onClick={addGroup}
        className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-[#CCCCCC] hover:border-[#C7A17A] text-sm font-medium text-[#999999] hover:text-[#C7A17A] transition-colors rounded-sm"
      >
        <Plus className="w-4 h-4" /> Add Colour
      </button>
    </div>
  );
}

// ─── Helpers (used by both pages when saving) ────────────────────────────────

/** Convert ColorGroups → flat product_variants rows for DB */
export function groupsToVariantPayloads(
  groups: ColorGroup[],
  productId: string,
  baseSku: string
): any[] {
  const rows: any[] = [];
  groups.forEach((g) => {
    const colorCode = (g.color_name.trim().substring(0, 3) || "DEF").toUpperCase();
    g.sizes.forEach((s) => {
      const sizeCode = (s.size.trim() || "OS").toUpperCase();
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      rows.push({
        product_id: productId,
        color_name: g.color_name || "Default",
        color_hex: g.color_hex,
        size: s.size || "OS",
        stock_quantity: s.stock_quantity,
        sku: `${baseSku}-${colorCode}-${sizeCode}-${rand}`,
      });
    });
  });
  return rows;
}

/** Convert ColorGroups → flat product_images rows for DB */
export function groupsToImagePayloads(groups: ColorGroup[], productId: string): any[] {
  const rows: any[] = [];
  groups.forEach((g) => {
    const colorKey = g.color_name.trim() || "Default";
    g.image_urls.filter((u) => u.trim()).forEach((url, i) => {
      rows.push({ product_id: productId, url, color_name: colorKey, display_order: i + 1 });
    });
  });
  return rows;
}

/** Convert flat DB product_variants + product_images → ColorGroups for the editor */
export function flatVariantsToGroups(
  dbVariants: any[],
  dbImages: any[]
): ColorGroup[] {
  const colorImages: Record<string, string[]> = {};
  dbImages.forEach((img) => {
    const key = img.color_name || "Default";
    if (!colorImages[key]) colorImages[key] = [];
    colorImages[key].push(img.url);
  });

  const colorMap: Record<string, ColorGroup> = {};
  dbVariants.forEach((v) => {
    const key = v.color_name || "Default";
    if (!colorMap[key]) {
      colorMap[key] = {
        id: crypto.randomUUID(),
        color_name: v.color_name || "Default",
        color_hex: v.color_hex || "#000000",
        image_urls: colorImages[key] || [],
        sizes: [],
      };
    }
    colorMap[key].sizes.push({
      id: crypto.randomUUID(),
      size: v.size || "OS",
      stock_quantity: v.stock_quantity || 0,
    });
  });

  const result = Object.values(colorMap);
  return result.length > 0
    ? result
    : [{ id: crypto.randomUUID(), color_name: "Default", color_hex: "#000000", image_urls: [], sizes: [{ id: crypto.randomUUID(), size: "OS", stock_quantity: 0 }] }];
}
