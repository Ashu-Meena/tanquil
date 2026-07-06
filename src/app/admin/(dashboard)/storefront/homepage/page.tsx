"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Layout, Type, Link as LinkIcon } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

interface HomepageSection {
  id?: string;
  section_type: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  is_active: boolean;
}

export default function CMSPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for Hero Banner
  const [heroData, setHeroData] = useState<HomepageSection>({
    section_type: 'hero',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    image_url: '',
    is_active: true
  });

  // States for Featured Collection
  const [featuredData, setFeaturedData] = useState<HomepageSection>({
    section_type: 'featured_collection',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    image_url: '',
    is_active: true
  });

  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('homepage_sections').select('*');
    if (data) {
      const hero = data.find(d => d.section_type === 'hero');
      if (hero) setHeroData(hero);
      const featured = data.find(d => d.section_type === 'featured_collection');
      if (featured) setFeaturedData(featured);
    }
    setLoading(false);
  };

  const saveSection = async (data: HomepageSection) => {
    setSaving(true);
    if (data.id) {
      await supabase.from('homepage_sections').update(data).eq('id', data.id);
    } else {
      const { data: newData, error } = await supabase.from('homepage_sections').insert([data]).select().single();
      if (newData) {
        if (data.section_type === 'hero') setHeroData(newData);
        if (data.section_type === 'featured_collection') setFeaturedData(newData);
      }
    }
    setSaving(false);
    alert('Saved successfully!');
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <h2 className="font-serif text-xl text-[#111111]">Hero Banner</h2>
          <button 
            onClick={() => saveSection(heroData)}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
              <input 
                type="text" 
                value={heroData.title}
                onChange={e => setHeroData({...heroData, title: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Subtitle</label>
              <textarea 
                value={heroData.subtitle}
                onChange={e => setHeroData({...heroData, subtitle: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Button Text</label>
                <input 
                  type="text" 
                  value={heroData.button_text}
                  onChange={e => setHeroData({...heroData, button_text: e.target.value})}
                  className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#111111] mb-2">Button Link</label>
                <input 
                  type="text" 
                  value={heroData.button_link}
                  onChange={e => setHeroData({...heroData, button_link: e.target.value})}
                  className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#111111] mb-2">Hero Image</label>
            <ImageUploader 
              value={heroData.image_url} 
              onChange={(url) => setHeroData({...heroData, image_url: url})} 
            />
            {heroData.image_url && (
              <div className="mt-4 aspect-video bg-gray-100 rounded-sm overflow-hidden">
                <img src={heroData.image_url} alt="Hero Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Featured Collection Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <h2 className="font-serif text-xl text-[#111111]">Featured Collection</h2>
          <button 
            onClick={() => saveSection(featuredData)}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
              <input 
                type="text" 
                value={featuredData.title}
                onChange={e => setFeaturedData({...featuredData, title: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#111111] mb-2">Subtitle</label>
              <textarea 
                value={featuredData.subtitle}
                onChange={e => setFeaturedData({...featuredData, subtitle: e.target.value})}
                className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] min-h-[100px]"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-[#111111] mb-2">Banner Image</label>
            <ImageUploader 
              value={featuredData.image_url} 
              onChange={(url) => setFeaturedData({...featuredData, image_url: url})} 
            />
            {featuredData.image_url && (
              <div className="mt-4 aspect-video bg-gray-100 rounded-sm overflow-hidden">
                <img src={featuredData.image_url} alt="Featured Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
