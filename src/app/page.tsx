import HeroSection from "@/components/home/HeroSection";
import TrendingMosaic from "@/components/home/TrendingMosaic";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewCollection from "@/components/home/NewCollection";
import FashionStories from "@/components/home/FashionStories";
import Lookbook from "@/components/home/Lookbook";
import Reviews from "@/components/home/Reviews";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import VisitStore from "@/components/home/VisitStore";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  // Fetch Homepage Sections
  const { data: sections } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const heroSlides = sections?.filter(s => s.section_type === 'hero').map(s => ({
    id: s.id,
    image_url: s.image_url || "",
    title: s.title,
    subtitle: s.subtitle || ""
  })) || [];

  const trendingEdits = sections?.filter(s => s.section_type === 'trending').map((s, index, arr) => {
    // Dynamic styling based on total number of items to ensure no empty spaces
    let className = "col-span-1 row-span-1 aspect-square"; // fallback
    
    if (arr.length === 1) {
      className = "col-span-1 md:col-span-4 row-span-2 aspect-[16/9] md:aspect-[21/9]";
    } else if (arr.length === 2) {
      className = "col-span-1 md:col-span-2 row-span-2 aspect-[4/5]";
    } else if (arr.length === 3) {
      if (index === 0) className = "col-span-1 md:col-span-2 row-span-2 aspect-[3/4] md:aspect-auto";
      else className = "col-span-1 md:col-span-2 row-span-1 aspect-[16/9]";
    } else if (arr.length === 4) {
      if (index === 0) className = "col-span-1 md:col-span-2 row-span-2 aspect-[3/4] md:aspect-[4/5]";
      else if (index === 1 || index === 2) className = "col-span-1 md:col-span-1 row-span-1 aspect-square";
      else if (index === 3) className = "col-span-1 md:col-span-2 row-span-1 aspect-[16/9] md:aspect-[21/9]";
    } else {
      // 5 or more items
      if (index === 0) className = "col-span-1 md:col-span-2 row-span-2 aspect-[3/4] md:aspect-[4/5]";
      else if (index % 5 === 4) className = "col-span-1 md:col-span-2 row-span-1 aspect-[16/9] md:aspect-[21/9]";
      else className = "col-span-1 md:col-span-1 row-span-1 aspect-square";
    }

    return {
      id: s.id,
      title: s.title,
      slug: s.subtitle || 'all',
      image: s.image_url || "",
      className
    };
  }) || [];

  const editorialStories = sections?.filter(s => s.section_type === 'editorial').map(s => ({
    id: s.id,
    title: s.title,
    description: s.subtitle || "",
    image: s.image_url || "",
    align: s.button_text || 'left'
  })) || [];

  const testimonials = sections?.filter(s => s.section_type === 'testimonial').map(s => ({
    id: s.id,
    name: s.title,
    text: s.subtitle,
    product: s.button_text,
    image: s.image_url
  })) || [];

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const mappedCategories = categories?.map(c => ({
    id: c.id,
    title: c.name,
    image: c.image_url || "",
    link: `/collections/${c.slug}`
  })) || [];

  // Fetch Best Sellers (trending products)
  let products = [];
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_images(url, color_name), product_variants(color_name)")
      .eq("is_featured", true)
      .eq("status", "active")
      .limit(10);
      
    if (!error && data) {
      products = data;
    } else if (error) {
      console.error("Error fetching featured products:", error);
    }
  } catch (error) {
    console.error("Error fetching featured products:", error);
  }

  const mappedProducts = products?.map(p => {
    const images = p.product_images?.map((img: any) => img.url) || [];
    
    // Extract unique colors with their first image
    const colorsMap = new Map<string, string>();
    if (p.product_variants) {
      p.product_variants.forEach((v: any) => {
        if (!colorsMap.has(v.color_name)) {
          const matchingImg = p.product_images?.find((img: any) => img.color_name === v.color_name);
          colorsMap.set(v.color_name, matchingImg?.url || images[0]);
        }
      });
    }

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      images,
      colors: Array.from(colorsMap.entries()).map(([name, image]) => ({ name, image })),
      isNew: p.is_featured,
      isSale: (p.compare_at_price ?? 0) > p.price
    };
  }) || [];
  const instagramItems = sections?.filter(s => s.section_type === 'instagram').slice(0, 4).map((s, index) => ({
    id: s.id,
    url: s.image_url || "",
    link: s.button_link || 'https://instagram.com/tranquil.co.in',
    height: index % 2 === 0 ? 'h-[400px]' : 'h-[500px]'
  })) || [];

  // Fetch Reviews
  const { data: dbReviews } = await supabase
    .from("reviews")
    .select("id, rating, title, comment, profiles(first_name, last_name, avatar_url), products(name)")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(4);

  const realReviews = dbReviews?.map((r: any) => ({
    id: r.id,
    name: r.profiles ? `${r.profiles.first_name || ''} ${r.profiles.last_name || ''}`.trim() || 'Anonymous' : 'Anonymous',
    text: r.comment,
    product: r.products?.name,
    image: r.profiles?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"
  })) || [];

  return (
    <>
      <HeroSection slides={heroSlides} />
      <TrendingMosaic collections={trendingEdits} />
      <BestSellers products={mappedProducts} />
      <ShopByCategory categories={mappedCategories} />
      <NewCollection initialData={mappedProducts} />
      {editorialStories.length > 0 ? <FashionStories stories={editorialStories} /> : <FashionStories />}
      <Lookbook items={instagramItems} />
      {realReviews.length > 0 ? <Reviews reviews={realReviews} /> : <Reviews />}
      <VisitStore />
      <WhyChooseUs />
    </>
  );
}
