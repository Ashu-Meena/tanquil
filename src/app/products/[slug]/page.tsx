import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import ProductClient from "@/components/product/ProductClient";

interface ProductImage {
  url: string;
  color_name: string | null;
}

interface ProductVariant {
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
  stock_quantity: number | null;
}

interface ProductCategory {
  category_id: string;
  categories: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  slug: string;
  description: string | null;
  brand: string | null;
  fabric: string | null;
  tags: string[] | null;
  product_categories: ProductCategory[] | null;
  product_images: ProductImage[] | null;
  product_variants: ProductVariant[] | null;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", decodedSlug)
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
  const decodedSlug = decodeURIComponent(slug);
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
    .eq("slug", decodedSlug)
    .single<Product>();

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
    .limit(12);

  // 3. Format product for Client Component
  const colorImages: Record<string, string[]> = {};
  const images = productData.product_images?.map((img: ProductImage) => {
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
  productData.product_variants?.forEach((variant: ProductVariant) => {
    if (variant.color_name && variant.color_hex && !colorMap.has(variant.color_name)) {
      colorMap.set(variant.color_name, { name: variant.color_name, hex: variant.color_hex });
    }
  });
  const colors = Array.from(colorMap.values());

  // Extract unique sizes
  const sizesSet = new Set<string>();
  productData.product_variants?.forEach((variant: ProductVariant) => {
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
    variants: (productData.product_variants || []).map((v: ProductVariant) => ({
      color_name: v.color_name || '',
      size: v.size || '',
      stock_quantity: v.stock_quantity || 0,
    })),
    brand: productData.brand || undefined,
    fabric: productData.fabric || undefined,
    tags: productData.tags || undefined,
    details: ["Dry clean only", "Handle with care"],
  };

  const formattedRelated = relatedData?.map((rp: any) => {
    const images = rp.product_images?.map((img: ProductImage) => img.url) || [];
    
    const colorsMap = new Map<string, string>();
    if (rp.product_variants) {
      rp.product_variants.forEach((v: ProductVariant) => {
        if (v.color_name && !colorsMap.has(v.color_name)) {
          const matchingImg = rp.product_images?.find((img: ProductImage) => img.color_name === v.color_name);
          colorsMap.set(v.color_name, matchingImg?.url || images[0]);
        }
      });
    }

    const sizesSet = new Set<string>();
    if (rp.product_variants) {
      rp.product_variants.forEach((v: ProductVariant) => {
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
      images: images,
      colors: Array.from(colorsMap.entries()).map(([name, image]) => ({ name, image })),
      sizes: Array.from(sizesSet)
    };
  }) || [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": formattedProduct.name,
    "image": formattedProduct.images[0],
    "description": formattedProduct.description,
    "sku": formattedProduct.id,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": formattedProduct.price,
      "availability": formattedProduct.variants.reduce((acc, v) => acc + v.stock_quantity, 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductClient 
        product={formattedProduct} 
        relatedProducts={formattedRelated} 
      />
    </>
  );
}
