import React from "react";
import { Package, MoreVertical } from "lucide-react";

interface OrderRowProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenModal: (order: any) => void;
  statusDef: { label: string; color: string };
}

export const OrderRow = React.memo(function OrderRow({
  order,
  isSelected,
  onToggleSelect,
  onOpenModal,
  statusDef
}: OrderRowProps) {
  return (
    <tr className={`border-b border-border-light hover:bg-ivory transition-colors ${isSelected ? 'bg-ivory' : ''}`}>
      <td className="px-6 py-4">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => onToggleSelect(order.id)}
          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
        />
      </td>
      <td className="px-6 py-4 cursor-pointer" onClick={() => onOpenModal(order)}>
        <div className="flex items-center gap-2 font-medium text-rich-black">
          <Package className="w-4 h-4 text-gold" />
          #{order.order_number || order.id.slice(0, 8).toUpperCase()}
        </div>
      </td>
      <td className="px-6 py-4 text-neutral-500 cursor-pointer hidden md:table-cell" onClick={() => onOpenModal(order)}>
        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
      </td>
      <td className="px-6 py-4">
        <p className="font-medium text-rich-black">{order.customer_name}</p>
        <p className="text-xs text-neutral-500">{order.customer_email}</p>
        {order.shipping_address && (
          <p className="text-[10px] text-neutral-400 mt-1 max-w-[200px] truncate" title={`${order.shipping_address.address}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pin}`}>
            {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state}
          </p>
        )}
      </td>
      <td className="px-6 py-4 font-medium text-rich-black hidden md:table-cell">₹{order.total_amount?.toLocaleString('en-IN')}</td>
      <td className="px-6 py-4">
        <span className={`inline-block px-2 py-1 rounded-sm text-[11px] font-medium tracking-widest uppercase ${
          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
          order.payment_status === 'failed' || order.payment_status === 'refunded' ? 'bg-error/10 text-error' : 
          'bg-green-100 text-green-800'
        }`}>
          {order.payment_status || 'pending'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-block px-2 py-1 rounded-sm text-[11px] font-medium tracking-widest uppercase ${statusDef.color}`}>
          {statusDef.label}
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="text-neutral-400 hover:text-rich-black transition-colors p-2">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
});
