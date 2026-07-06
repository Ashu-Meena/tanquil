import HeroSection from "@/components/home/HeroSection";
import TrendingMosaic from "@/components/home/TrendingMosaic";
import BestSellers from "@/components/home/BestSellers";
import ShopByCategory from "@/components/home/ShopByCategory";
import NewCollection from "@/components/home/NewCollection";
import FashionStories from "@/components/home/FashionStories";
import Lookbook from "@/components/home/Lookbook";
import Reviews from "@/components/home/Reviews";
import WhyChooseUs from "@/components/home/WhyChooseUs";
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
    image_url: s.image_url,
    title: s.title,
    subtitle: s.subtitle
  })) || [];

  const trendingEdits = sections?.filter(s => s.section_type === 'trending').map((s, index) => {
    // Map to the classes expected by TrendingMosaic based on position
    const classes = [
      "col-span-1 md:col-span-2 row-span-2 aspect-[3/4] md:aspect-auto",
      "col-span-1 row-span-1 aspect-square",
      "col-span-1 row-span-1 aspect-square",
      "col-span-1 row-span-1 aspect-[3/4]",
      "col-span-1 md:col-span-2 row-span-1 aspect-[16/9] md:aspect-[21/9]"
    ];
    return {
      id: s.id,
      title: s.title,
      slug: s.subtitle || 'all',
      image: s.image_url,
      className: classes[index % classes.length]
    };
  }) || [];

  // Fetch Categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .limit(4);

  const mappedCategories = categories?.map(c => ({
    id: c.id,
    title: c.name,
    image: c.image_url,
    link: `/collections/${c.slug}`
  })) || [];

  // Fetch Best Sellers (trending products)
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(url)")
    .eq("is_trending", true)
    .eq("status", "active")
    .limit(10);

  const mappedProducts = products?.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.product_images?.map((img: any) => img.url) || [],
    isNew: p.is_featured,
    isSale: p.compare_at_price > p.price
  })) || [];

  return (
    <>
      <HeroSection slides={heroSlides} />
      <TrendingMosaic collections={trendingEdits} />
      <BestSellers products={mappedProducts} />
      <ShopByCategory categories={mappedCategories} />
      <NewCollection initialData={mappedProducts} />
      <FashionStories />
      <Lookbook />
      <Reviews />
      <WhyChooseUs />
    </>
  );
}
