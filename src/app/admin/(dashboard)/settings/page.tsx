"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Settings, Megaphone, Globe } from "lucide-react";

interface SettingItem {
  key: string;
  value: any;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [storeInfo, setStoreInfo] = useState({
    name: "",
    email: "",
    phone: "",
    instagram: "",
    facebook: ""
  });
  
  const [announcements, setAnnouncements] = useState<string[]>([""]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('store_settings').select('*');
    
    if (data) {
      const info = data.find(s => s.key === 'store_info');
      if (info?.value) {
        setStoreInfo(info.value);
      }
      
      const ann = data.find(s => s.key === 'announcement');
      if (ann?.value?.messages && Array.isArray(ann.value.messages)) {
        setAnnouncements(ann.value.messages);
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Save Store Info
    await supabase.from('store_settings').upsert({
      key: 'store_info',
      value: storeInfo,
      description: 'Global Store Details and Social Links'
    });

    // Save Announcements
    await supabase.from('store_settings').upsert({
      key: 'announcement',
      value: { messages: announcements.filter(m => m.trim() !== '') },
      description: 'Announcement Bar Messages'
    });
    
    setSaving(false);
    alert('Settings saved successfully!');
  };

  const updateAnnouncement = (index: number, value: string) => {
    const newAnns = [...announcements];
    newAnns[index] = value;
    setAnnouncements(newAnns);
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, ""]);
  };

  const removeAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
  };

  if (loading) {
    return <div className="p-8 text-[#666666]">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Global Settings</h1>
          <p className="text-[#666666] text-sm">Manage store details, contact info, and announcement bars.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#111111] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* Store Info */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#EFEFEF] pb-4">
          <Globe className="w-5 h-5 text-[#C7A17A]" />
          <h2 className="font-serif text-xl text-[#111111]">Store Information</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#111111]">Store Name</label>
            <input 
              type="text" 
              value={storeInfo.name || ''}
              onChange={e => setStoreInfo({...storeInfo, name: e.target.value})}
              className="w-full border border-[#EFEFEF] p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#111111]">Support Email</label>
            <input 
              type="email" 
              value={storeInfo.email || ''}
              onChange={e => setStoreInfo({...storeInfo, email: e.target.value})}
              className="w-full border border-[#EFEFEF] p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#111111]">Support Phone</label>
            <input 
              type="text" 
              value={storeInfo.phone || ''}
              onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})}
              className="w-full border border-[#EFEFEF] p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-[#111111]">Instagram URL</label>
            <input 
              type="text" 
              value={storeInfo.instagram || ''}
              onChange={e => setStoreInfo({...storeInfo, instagram: e.target.value})}
              placeholder="https://instagram.com/yourbrand"
              className="w-full border border-[#EFEFEF] p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
            />
          </div>
        </div>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#EFEFEF] pb-4">
          <Megaphone className="w-5 h-5 text-[#C7A17A]" />
          <h2 className="font-serif text-xl text-[#111111]">Announcement Bar</h2>
        </div>
        
        <p className="text-sm text-[#666666]">These messages will rotate at the very top of your storefront.</p>
        
        <div className="space-y-3">
          {announcements.map((msg, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input 
                type="text" 
                value={msg}
                onChange={e => updateAnnouncement(idx, e.target.value)}
                placeholder="e.g. Free Shipping on orders over $500!"
                className="flex-1 border border-[#EFEFEF] p-2.5 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
              />
              <button 
                onClick={() => removeAnnouncement(idx)}
                className="p-2.5 text-[#999999] hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          
          <button 
            onClick={addAnnouncement}
            className="text-sm font-medium text-[#C7A17A] hover:text-[#111111] transition-colors mt-2 inline-block"
          >
            + Add another message
          </button>
        </div>
      </div>

    </div>
  );
}
