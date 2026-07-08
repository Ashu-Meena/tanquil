"use client";

import { useState, useEffect } from "react";
import { Save, Truck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/store/useToastStore";

export default function ShippingPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [shippingSettings, setShippingSettings] = useState({
    free_shipping_threshold: 10000,
    flat_rate: 250
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'shipping')
      .single();
    
    if (data && data.value) {
      setShippingSettings(data.value);
    }
    setFetching(false);
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('store_settings')
      .update({ value: shippingSettings })
      .eq('key', 'shipping');
      
    setLoading(false);
    if (!error) {
      toast.success("Shipping settings saved successfully!");
    } else {
      toast.error("Error saving settings");
    }
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[#111111]">Shipping & Delivery</h1>
          <p className="text-sm text-[#666666] mt-1">Configure shipping zones, rates, and delivery options.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#111111] text-white px-6 py-2 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
        </button>
      </div>

      <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-serif text-xl text-[#111111]">Shipping Zones</h2>
            <p className="text-sm text-[#666666]">Manage regions you ship to and their respective rates.</p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          {fetching ? (
            <div className="p-4 text-center text-[#666666]">Loading...</div>
          ) : (
            <div className="space-y-6">
              <div className="border border-[#EFEFEF] rounded-sm p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FAF8F5] p-3 rounded-sm text-[#C7A17A]">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#111111]">Standard Domestic Shipping</h3>
                    <p className="text-sm text-[#666666] mb-4">Set the flat rate for shipping and the threshold for free shipping.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#111111]">Flat Rate (₹)</label>
                        <input 
                          type="number" 
                          value={shippingSettings.flat_rate}
                          onChange={(e) => setShippingSettings({...shippingSettings, flat_rate: Number(e.target.value)})}
                          className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-[#111111]">Free Shipping Threshold (₹)</label>
                        <input 
                          type="number" 
                          value={shippingSettings.free_shipping_threshold}
                          onChange={(e) => setShippingSettings({...shippingSettings, free_shipping_threshold: Number(e.target.value)})}
                          className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" 
                        />
                        <p className="text-xs text-[#666666] mt-1">Orders above this amount will get free shipping.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-6">
        <div>
          <h2 className="font-serif text-xl text-[#111111]">Processing Time</h2>
          <p className="text-sm text-[#666666]">Let customers know how long it takes to prepare an order before it ships.</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#111111]">Standard Processing</label>
            <select className="w-full max-w-md border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]">
              <option>1-2 business days</option>
              <option>3-5 business days</option>
              <option>1 week</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
