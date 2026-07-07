"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Package, Search, Filter, Printer, ExternalLink, MoreVertical, Check, X } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_method: string;
  utr_number?: string;
  shipping_address?: any;
  items?: any[];
  created_at?: string;
  notes?: string;
  tracking_id?: string;
  courier_name?: string;
  transaction_id?: string;
  screenshot_url?: string;
}

const STATUS_OPTIONS = [
  { value: "pending_verification", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "packed", label: "Packed", color: "bg-indigo-100 text-indigo-800" },
  { value: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-800" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-pink-100 text-pink-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
  { value: "returned", label: "Returned", color: "bg-gray-200 text-gray-800" },
  { value: "refunded", label: "Refunded", color: "bg-orange-100 text-orange-800" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [courierName, setCourierName] = useState("");
  const [updating, setUpdating] = useState(false);
  
  // Bulk Actions State
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const saveFulfillmentDetails = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    const supabase = createClient();
    await supabase.from("orders").update({ 
      notes: internalNotes,
      tracking_id: trackingId,
      courier_name: courierName
    }).eq("id", selectedOrder.id);
    
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { 
      ...o, notes: internalNotes, tracking_id: trackingId, courier_name: courierName 
    } : o));
    
    setSelectedOrder(prev => prev ? { 
      ...prev, notes: internalNotes, tracking_id: trackingId, courier_name: courierName 
    } : null);
    setUpdating(false);
  };

  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setInternalNotes(order.notes || "");
    setTrackingId(order.tracking_id || "");
    setCourierName(order.courier_name || "");
  };

  const printInvoice = () => {
    const printContent = document.getElementById("invoice-content");
    if (!printContent) return;
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Reload to restore React bindings after print hack
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
                          o.id.toLowerCase().includes(search.toLowerCase()) ||
                          (o.customer_email && o.customer_email.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oid => oid !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const applyBulkAction = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    setUpdating(true);
    const supabase = createClient();
    
    // Update all selected orders
    await Promise.all(selectedOrders.map(id => 
      supabase.from("orders").update({ status: bulkStatus }).eq("id", id)
    ));
    
    setOrders(prev => prev.map(o => selectedOrders.includes(o.id) ? { ...o, status: bulkStatus } : o));
    setSelectedOrders([]);
    setBulkStatus("");
    setUpdating(false);
    alert("Orders updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#111111] mb-1">Orders</h1>
          <p className="text-[#666666] text-sm">Manage and fulfill customer orders</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-[#EFEFEF] px-4 py-2 rounded-sm text-center">
            <p className="text-[10px] text-[#999999] uppercase tracking-widest">Pending</p>
            <p className="font-bold text-[#111111]">{orders.filter(o => o.status === 'pending_verification' || o.status === 'confirmed').length}</p>
          </div>
          <div className="bg-white border border-[#EFEFEF] px-4 py-2 rounded-sm text-center">
            <p className="text-[10px] text-[#999999] uppercase tracking-widest">Shipped</p>
            <p className="font-bold text-[#111111]">{orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#EFEFEF] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 items-center bg-[#FAF8F5] px-3 py-2 rounded-sm border border-[#EFEFEF] focus-within:border-[#C7A17A] transition-colors w-full">
            <Search className="w-4 h-4 text-[#999999] mr-2" />
            <input 
              type="text" 
              placeholder="Search by order ID, name, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-[#111111] placeholder:text-[#999999]"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[#999999]" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[#EFEFEF] bg-[#FAF8F5] px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A] w-full md:w-auto"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF8F5] text-[#111111] uppercase tracking-widest text-[11px] border-b border-[#EFEFEF]">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#C7A17A] focus:ring-[#C7A17A]"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#666666]">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-[#666666]">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusDef = STATUS_OPTIONS.find(s => s.value === order.status) ?? STATUS_OPTIONS[0];
                  return (
                    <tr key={order.id} className={`border-b border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors ${selectedOrders.includes(order.id) ? 'bg-[#FAF8F5]' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#C7A17A] focus:ring-[#C7A17A]"
                        />
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => openModal(order)}>
                        <div className="flex items-center gap-2 font-medium text-[#111111]">
                          <Package className="w-4 h-4 text-[#C7A17A]" />
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#666666] cursor-pointer hidden md:table-cell" onClick={() => openModal(order)}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#111111]">{order.customer_name}</p>
                        <p className="text-xs text-[#666666]">{order.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-[#111111] hidden md:table-cell">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-sm text-[11px] font-medium tracking-widest uppercase ${statusDef.color}`}>
                          {statusDef.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-[#999999] hover:text-[#111111] transition-colors p-2">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-[#FAF8F5] w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            
            {/* Modal Header */}
            <div className="bg-white p-6 border-b border-[#EFEFEF] flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="font-serif text-2xl text-[#111111] flex items-center gap-2">
                  Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-sm text-[#666666]">
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={printInvoice} className="p-2 bg-[#FAF8F5] border border-[#EFEFEF] text-[#111111] hover:bg-white rounded-sm transition-colors" title="Print Invoice">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-[#999999] hover:text-[#111111] transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Status Update Block */}
              <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#999999] uppercase tracking-widest mb-1">Current Status</p>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                    className="border border-[#EFEFEF] bg-[#FAF8F5] px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A] font-medium"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#999999] uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="font-medium text-[#111111] uppercase">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Items & Customer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Items */}
                  <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm">
                    <h3 className="font-serif text-lg text-[#111111] mb-4 border-b border-[#EFEFEF] pb-2">Order Items</h3>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                            <div>
                              <p className="font-medium text-[#111111]">{item.name}</p>
                              <p className="text-xs text-[#666666]">Size: {item.size} | Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#999999]">No items data</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-[#EFEFEF] flex justify-between items-center text-lg">
                      <span className="font-serif text-[#111111]">Total</span>
                      <span className="font-bold text-[#111111]">₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm">
                    <h3 className="font-serif text-lg text-[#111111] mb-4 border-b border-[#EFEFEF] pb-2">Customer</h3>
                    <div className="space-y-1 text-sm text-[#666666]">
                      <p className="font-medium text-[#111111]">{selectedOrder.customer_name}</p>
                      <p><a href={`mailto:${selectedOrder.customer_email}`} className="text-[#C7A17A] hover:underline">{selectedOrder.customer_email}</a></p>
                      <p>{selectedOrder.customer_phone}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm">
                    <h3 className="font-serif text-lg text-[#111111] mb-4 border-b border-[#EFEFEF] pb-2">Shipping Address</h3>
                    {selectedOrder.shipping_address ? (
                      <div className="space-y-1 text-sm text-[#666666]">
                        <p className="font-medium text-[#111111]">{selectedOrder.shipping_address.name}</p>
                        <p>{selectedOrder.shipping_address.address}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                        <p>{selectedOrder.shipping_address.pin}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-[#999999]">No address data</p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm">
                    <h3 className="font-serif text-lg text-[#111111] mb-4 border-b border-[#EFEFEF] pb-2">Payment Details</h3>
                    <div className="space-y-3 text-sm text-[#666666]">
                      <div>
                        <p className="text-[10px] text-[#999999] uppercase tracking-widest mb-1">Method</p>
                        <p className="font-medium text-[#111111] uppercase">{selectedOrder.payment_method}</p>
                      </div>
                      {(selectedOrder.transaction_id || selectedOrder.utr_number) && (
                        <div>
                          <p className="text-[10px] text-[#999999] uppercase tracking-widest mb-1">Transaction ID / UTR</p>
                          <p className="font-mono text-xs">{selectedOrder.transaction_id || selectedOrder.utr_number}</p>
                        </div>
                      )}
                      {selectedOrder.screenshot_url && (
                        <div>
                          <p className="text-[10px] text-[#999999] uppercase tracking-widest mb-1">Screenshot</p>
                          <a href={selectedOrder.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1">
                            <img src={selectedOrder.screenshot_url} alt="Payment Screenshot" className="w-full max-w-[200px] h-auto border border-[#EFEFEF] rounded-sm hover:opacity-80 transition-opacity" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfillment & Tracking */}
              <div className="bg-white p-5 border border-[#EFEFEF] rounded-sm">
                <h3 className="font-serif text-lg text-[#111111] mb-4 border-b border-[#EFEFEF] pb-2">Fulfillment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] text-[#999999] uppercase tracking-widest mb-1">Courier Partner</label>
                    <input 
                      type="text" 
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. BlueDart, Delhivery"
                      className="w-full border border-[#EFEFEF] p-2 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#999999] uppercase tracking-widest mb-1">Tracking ID</label>
                    <input 
                      type="text" 
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="AWB Number"
                      className="w-full border border-[#EFEFEF] p-2 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-[#999999] uppercase tracking-widest mb-1">Internal Notes</label>
                  <textarea 
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add a note to this order (invisible to customer)..."
                    rows={3}
                    className="w-full border border-[#EFEFEF] p-2 text-sm rounded-sm focus:outline-none focus:border-[#C7A17A]"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={saveFulfillmentDetails}
                    disabled={updating}
                    className="bg-[#111111] text-white px-4 py-2 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Invoice Template */}
      {selectedOrder && (
        <div id="invoice-content" className="hidden print:block p-8 bg-white text-black max-w-4xl mx-auto font-sans">
          <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-widest uppercase">Tranquil</h1>
              <p className="text-sm text-gray-500 mt-1">Luxury Fashion & Apparel</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-gray-800">INVOICE</h2>
              <p className="text-sm">Order #{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm">Date: {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString() : ''}</p>
            </div>
          </div>

          <div className="flex justify-between mb-8 text-sm">
            <div>
              <p className="font-bold text-gray-800 mb-1">Billed To:</p>
              <p>{selectedOrder.customer_name}</p>
              <p>{selectedOrder.customer_email}</p>
              <p>{selectedOrder.customer_phone}</p>
            </div>
            {selectedOrder.shipping_address && (
              <div className="text-right">
                <p className="font-bold text-gray-800 mb-1">Shipped To:</p>
                <p>{selectedOrder.shipping_address.name}</p>
                <p>{selectedOrder.shipping_address.address}</p>
                <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.pin}</p>
              </div>
            )}
          </div>

          <table className="w-full text-left mb-8 text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-2">Item</th>
                <th className="py-2">Size</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items?.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-3 font-medium">{item.name}</td>
                  <td className="py-3">{item.size}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.price?.toLocaleString()}</td>
                  <td className="py-3 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b">
                <span>Subtotal</span>
                <span>₹{selectedOrder.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span>Shipping</span>
                <span>₹0</span>
              </div>
              <div className="flex justify-between py-3 text-lg font-bold">
                <span>Total</span>
                <span>₹{selectedOrder.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500 mt-16 pt-8 border-t">
            <p>Thank you for shopping with Tranquil!</p>
            <p>If you have any questions about this invoice, please contact support@tranquil.com</p>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111111] text-white px-6 py-4 rounded-sm shadow-xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">
            <span className="text-[#C7A17A]">{selectedOrders.length}</span> orders selected
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Change status to:</span>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-sm py-1.5 px-3 rounded-sm focus:outline-none focus:border-[#C7A17A]"
            >
              <option value="" className="text-black">Select Status</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="text-black">{s.label}</option>
              ))}
            </select>
            <button 
              onClick={applyBulkAction}
              disabled={!bulkStatus || updating}
              className="bg-[#C7A17A] text-white px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-[#B38D66] transition-colors disabled:opacity-50"
            >
              Apply
            </button>
            <button 
              onClick={() => setSelectedOrders([])}
              className="ml-2 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
