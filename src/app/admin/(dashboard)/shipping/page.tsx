"use client";

import { useState } from "react";
import { Save, Truck, Plus, Trash2 } from "lucide-react";

export default function ShippingPage() {
  const [loading, setLoading] = useState(false);
  
  // Dummy state for UI demonstration
  const [zones, setZones] = useState([
    { id: 1, name: "Domestic (India)", rate: 0, conditions: "Free shipping on all domestic orders." },
    { id: 2, name: "International (Rest of World)", rate: 2500, conditions: "Standard international shipping rate." }
  ]);
  
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Shipping settings saved successfully!");
    }, 1000);
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
          <button className="flex items-center gap-2 text-sm font-medium text-[#C7A17A] hover:text-[#B38D66]">
            <Plus className="w-4 h-4" /> Add Zone
          </button>
        </div>

        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="border border-[#EFEFEF] rounded-sm p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-[#FAF8F5] p-3 rounded-sm text-[#C7A17A]">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-[#111111]">{zone.name}</h3>
                  <p className="text-sm text-[#666666]">{zone.conditions}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 w-full sm:w-auto">
                <div className="text-right flex-1 sm:flex-none">
                  <p className="text-sm text-[#666666]">Rate</p>
                  <p className="font-medium text-[#111111]">{zone.rate === 0 ? "Free" : `₹${zone.rate}`}</p>
                </div>
                <button className="text-red-500 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
