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
      product_categories(category_id, categories(name)),
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
      id, name, price, compare_at_price, slug,
      product_categories!inner(category_id),
      product_images(url, color_name),
      product_variants(color_name, size)
    `)
    .eq("product_categories.category_id", productData.product_categories?.[0]?.category_id || "")
    .neq("id", productData.id)
    .limit(4);

  // 3. Format product for Client Component
  const colorImages: Record<string, string[]> = {};
  const images = productData.product_images?.map((img: any) => {
    if (img.color_name) {
      if (!colorImages[img.color_name]) colorImages[img.color_name] = [];
      colorImages[img.color_name].push(img.url);
    }
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
    compare_at_price: productData.compare_at_price || undefined,
    category: (productData.product_categories && productData.product_categories.length > 0 && productData.product_categories[0].categories) ? productData.product_categories[0].categories.name : "Clothing",
    description: productData.description || "",
    images,
    colorImages,
    colors,
    sizes,
    variants: productData.product_variants || [],
    brand: productData.brand || undefined,
    fabric: productData.fabric || undefined,
    tags: productData.tags || undefined,
    details: ["Dry clean only", "Handle with care"],
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

    const sizesSet = new Set<string>();
    if (rp.product_variants) {
      rp.product_variants.forEach((v: any) => {
        if (v.size) sizesSet.add(v.size);
      });
    }

    return {
      id: rp.id,
      name: rp.name,
      price: rp.price,
      slug: rp.slug,
      compare_at_price: rp.compare_at_price || undefined,
      isSale: (rp.compare_at_price ?? 0) > rp.price,
      image: rp.product_images?.[0]?.url || "/placeholder.jpg",
      hoverImage: rp.product_images?.[1]?.url || rp.product_images?.[0]?.url,
      colors: Array.from(colorsMap.entries()).map(([name, image]) => ({ name, image })),
      sizes: Array.from(sizesSet)
    };
  }) || [];

  return (
    <ProductClient 
      product={formattedProduct} 
      relatedProducts={formattedRelated} 
    />
  );
}
