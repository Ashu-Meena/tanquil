import { createClient } from "@/utils/supabase/server";
import CollectionClient from "@/components/collection/CollectionClient";

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch products and their categories
  let query = supabase
    .from("products")
    .select("*, categories!inner(*), product_images(url)")
    .eq("status", "active");

  // If not "all", "new" etc, filter by slug
  if (slug !== "all" && slug !== "new") {
    // Check if the slug maps to a real category
    const { data: catData } = await supabase.from("categories").select("id").eq("slug", slug).single();
    if (catData) {
      query = query.eq("category_id", catData.id);
    }
  }

  const { data: products } = await query;

  const mappedProducts = products?.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    images: p.product_images?.map((img: any) => img.url) || [],
    isNew: p.is_featured,
    isSale: p.compare_at_price > p.price,
    category: p.categories?.name || "Uncategorized"
  })) || [];

  return <CollectionClient slug={slug} initialProducts={mappedProducts} />;
}
