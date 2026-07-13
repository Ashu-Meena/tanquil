import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProductClient from "@/components/product/ProductClient";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} | Tranquil`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  // 1. Fetch Product with images, variants, and category
  const { data: productData, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name),
      product_images(url, color_name),
      product_variants(color_name, color_hex, size, stock_quantity)
    `)
    .eq("slug", slug)
    .single();

  if (error || !productData) {
    notFound();
  }

  // 2. Fetch Related Products (same category)
  const { data: relatedData } = await supabase
    .from("products")
    .select(`
      id, name, price, slug,
      product_images(url, color_name),
      product_variants(color_name)
    `)
    .eq("category_id", productData.category_id)
    .neq("id", productData.id)
    .limit(4);

  // 3. Format product for Client Component
  const colorImages: Record<string, string[]> = {};
  const images = productData.product_images?.map((img: any) => {
    const color = img.color_name || "Default";
    if (!colorImages[color]) colorImages[color] = [];
    colorImages[color].push(img.url);
    return img.url;
  }) || [];
  
  if (images.length === 0) {
    images.push("https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1200"); // Fallback
    colorImages["Default"] = [...images];
  }

  // Extract unique colors
  const colorMap = new Map();
  productData.product_variants?.forEach((variant: any) => {
    if (variant.color_name && variant.color_hex && !colorMap.has(variant.color_name)) {
      colorMap.set(variant.color_name, { name: variant.color_name, hex: variant.color_hex });
    }
  });
  const colors = Array.from(colorMap.values());

  // Extract unique sizes
  const sizesSet = new Set<string>();
  productData.product_variants?.forEach((variant: any) => {
    if (variant.size) sizesSet.add(variant.size);
  });
  const sizes = Array.from(sizesSet);
  sizes.push("Custom"); // Always allow Custom sizing for this luxury brand

  const formattedProduct = {
    id: productData.id,
    name: productData.name,
    price: productData.price,
    compare_at_price: productData.compare_at_price || null,
    category: productData.category?.name || "Clothing",
    description: productData.description || "",
    brand: productData.brand || null,
    tags: productData.tags || [],
    fabric: productData.fabric || null,
    images,
    colorImages,
    colors,
    sizes,
    variants: productData.product_variants || [],
    details: [],
  };

  const formattedRelated = relatedData?.map(rp => {
    const images = rp.product_images?.map((img: any) => img.url) || [];
    
    const colorsMap = new Map<string, string>();
    if (rp.product_variants) {
      rp.product_variants.forEach((v: any) => {
        if (!colorsMap.has(v.color_name)) {
          const matchingImg = rp.product_images?.find((img: any) => img.color_name === v.color_name);
          colorsMap.set(v.color_name, matchingImg?.url || images[0]);
        }
      });
    }

    return {
      id: rp.id,
      name: rp.name,
      price: rp.price,
      slug: rp.slug,
      images,
      colors: Array.from(colorsMap.entries()).map(([name, image]) => ({ name, image }))
    };
  }) || [];

  return (
    <ProductClient 
      product={formattedProduct} 
      relatedProducts={formattedRelated} 
    />
  );
}
