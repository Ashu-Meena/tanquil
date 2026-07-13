import { createClient } from "@/utils/supabase/server";
import CollectionClient from "@/components/collection/CollectionClient";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch products and their categories
  let query = supabase
    .from("products")
    .select("*, product_categories!inner(category_id, categories(name, slug)), product_images(url, color_name), product_variants(color_name, size)")
    .eq("status", "active");

  // If not "all", "new" etc, filter by slug
  if (slug !== "all" && slug !== "new") {
    // Check if the slug maps to a real category
    const { data: catData } = await supabase.from("categories").select("id").eq("slug", slug).single();
    if (catData) {
      query = query.eq("product_categories.category_id", catData.id);
    }
  }

  const { data: products } = await query;

  const mappedProducts = products?.map((p: any) => {
    const images = p.product_images?.map((img: any) => img.url) || [];
    
    const colorsMap = new Map<string, string>();
    if (p.product_variants) {
      p.product_variants.forEach((v: any) => {
        if (!colorsMap.has(v.color_name)) {
          const matchingImg = p.product_images?.find((img: any) => img.color_name === v.color_name);
          colorsMap.set(v.color_name, matchingImg?.url || images[0]);
        }
      });
    }

    const sizesSet = new Set<string>();
    if (p.product_variants) {
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
