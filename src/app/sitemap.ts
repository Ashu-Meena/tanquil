import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tranquil.co.in';
  
  // Basic static routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/faq',
    '/terms',
    '/privacy',
    '/shipping',
    '/returns',
    '/contact',
    '/collections/all',
    '/collections/new',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  try {
    const supabase = await createClient();
    
    // Fetch active products
    const { data: products } = await supabase
      .from('products')
      .select('slug, updated_at')
      .eq('status', 'active');
      
    if (products) {
      const productRoutes = products.map((product) => ({
        url: `${baseUrl}/products/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
      routes.push(...productRoutes);
    }

    // Fetch active categories
    const { data: categories } = await supabase
      .from('categories')
      .select('slug');
      
    if (categories) {
      const categoryRoutes = categories.map((category) => ({
        url: `${baseUrl}/collections/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
      routes.push(...categoryRoutes);
    }
  } catch (error) {
    console.error("Failed to generate dynamic sitemap routes", error);
  }

  return routes;
}
