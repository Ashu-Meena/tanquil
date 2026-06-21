"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types/database";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
      
    if (!error) {
      fetchOrders();
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-10">
      <h1 className="text-3xl font-serif mb-10">Admin Dashboard - Orders</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#EFEFEF]">
        {orders.length === 0 ? (
          <p className="text-[#666666]">No orders found in the database.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EFEFEF] text-[#666666]">
                <th className="pb-4">Order ID</th>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Total</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Transaction ID</th>
                <th className="pb-4">Screenshot</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5]">
                  <td className="py-4 text-[#999999] text-xs">{order.id.slice(0, 8)}...</td>
                  <td className="py-4">
                    <p className="font-medium">{order.customer_name}</p>
                    <p className="text-xs text-[#666666]">{order.customer_phone}</p>
                  </td>
                  <td className="py-4 font-[family-name:var(--font-montserrat)]">₹{order.total}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider rounded-full ${
                      order.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-xs">{order.transaction_id || '-'}</td>
                  <td className="py-4">
                    {order.screenshot_url ? (
                      <a href={order.screenshot_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        View
                      </a>
                    ) : '-'}
                  </td>
                  <td className="py-4">
                    {order.status === 'pending_verification' && (
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Approve Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
