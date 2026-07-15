"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Tag, Settings2, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "@/store/useToastStore";
import { deleteCoupon } from "@/app/actions/admin";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  is_active: boolean;
  used_count: number;
  is_free_shipping?: boolean;
}

export default function DiscountsPage() {
  const supabase = createClient();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: 0,
    is_active: true,
    is_free_shipping: false
  });

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  }, [supabase]);;

  const handleSave = async () => {
    if (!formData.code || formData.discount_value === undefined) return;
    
    setSaving(true);
    const { is_free_shipping, ...rest } = formData;
    const payload = {
      ...rest,
      code: formData.code.toUpperCase()
    };

    try {
      if (formData.id) {
        const { error } = await supabase.from('coupons').update(payload).eq('id', formData.id);
        if (error) throw error;
      } else {
        const insertPayload = {
          ...payload,
          discount_type: payload.discount_type || 'percentage',
          discount_value: payload.discount_value || 0
        };
        const { error } = await supabase.from('coupons').insert([insertPayload]);
        if (error) throw error;
      }

      setShowDrawer(false);
      setFormData({ code: "", discount_type: "percentage", discount_value: 10, min_order_value: 0, is_active: true, is_free_shipping: false });
      toast.success(formData.id ? "Discount updated!" : "Discount created successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to complete operation. Please try again or check the logs.");
    } finally {
      setSaving(false);
      fetchCoupons();
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await supabase.from('coupons').update({ is_active: !currentStatus }).eq('id', id);
    fetchCoupons();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      const result = await deleteCoupon(id);
      if (result.success) {
        fetchCoupons();
        toast.success("Coupon deleted successfully");
      } else {
        toast.error(`Failed to delete coupon: ${result.error}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rich-black mb-1">Discounts</h1>
          <p className="text-neutral-500 text-sm">Manage promo codes and automatic discounts.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ code: "", discount_type: "percentage", discount_value: 10, min_order_value: 0, is_active: true, is_free_shipping: false });
            setShowDrawer(true);
          }}
          className="flex items-center gap-2 bg-rich-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gold transition-colors rounded-sm"
        >
          <Plus className="w-4 h-4" /> Create Discount
        </button>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-border-light text-xs uppercase tracking-wider text-neutral-400">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium hidden md:table-cell">Rules</th>
                <th className="p-4 font-medium hidden sm:table-cell">Usage</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-rich-black">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mb-2" />
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-neutral-400">
                    No discounts created yet.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border-light hover:bg-ivory transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gold" />
                        <span className="font-medium tracking-wide">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(coupon.id, coupon.is_active)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-colors ${
                          coupon.is_active 
                            ? "bg-green-100 text-green-700 hover:bg-error/10 hover:text-error" 
                            : "bg-border-light text-neutral-500 hover:bg-green-100 hover:text-green-700"
                        }`}
                      >
                        {coupon.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="p-4 font-medium">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% OFF`
                        : `₹${coupon.discount_value} OFF`}
                      {coupon.is_free_shipping && <span className="block text-[10px] text-success mt-1">+ Free Shipping</span>}
                    </td>
                    <td className="p-4 text-neutral-500 hidden md:table-cell">
                      {coupon.min_order_value > 0 ? `Min purchase ₹${coupon.min_order_value}` : 'No minimum'}
                    </td>
                    <td className="p-4 text-neutral-500 hidden sm:table-cell">
                      {coupon.used_count} times
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => { setFormData(coupon); setShowDrawer(true); }}
                        className="text-neutral-500 hover:text-gold transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-neutral-500 hover:text-error transition-colors"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Form Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border-light flex justify-between items-center">
              <h2 className="font-serif text-xl">{formData.id ? 'Edit Discount' : 'Create Discount'}</h2>
              <button onClick={() => setShowDrawer(false)} className="text-neutral-400 hover:text-rich-black">
                âœ•
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-1">
                <label className="text-sm font-medium text-rich-black">Discount Code</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  placeholder="e.g. SUMMER20"
                  className="w-full border border-border-light p-2.5 text-sm rounded-sm uppercase focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-rich-black">Type</label>
                  <select 
                    value={formData.discount_type}
                    onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage'|'fixed'})}
                    className="w-full border border-border-light p-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-rich-black">Value</label>
                  <input 
                    type="number" 
                    value={formData.discount_value}
                    onChange={e => setFormData({...formData, discount_value: Number(e.target.value)})}
                    className="w-full border border-border-light p-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-rich-black">Minimum Purchase Amount (₹)</label>
                <input 
                  type="number" 
                  value={formData.min_order_value}
                  onChange={e => setFormData({...formData, min_order_value: Number(e.target.value)})}
                  className="w-full border border-border-light p-2.5 text-sm rounded-sm focus:outline-none focus:border-gold"
                />
                <p className="text-xs text-neutral-400">Leave 0 for no minimum purchase requirement.</p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input 
                  type="checkbox" 
                  id="active-toggle"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                />
                <label htmlFor="active-toggle" className="text-sm font-medium text-rich-black">Active and available for use</label>
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="shipping-toggle"
                  checked={formData.is_free_shipping || false}
                  onChange={e => setFormData({...formData, is_free_shipping: e.target.checked})}
                />
                <label htmlFor="shipping-toggle" className="text-sm font-medium text-rich-black">Grants Free Shipping</label>
              </div>
            </div>

            <div className="p-6 border-t border-border-light bg-ivory">
              <button 
                onClick={handleSave}
                disabled={saving || !formData.code}
                className="w-full flex items-center justify-center gap-2 bg-rich-black text-white px-5 py-3 text-sm font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Discount Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
