-- =======================================================================================
-- TRANQUIL LUXURY FASHION: PUBLIC READ POLICIES
-- =======================================================================================
-- This script enables Row Level Security (RLS) on public eCommerce tables 
-- and grants SELECT access so the storefront can display the data.
-- =======================================================================================

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Create policies for public READ access
CREATE POLICY "Allow public read access on categories"
ON public.categories FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on product_images"
ON public.product_images FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on homepage_sections"
ON public.homepage_sections FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on product_variants"
ON public.product_variants FOR SELECT
USING (true);
