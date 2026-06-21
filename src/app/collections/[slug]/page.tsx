import Image from "next/image";
import ProductCard from "@/components/product/ProductCard";
import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from "lucide-react";

// Placeholder data for the collection page
const collectionProducts = Array.from({ length: 12 }).map((_, i) => ({
  id: `col-prod-${i}`,
  name: `Luxury Piece ${i + 1}`,
  price: 2999 + (i * 1000),
  images: [
    `https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop&sig=${i}`,
    `https://images.unsplash.com/photo-1588117260148-b47818741c74?q=80&w=600&auto=format&fit=crop&sig=${i}`
  ],
  isNew: i % 3 === 0,
  isSale: i % 5 === 0
}));

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collectionName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Banner */}
      <div className="relative w-full h-[40vh] md:h-[50vh] bg-[#FAF8F5]">
        <Image 
          src="https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2000" 
          alt="Collection Banner"
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center px-6">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-6xl text-white mb-4 tracking-wide">
              {collectionName}
            </h1>
            <p className="text-white/90 text-sm md:text-base font-light tracking-widest uppercase">
              Discover our latest curation of statement pieces designed for elegance.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-12 py-12">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#EFEFEF] pb-6 mb-8 gap-4 text-sm uppercase tracking-widest font-medium text-[#111111]">
          <button className="flex items-center gap-2 hover:text-[#C7A17A] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filter By
          </button>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-[#666666]">
              <span>{collectionProducts.length} Products</span>
            </div>
            
            <div className="flex items-center gap-2 cursor-pointer hover:text-[#C7A17A] transition-colors">
              Sort By: Featured
              <ChevronDown className="w-4 h-4" />
            </div>

            <div className="hidden md:flex items-center gap-2 border-l border-[#EFEFEF] pl-6 text-[#666666]">
              <button className="hover:text-[#111111] transition-colors text-[#111111]">
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button className="hover:text-[#111111] transition-colors">
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-64 flex-shrink-0 space-y-10">
            {/* Category Filter */}
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Category</h3>
              <ul className="space-y-3 text-[#666666]">
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Dresses (12)</label></li>
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Co-ord Sets (5)</label></li>
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Tops (8)</label></li>
              </ul>
            </div>
            
            {/* Price Filter */}
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Price</h3>
              <ul className="space-y-3 text-[#666666]">
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Under ₹5,000</label></li>
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> ₹5,000 - ₹10,000</label></li>
                <li><label className="flex items-center gap-3 cursor-pointer hover:text-[#111111]"><input type="checkbox" className="accent-[#C7A17A]" /> Over ₹10,000</label></li>
              </ul>
            </div>

            {/* Size Filter */}
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Size</h3>
              <div className="grid grid-cols-4 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                  <button key={size} className="border border-[#EFEFEF] py-2 text-xs uppercase tracking-widest hover:border-[#111111] transition-colors">
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div>
              <h3 className="font-serif text-xl mb-4 border-b border-[#EFEFEF] pb-2">Color</h3>
              <div className="flex flex-wrap gap-3">
                <button className="w-8 h-8 rounded-full bg-black ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-white border border-[#EFEFEF] ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-[#C7A17A] ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-red-800 ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all"></button>
                <button className="w-8 h-8 rounded-full bg-blue-900 ring-1 ring-offset-2 ring-transparent hover:ring-[#111111] transition-all"></button>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12">
              {collectionProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-16 border-t border-[#EFEFEF] pt-10 flex justify-center">
              <button className="border border-[#111111] px-10 py-4 uppercase tracking-widest text-sm font-medium hover:bg-[#111111] hover:text-white transition-colors duration-300">
                Load More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
