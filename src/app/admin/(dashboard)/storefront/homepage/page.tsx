"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, Layout, Type, Link as LinkIcon } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { toast } from "@/store/useToastStore";

interface HomepageSection {
  id?: string;
  section_type: string;
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  image_url: string;
  is_active: boolean;
  display_order?: number;
}

export default function HomepageManager() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for Hero Banner
  const [heroData, setHeroData] = useState<HomepageSection[]>(
    Array(3).fill(null).map((_, i) => ({
      section_type: 'hero',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      image_url: '',
      is_active: true,
      display_order: i + 1
    }))
  );

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

  // States for Trending Mosaic
  const [trendingData, setTrendingData] = useState<HomepageSection[]>(
    Array(5).fill(null).map((_, i) => ({
      section_type: 'trending',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      image_url: '',
      is_active: true,
      display_order: i + 1
    }))
  );

  // States for Editorials
  const [editorialData, setEditorialData] = useState<HomepageSection[]>(
    Array(2).fill(null).map((_, i) => ({
      section_type: 'editorial',
      title: '',
      subtitle: '',
      button_text: i === 0 ? 'left' : 'right', // align
      button_link: '',
      image_url: '',
      is_active: true,
      display_order: i + 1
    }))
  );

  // States for Testimonials
  const [testimonialData, setTestimonialData] = useState<HomepageSection[]>(
    Array(3).fill(null).map((_, i) => ({
      section_type: 'testimonial',
      title: '',
      subtitle: '',
      button_text: '', // product name
      button_link: '',
      image_url: '',
      is_active: true,
      display_order: i + 1
    }))
  );

  // States for Instagram Feed
  const [instagramData, setInstagramData] = useState<HomepageSection[]>(
    Array(4).fill(null).map((_, i) => ({
      section_type: 'instagram',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      image_url: '',
      is_active: true,
      display_order: i + 1
    }))
  );

  useEffect(() => {
    fetchCMSData();
  }, []);

  const fetchCMSData = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('homepage_sections').select('*');
    if (data) {
      const hero = data.filter(d => d.section_type === 'hero').sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      if (hero.length > 0) {
        setHeroData(prev => prev.map((p, i) => hero[i] || p));
      }
      const featured = data.find(d => d.section_type === 'featured_collection');
      if (featured) setFeaturedData(featured);
      const trending = data.filter(d => d.section_type === 'trending').sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      if (trending.length > 0) {
        setTrendingData(prev => prev.map((p, i) => trending[i] || p));
      }
      const editorial = data.filter(d => d.section_type === 'editorial').sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      if (editorial.length > 0) {
        setEditorialData(prev => prev.map((p, i) => editorial[i] || p));
      }
      const testimonial = data.filter(d => d.section_type === 'testimonial').sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      if (testimonial.length > 0) {
        setTestimonialData(prev => prev.map((p, i) => testimonial[i] || p));
      }
      const instagram = data.filter(d => d.section_type === 'instagram').sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      if (instagram.length > 0) {
        setInstagramData(prev => prev.map((p, i) => instagram[i] || p));
      }
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
    toast.success('Saved successfully!');
  };

  const saveHeroBanner = async () => {
    setSaving(true);
    await saveArray(heroData);
    setSaving(false);
    toast.success('Hero Banner saved successfully!');
  };

  const saveTrendingMosaic = async () => {
    setSaving(true);
    await saveArray(trendingData);
    setSaving(false);
    toast.success('Trending Mosaic saved successfully!');
  };

  const saveEditorial = async () => {
    setSaving(true);
    await saveArray(editorialData);
    setSaving(false);
    toast.success('Editorial Stories saved successfully!');
  };

  const saveTestimonials = async () => {
    setSaving(true);
    await saveArray(testimonialData);
    setSaving(false);
    toast.success('Testimonials saved successfully!');
  };

  const saveInstagram = async () => {
    setSaving(true);
    await saveArray(instagramData);
    setSaving(false);
    toast.success('Instagram Feed saved successfully!');
  };

  const saveArray = async (items: HomepageSection[]) => {
    for (const item of items) {
      if (item.id) {
        await supabase.from('homepage_sections').update(item).eq('id', item.id);
      } else if (item.image_url || item.title || item.subtitle) {
        const { data, error } = await supabase.from('homepage_sections').insert([item]).select().single();
        if (error) {
          console.error("Save error:", error);
          toast.error("Failed to complete operation. Please try again or check the logs.");
        }
        if (data) {
          item.id = data.id;
        }
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Banner Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <div>
            <h2 className="font-serif text-xl text-[#111111]">Hero Banner</h2>
            <p className="text-sm text-[#666666]">Manage the 3-slide carousel on the storefront.</p>
          </div>
          <button 
            onClick={saveHeroBanner}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save Banner
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {heroData.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 border border-[#EFEFEF] rounded-sm">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#111111]">Slide {index + 1}</h3>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
                    <input 
                      type="text" 
                      value={item.title || ""}
                      onChange={e => {
                        const newData = [...heroData];
                        newData[index].title = e.target.value;
                        setHeroData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Subtitle</label>
                    <textarea 
                      value={item.subtitle || ""}
                      onChange={e => {
                        const newData = [...heroData];
                        newData[index].subtitle = e.target.value;
                        setHeroData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] min-h-[100px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-2">Button Text</label>
                      <input 
                        type="text" 
                        value={item.button_text || ""}
                        onChange={e => {
                          const newData = [...heroData];
                          newData[index].button_text = e.target.value;
                          setHeroData(newData);
                        }}
                        className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#111111] mb-2">Button Link</label>
                      <input 
                        type="text" 
                        value={item.button_link || ""}
                        onChange={e => {
                          const newData = [...heroData];
                          newData[index].button_link = e.target.value;
                          setHeroData(newData);
                        }}
                        className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#111111] mb-2">Slide Image</label>
                  <ImageUploader 
                    value={item.image_url || ""} 
                    onChange={(url) => {
                      const newData = [...heroData];
                      newData[index].image_url = url;
                      setHeroData(newData);
                    }} 
                  />
                  {item.image_url && (
                    <div className="mt-4 aspect-video bg-gray-100 rounded-sm overflow-hidden">
                      <img src={item.image_url} alt="Slide Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
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

      {/* Trending Mosaic Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <div>
            <h2 className="font-serif text-xl text-[#111111]">Trending Mosaic</h2>
            <p className="text-sm text-[#666666]">Manage the 5-image collage on the homepage.</p>
          </div>
          <button 
            onClick={saveTrendingMosaic}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save Mosaic
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {trendingData.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 border border-[#EFEFEF] rounded-sm">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#111111]">Mosaic Tile {index + 1}</h3>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Title</label>
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={e => {
                        const newData = [...trendingData];
                        newData[index].title = e.target.value;
                        setTrendingData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Link Slug (e.g. 'clothing' or 'all')</label>
                    <input 
                      type="text" 
                      value={item.subtitle}
                      onChange={e => {
                        const newData = [...trendingData];
                        newData[index].subtitle = e.target.value;
                        setTrendingData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#111111] mb-2">Tile Image</label>
                  <ImageUploader 
                    value={item.image_url} 
                    onChange={(url) => {
                      const newData = [...trendingData];
                      newData[index].image_url = url;
                      setTrendingData(newData);
                    }} 
                  />
                  {item.image_url && (
                    <div className="mt-4 aspect-[4/3] w-48 bg-gray-100 rounded-sm overflow-hidden border border-[#EFEFEF]">
                      <img src={item.image_url} alt="Tile Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Editorial Stories Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <div>
            <h2 className="font-serif text-xl text-[#111111]">Fashion Stories (Editorial)</h2>
            <p className="text-sm text-[#666666]">Manage the 2 editorial blocks on the homepage.</p>
          </div>
          <button 
            onClick={saveEditorial}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save Stories
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {editorialData.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 border border-[#EFEFEF] rounded-sm">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#111111]">Story {index + 1}</h3>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Headline</label>
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={e => {
                        const newData = [...editorialData];
                        newData[index].title = e.target.value;
                        setEditorialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Description</label>
                    <textarea 
                      value={item.subtitle}
                      onChange={e => {
                        const newData = [...editorialData];
                        newData[index].subtitle = e.target.value;
                        setEditorialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Image Alignment (left or right)</label>
                    <select
                      value={item.button_text}
                      onChange={e => {
                        const newData = [...editorialData];
                        newData[index].button_text = e.target.value;
                        setEditorialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#111111] mb-2">Editorial Image</label>
                  <ImageUploader 
                    value={item.image_url} 
                    onChange={(url) => {
                      const newData = [...editorialData];
                      newData[index].image_url = url;
                      setEditorialData(newData);
                    }} 
                  />
                  {item.image_url && (
                    <div className="mt-4 aspect-video w-full bg-gray-100 rounded-sm overflow-hidden border border-[#EFEFEF]">
                      <img src={item.image_url} alt="Editorial Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <div>
            <h2 className="font-serif text-xl text-[#111111]">Tranquil Muses (Testimonials)</h2>
            <p className="text-sm text-[#666666]">Manage the 3 customer reviews on the homepage.</p>
          </div>
          <button 
            onClick={saveTestimonials}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save Reviews
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-8">
            {testimonialData.map((item, index) => (
              <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4 border border-[#EFEFEF] rounded-sm">
                <div className="space-y-4">
                  <h3 className="font-medium text-[#111111]">Review {index + 1}</h3>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Customer Name</label>
                    <input 
                      type="text" 
                      value={item.title}
                      onChange={e => {
                        const newData = [...testimonialData];
                        newData[index].title = e.target.value;
                        setTestimonialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Review Text</label>
                    <textarea 
                      value={item.subtitle}
                      onChange={e => {
                        const newData = [...testimonialData];
                        newData[index].subtitle = e.target.value;
                        setTestimonialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] min-h-[100px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#111111] mb-2">Product Name Bought</label>
                    <input 
                      type="text" 
                      value={item.button_text}
                      onChange={e => {
                        const newData = [...testimonialData];
                        newData[index].button_text = e.target.value;
                        setTestimonialData(newData);
                      }}
                      className="w-full border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-[#111111] mb-2">Customer Image</label>
                  <ImageUploader 
                    value={item.image_url} 
                    onChange={(url) => {
                      const newData = [...testimonialData];
                      newData[index].image_url = url;
                      setTestimonialData(newData);
                    }} 
                  />
                  {item.image_url && (
                    <div className="mt-4 aspect-square w-24 rounded-full bg-gray-100 overflow-hidden border border-[#EFEFEF]">
                      <img src={item.image_url} alt="Customer Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instagram Feed Section */}
      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#EFEFEF] flex justify-between items-center bg-[#FAF8F5]">
          <h2 className="font-serif text-xl text-[#111111]">Instagram Feed (Footer)</h2>
          <button 
            onClick={saveInstagram}
            disabled={saving}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 text-sm hover:bg-[#C7A17A] transition-colors rounded-sm"
          >
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
        <div className="p-6">
          <p className="text-sm text-[#666666] mb-6">Upload up to 4 images to show in your site footer. Enter the post link so users can click through to Instagram.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {instagramData.map((item, index) => (
              <div key={index} className="space-y-4 border border-[#EFEFEF] p-4 rounded-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#666666] uppercase tracking-widest">Post {index + 1}</span>
                </div>
                
                <ImageUploader 
                  value={item.image_url} 
                  onChange={(url) => {
                    const newData = [...instagramData];
                    newData[index].image_url = url;
                    setInstagramData(newData);
                  }} 
                />

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> Post URL
                  </label>
                  <input 
                    type="text" 
                    value={item.button_link}
                    onChange={(e) => {
                      const newData = [...instagramData];
                      newData[index].button_link = e.target.value;
                      setInstagramData(newData);
                    }}
                    placeholder="https://instagram.com/p/..."
                    className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
