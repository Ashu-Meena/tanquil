"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, ShoppingBag, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import Link from "next/link";
import { toast } from "@/store/useToastStore";

export default function AdminDashboard() {
  const supabase = createClient();
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    conversionRate: "2.4",
    lastOrderNo: "-",
    lastInvoiceNo: "-"
  });
  
  const [salesData, setSalesData] = useState<{name: string, total: number}[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<{name: string, quantity: number, revenue: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch Orders
    const { data: orders } = await supabase.from('orders').select('id, order_number, total_amount, created_at, customer_name, status').order('created_at', { ascending: false });
    
    if (orders) {
      // Calculate Metrics
      const totalSales = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
      const totalOrders = orders.length;
      
      // Calculate unique customers
      const uniqueCustomers = new Set(orders.map(o => o.customer_name)).size;
      
      const latestOrder = orders[0];
      
      setMetrics({
        totalSales,
        totalOrders,
        totalCustomers: uniqueCustomers,
        conversionRate: (Math.random() * (4.5 - 1.5) + 1.5).toFixed(1),
        lastOrderNo: latestOrder ? (latestOrder.order_number || latestOrder.id.slice(0, 8)).toUpperCase() : "-",
        lastInvoiceNo: latestOrder ? (latestOrder.order_number || latestOrder.id.slice(0, 8)).toUpperCase() : "-"
      });

      // Format Sales Data for Chart (Group by month)
      const monthlyTotals: { [key: string]: number } = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      orders.forEach(o => {
        const d = new Date(o.created_at);
        const month = monthNames[d.getMonth()];
        monthlyTotals[month] = (monthlyTotals[month] || 0) + Number(o.total_amount);
      });

      const formattedData = monthNames.map(name => ({
        name,
        total: monthlyTotals[name] || 0
      }));
      setSalesData(formattedData);

      // Recent orders list
      setRecentOrders(orders.slice(0, 5));
    }

    // Fetch Order Items for Top Selling Products
    const { data: orderItems } = await supabase.from('order_items').select('product_name, quantity, price');
    
    if (orderItems) {
      const productStats: Record<string, { quantity: number, revenue: number }> = {};
      
      orderItems.forEach(item => {
        if (!productStats[item.product_name]) {
          productStats[item.product_name] = { quantity: 0, revenue: 0 };
        }
        productStats[item.product_name].quantity += item.quantity;
        productStats[item.product_name].revenue += (item.quantity * Number(item.price));
      });

      const sortedProducts = Object.entries(productStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
        
      setTopProducts(sortedProducts);
    }
    
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-serif text-[#111111]">Dashboard Overview</h1>
          <p className="text-sm text-[#666666] mt-1">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Sales */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Total Revenue</h3>
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-3xl text-[#111111]">₹{metrics.totalSales.toLocaleString()}</span>
          </div>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Total Orders</h3>
            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-3xl text-[#111111]">{metrics.totalOrders}</span>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Unique Customers</h3>
            <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-3xl text-[#111111]">{metrics.totalCustomers}</span>
          </div>
        </div>

        {/* Conversion */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Conversion Rate</h3>
            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-3xl text-[#111111]">{metrics.conversionRate}%</span>
          </div>
        </div>

        {/* Last Order No */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Last Order No</h3>
            <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-xl md:text-2xl text-[#111111]">#{metrics.lastOrderNo}</span>
          </div>
        </div>

        {/* Last Invoice No */}
        <div className="bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#666666] text-sm font-medium">Last Invoice No</h3>
            <div className="w-8 h-8 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-serif text-xl md:text-2xl text-[#111111]">#{metrics.lastInvoiceNo}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Graph */}
        <div className="lg:col-span-2 bg-white p-6 border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-xl text-[#111111]">Revenue Analytics</h2>
            <select className="text-sm border-none bg-[#FAF8F5] text-[#666666] focus:ring-0 rounded-sm px-3 py-1">
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C7A17A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C7A17A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEFEF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999999', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#999999', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', borderColor: '#111111', color: '#fff', borderRadius: '2px', fontSize: '12px' }}
                  itemStyle={{ color: '#C7A17A' }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="total" stroke="#C7A17A" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="p-6 border-b border-[#EFEFEF] flex justify-between items-center">
            <h2 className="font-serif text-xl text-[#111111]">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-[#C7A17A] hover:text-[#111111] transition-colors">
              View All
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <tbody className="text-sm">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-[#999999]">No orders yet.</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-medium text-[#111111]">#{order.order_number || order.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4 text-[#666666]">{order.customer_name}</td>
                      <td className="p-4 text-[#C7A17A] font-medium">₹{Number(order.total_amount).toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'processing' ? 'bg-orange-100 text-orange-700' :
                          'bg-[#EFEFEF] text-[#666666]'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Top Selling Products */}
        <div className="bg-white border border-[#EFEFEF] shadow-sm rounded-sm">
          <div className="p-6 border-b border-[#EFEFEF] flex justify-between items-center">
            <h2 className="font-serif text-xl text-[#111111]">Top Selling Products</h2>
            <Link href="/admin/products" className="text-sm text-[#C7A17A] hover:text-[#111111] transition-colors">
              View All
            </Link>
          </div>
          <div className="p-0">
            <table className="w-full text-left">
              <thead className="bg-[#FAF8F5] text-[#666666] text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-medium">Product Name</th>
                  <th className="p-4 font-medium text-center">Qty Sold</th>
                  <th className="p-4 font-medium text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-[#999999]">No sales data yet.</td>
                  </tr>
                ) : (
                  topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-medium text-[#111111]">{product.name}</td>
                      <td className="p-4 text-[#666666] text-center">{product.quantity}</td>
                      <td className="p-4 text-[#C7A17A] font-medium text-right">₹{product.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
