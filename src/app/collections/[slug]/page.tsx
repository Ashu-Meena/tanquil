import { createClient } from "@/utils/supabase/server";
import CollectionClient from "@/components/collection/CollectionClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  if (slug === "all") return { title: "All Products | Tranquil", description: "Shop all products at Tranquil." };
  if (slug === "new") return { title: "New Arrivals | Tranquil", description: "Shop the latest new arrivals at Tranquil." };

  const supabase = await createClient();
  const { data: category } = await supabase.from("categories").select("name").eq("slug", slug).single();
  
  const title = category?.name ? `${category.name} | Tranquil` : "Collection | Tranquil";
  return { title, description: `Shop the latest ${category?.name || "collection"} at Tranquil.` };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch products and their categories
  let query = supabase
    .from("products")
    .select("*, product_categories!inner(category_id, categories(name, slug)), product_images(url, color_name), product_variants(color_name, size)")
    .eq("status", "active");

  // If not "all", "new", "sale", "bestsellers" etc, filter by slug
  if (slug !== "all" && slug !== "new" && slug !== "sale" && slug !== "bestsellers") {
    // Check if the slug maps to a real category
    const { data: catData } = await supabase.from("categories").select("id").eq("slug", slug).single();
    if (catData) {
      query = query.eq("product_categories.category_id", catData.id);
    } else {
      // If it's an invalid slug, return no products instead of all products
      query = query.eq("id", "00000000-0000-0000-0000-000000000000"); 
    }
  } else if (slug === "new") {
    query = query.eq("is_featured", true);
  } else if (slug === "sale") {
    // We filter sale products after fetching because compare_at_price > price requires it 
    // unless we use a raw query, but for now we fetch all active and filter later
  } else if (slug === "bestsellers") {
    query = query.eq("is_bestseller", true);
  }

  let { data: products } = await query;
  if (slug === "sale" && products) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products = products.filter((p: any) => p.compare_at_price > p.price);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mappedProducts = products?.map((p: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const images = p.product_images?.map((img: any) => img.url) || [];
    
    const colorsMap = new Map<string, string>();
    if (p.product_variants) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.product_variants.forEach((v: any) => {
        if (!colorsMap.has(v.color_name)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const matchingImg = p.product_images?.find((img: any) => img.color_name === v.color_name);
          colorsMap.set(v.color_name, matchingImg?.url || images[0]);
        }
      });
    }

    const sizesSet = new Set<string>();
    if (p.product_variants) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      p.product_variants.forEach((v: any) => {
        if (v.size) sizesSet.add(v.size);
      });
    }

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      images,
      colors: Array.from(colorsMap.entries()).map(([name, image]) => ({ name, image })),
      sizes: Array.from(sizesSet),
      isNew: p.is_featured,
      isSale: p.compare_at_price > p.price,
      category: (p.product_categories && p.product_categories.length > 0 && p.product_categories[0].categories) ? p.product_categories[0].categories.name : "Uncategorized"
    };
  }) || [];

  return <CollectionClient slug={slug} initialProducts={mappedProducts} />;
}
