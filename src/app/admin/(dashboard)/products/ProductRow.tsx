import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";

interface ProductRowProps {
  product: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string, name: string) => void;
}

export const ProductRow = React.memo(function ProductRow({
  product,
  isSelected,
  onToggleSelect,
  onDelete
}: ProductRowProps) {
  return (
    <tr className={`border-b border-border-light hover:bg-ivory transition-colors ${isSelected ? 'bg-ivory' : ''}`}>
      <td className="px-6 py-4">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(product.id)}
          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-16 bg-border-light relative rounded-sm overflow-hidden flex-shrink-0">
            {product.images && product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px]">No Img</div>
            )}
          </div>
          <div>
            <p className="font-medium text-rich-black">{product.name}</p>
            <p className="text-xs text-neutral-500">₹{product.price?.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-neutral-500 hidden md:table-cell">
        {product.sku || 'N/A'}
      </td>
      <td className="px-6 py-4 text-neutral-500 capitalize hidden md:table-cell">
        {product.categoryText}
      </td>
      <td className="px-6 py-4 hidden md:table-cell">
        {product.stock_quantity > 10 ? (
          <span className="text-green-600">{product.stock_quantity} in stock</span>
        ) : product.stock_quantity > 0 ? (
          <span className="text-yellow-600">Low stock ({product.stock_quantity})</span>
        ) : product.hasCustomSize ? (
          <span className="text-[#B38D66] font-medium">On Demand</span>
        ) : (
          <span className="text-error">Out of stock</span>
        )}
      </td>
      <td className="px-6 py-4">
        {product.status === 'draft' ? (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 rounded-sm text-[11px] font-medium tracking-widest uppercase">Draft</span>
        ) : (
          <span className="inline-block px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-sm text-[11px] font-medium tracking-widest uppercase">Active</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Link href={`/admin/products/${product.id}`} className="p-2 text-neutral-500 hover:text-gold transition-colors rounded-sm hover:bg-ivory">
            <Edit className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => onDelete(product.id, product.name)}
            className="p-2 text-neutral-500 hover:text-sale transition-colors rounded-sm hover:bg-error/10"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});
