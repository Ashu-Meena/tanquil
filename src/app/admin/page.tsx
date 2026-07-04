"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ShieldAlert, Package, CheckCircle2, XCircle, Truck, LogOut } from "lucide-react";

interface Order {
  id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  utr_number?: string;
  shipping_address?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    pin?: string;
  };
  items?: Array<{ name: string; size: string; quantity: number; price: number }>;
  created_at?: string;
}

const STATUS_OPTIONS = [
  { value: "pending_verification", label: "Pending Verification", color: "bg-yellow-100 text-yellow-800" },
  { value: "processing", label: "Processing", color: "bg-blue-100 text-blue-800" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
];

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // If this page loads, the middleware already verified the secure HTTP-only cookie
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      setIsLoggingOut(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s.value] = orders.filter(o => o.status === s.value).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#FAF8F5] pt-24 pb-20">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-serif text-4xl text-[#111111] mb-2">Admin Dashboard</h1>
            <p className="text-[#666666] text-sm">Tranquil Order Management</p>
          </div>
          <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="flex items-center gap-2 text-sm text-[#666666] hover:text-[#E63946] transition-colors disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" /> {isLoggingOut ? "Signing Out..." : "Sign Out"}
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
          {STATUS_OPTIONS.map(s => (
            <div key={s.value} className="bg-white border border-[#EFEFEF] p-4 text-center rounded-sm">
              <p className="font-bold text-2xl text-[#111111]">{statusCounts[s.value] ?? 0}</p>
              <p className="text-xs text-[#666666] mt-1 uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#EFEFEF] shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-[#EFEFEF]">
            <h2 className="font-serif text-xl text-[#111111]">All Orders ({orders.length})</h2>
            <button onClick={fetchOrders} className="text-xs uppercase tracking-widest text-[#666666] hover:text-[#C7A17A] transition-colors">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#666666]">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-[#666666]">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#FAF8F5]">
                  <tr className="text-left border-b border-[#EFEFEF]">
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Order</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Customer</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Date</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Total</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Payment</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Status</th>
                    <th className="px-6 py-4 font-medium text-[#111111] uppercase tracking-widest text-[11px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const statusDef = STATUS_OPTIONS.find(s => s.value === order.status) ?? STATUS_OPTIONS[0];
                    return (
                      <>
                        <tr key={order.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                              className="font-medium text-[#111111] hover:text-[#C7A17A] transition-colors flex items-center gap-1"
                            >
                              <Package className="w-4 h-4" />
                              #{order.id.slice(0, 8).toUpperCase()}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-medium text-[#111111]">{order.user_name}</p>
                            <p className="text-[#666666] text-xs">{order.user_email}</p>
                          </td>
                          <td className="px-6 py-4 text-[#666666]">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td className="px-6 py-4 font-medium text-[#111111]">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                          <td className="px-6 py-4 text-[#666666] capitalize">
                            {order.payment_method}
                            {order.utr_number && <span className="block text-xs text-[#C7A17A]">UTR: {order.utr_number}</span>}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-1 rounded-full text-[11px] font-medium ${statusDef.color}`}>
                              {statusDef.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={order.status}
                              onChange={e => updateStatus(order.id, e.target.value)}
                              className="border border-[#EFEFEF] px-2 py-1 text-xs focus:outline-none focus:border-[#C7A17A] bg-white"
                            >
                              {STATUS_OPTIONS.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                        {expandedOrder === order.id && (
                          <tr key={`${order.id}-details`} className="bg-[#FAF8F5] border-b border-[#EFEFEF]">
                            <td colSpan={7} className="px-6 py-6">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                  <h4 className="font-medium text-[#111111] uppercase tracking-widest text-[11px] mb-3">Shipping Address</h4>
                                  {order.shipping_address ? (
                                    <div className="text-[#666666] space-y-1">
                                      <p>{order.shipping_address.name}</p>
                                      <p>{order.shipping_address.address}</p>
                                      <p>{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pin}</p>
                                    </div>
                                  ) : <p className="text-[#999999]">No address data</p>}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#111111] uppercase tracking-widest text-[11px] mb-3">Items Ordered</h4>
                                  {order.items && order.items.length > 0 ? (
                                    <ul className="text-[#666666] space-y-1">
                                      {order.items.map((item, i) => (
                                        <li key={i}>{item.name} × {item.quantity} ({item.size}) — ₹{item.price?.toLocaleString('en-IN')}</li>
                                      ))}
                                    </ul>
                                  ) : <p className="text-[#999999]">No item data</p>}
                                </div>
                                <div>
                                  <h4 className="font-medium text-[#111111] uppercase tracking-widest text-[11px] mb-3">Customer</h4>
                                  <div className="text-[#666666] space-y-1">
                                    <p>{order.user_name}</p>
                                    <p>{order.user_email}</p>
                                    <p>{order.user_phone}</p>
                                  </div>
                                  <div className="flex gap-2 mt-4">
                                    <button
                                      onClick={() => updateStatus(order.id, "delivered")}
                                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 text-xs hover:bg-green-700 transition-colors"
                                    >
                                      <CheckCircle2 className="w-3 h-3" /> Mark Delivered
                                    </button>
                                    <button
                                      onClick={() => updateStatus(order.id, "cancelled")}
                                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 text-xs hover:bg-red-700 transition-colors"
                                    >
                                      <XCircle className="w-3 h-3" /> Cancel
                                    </button>
                                    <button
                                      onClick={() => updateStatus(order.id, "shipped")}
                                      className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 text-xs hover:bg-purple-700 transition-colors"
                                    >
                                      <Truck className="w-3 h-3" /> Mark Shipped
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-8 flex items-start gap-3 text-sm text-[#666666] bg-green-50 border border-green-200 p-4">
          <ShieldAlert className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p>
            This admin panel is now secured with a proper Server-Side HttpOnly Session Cookie + Middleware Guard. The password never touches the client side bundle.
          </p>
        </div>
      </div>
    </div>
  );
}
