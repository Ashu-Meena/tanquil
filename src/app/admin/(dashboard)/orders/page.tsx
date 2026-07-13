"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Package, Search, Filter, Printer, ExternalLink, MoreVertical, Check, X } from "lucide-react";
import { toast } from "@/store/useToastStore";
import Image from "next/image";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  subtotal?: number;
  shipping_fee?: number;
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
  payment_status: string;
  order_number?: string;
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

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
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

  const [invoiceSettings, setInvoiceSettings] = useState({
    companyName: "Tranquil",
    tagline: "MODERN FASHION FOR GEN Z GIRLS",
    addressLine1: "Kanwarram Park, Sant, Last Bungalow 3rd Lane,",
    addressLine2: "Vaibhav Nagar, Pimpri Colony, Pune – 411017",
    gstin: "",
    email: "thetranquilstor@gmail.com",
    phone: "+91 92261 20292",
    terms: "All sales are final. No returns or cancellations.\nExchanges available within 72 hours of delivery (same product, different size only).\nThis is a computer generated invoice.",
    signatory: "Authorized Signatory"
  });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(product_images(url)))")
      .order("created_at", { ascending: false });
    
    if (!error && data) setOrders(data as any as Order[]);

    // Fetch Invoice Settings
    const { data: settingsData } = await supabase.from('store_settings').select('*').eq('key', 'invoice_settings').single();
    if (settingsData?.value) {
      setInvoiceSettings(settingsData.value as any);
    }

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

  const updatePaymentStatus = async (orderId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase.from("orders").update({ payment_status: newStatus }).eq("id", orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, payment_status: newStatus } : null);
    }
  };

  const saveFulfillmentDetails = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    const supabase = createClient();

    await supabase.from("orders").update({ 
      notes: internalNotes,
      tracking_id: trackingId,
      courier_name: courierName,
    }).eq("id", selectedOrder.id);
    
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { 
      ...o, notes: internalNotes, tracking_id: trackingId, courier_name: courierName
    } : o));
    
    setSelectedOrder(prev => prev ? { 
      ...prev, notes: internalNotes, tracking_id: trackingId, courier_name: courierName
    } : null);
    
    toast.success("Fulfillment details saved successfully.");
    setUpdating(false);
  };
  
  const refreshTrackingStatus = async () => {
    toast.error("Live tracking sync is currently unavailable.");
  };
    
  const openModal = (order: Order) => {
    setSelectedOrder(order);
    setInternalNotes(order.notes || "");
    setTrackingId(order.tracking_id || "");
    setCourierName(order.courier_name || "");
  };

  const printInvoice = async () => {
    const printContent = document.getElementById("invoice-content");
    if (!printContent) return;

    try {
      // Dynamic import to avoid SSR window issues
      const html2canvas = (await import('html2canvas-pro')).default;
      const jsPDF = (await import('jspdf')).jsPDF;
      
      const invoiceName = selectedOrder?.order_number || selectedOrder?.id.slice(0,8) || 'invoice';
      
      const canvas = await html2canvas(printContent, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`invoice-${invoiceName}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || 
                          (o.order_number || o.id).toLowerCase().includes(search.toLowerCase()) ||
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
    toast.success("Orders updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="mb-8">
          <h1 className="font-serif text-3xl text-rich-black tracking-widest uppercase mb-2">Orders Management</h1>
          <p className="text-neutral-500 text-sm">View and manage customer orders, updates status and process fulfillment.</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white border border-border-light px-4 py-2 rounded-sm text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Pending</p>
            <p className="font-bold text-rich-black">{orders.filter(o => o.status === 'pending_verification' || o.status === 'confirmed').length}</p>
          </div>
          <div className="bg-white border border-border-light px-4 py-2 rounded-sm text-center">
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Shipped</p>
            <p className="font-bold text-rich-black">{orders.filter(o => o.status === 'shipped' || o.status === 'out_for_delivery').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-light flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-1 items-center bg-ivory px-3 py-2 rounded-sm border border-border-light focus-within:border-gold transition-colors w-full">
            <Search className="w-4 h-4 text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search by order ID, name, or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-rich-black placeholder:text-neutral-400"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-neutral-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-border-light bg-ivory px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold w-full md:w-auto"
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
            <thead className="bg-ivory text-rich-black uppercase tracking-widest text-[11px] border-b border-border-light">
              <tr>
                <th className="px-6 py-4 font-medium w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                </th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium hidden md:table-cell">Total</th>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">Loading orders...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-500">No orders found.</td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusDef = STATUS_OPTIONS.find(s => s.value === order.status) ?? STATUS_OPTIONS[0];
                  return (
                    <tr key={order.id} className={`border-b border-border-light hover:bg-ivory transition-colors ${selectedOrders.includes(order.id) ? 'bg-ivory' : ''}`}>
                      <td className="px-6 py-4">
                        <input 
                          type="checkbox" 
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => openModal(order)}>
                        <div className="flex items-center gap-2 font-medium text-rich-black">
                          <Package className="w-4 h-4 text-gold" />
                          #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-500 cursor-pointer hidden md:table-cell" onClick={() => openModal(order)}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-rich-black">{order.customer_name}</p>
                        <p className="text-xs text-neutral-500">{order.customer_email}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-rich-black hidden md:table-cell">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded-sm text-[11px] font-medium tracking-widest uppercase ${
                          order.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          order.payment_status === 'failed' || order.payment_status === 'refunded' ? 'bg-red-100 text-red-800' : 
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
          <div className="bg-ivory w-full max-w-2xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            
            {/* Modal Header */}
            <div className="bg-white p-6 border-b border-border-light flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="font-serif text-2xl text-rich-black flex items-center gap-2">
                  Order #{selectedOrder.order_number || selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <p className="text-sm text-neutral-500">
                  {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={printInvoice} className="p-2 bg-ivory border border-border-light text-rich-black hover:bg-white rounded-sm transition-colors" title="Print Invoice">
                  <Printer className="w-4 h-4" />
                </button>
                <button onClick={() => setSelectedOrder(null)} className="p-2 text-neutral-400 hover:text-rich-black transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 pb-24 space-y-6">
              
              {/* Status Update Block */}
              <div className="bg-white p-5 border border-border-light rounded-sm flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
                <div className="flex gap-6">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Order Status</p>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                      className="border border-border-light bg-ivory px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold font-medium"
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Payment Status</p>
                    <select
                      value={selectedOrder.payment_status}
                      onChange={(e) => updatePaymentStatus(selectedOrder.id, e.target.value)}
                      className="border border-border-light bg-ivory px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-gold font-medium"
                    >
                      {PAYMENT_STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Payment Method</p>
                  <p className="font-medium text-rich-black uppercase">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Items & Customer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Items */}
                  <div className="bg-white p-5 border border-border-light rounded-sm">
                    <h3 className="font-serif text-lg text-rich-black mb-4 border-b border-border-light pb-2">Order Items</h3>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, i) => (
                          <div key={i} className="flex gap-4 items-center text-sm">
                            <div className="relative w-12 h-16 bg-ivory flex-shrink-0">
                                  {item.image_url || item.image || item.product?.product_images?.[0]?.url ? (
                                    <Image src={item.image_url || item.image || item.product?.product_images?.[0]?.url} alt={item.product_name || item.name} fill className="object-cover" />
                                  ) : (
                                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-[10px] uppercase tracking-widest text-center px-1">No Image</div>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-rich-black">{item.product_name || item.name}</p>
                              <p className="text-xs text-neutral-500 mt-1">
                                Color: <span className="font-medium text-rich-black">{item.color_name || 'N/A'}</span> | 
                                Size: <span className="font-medium text-rich-black">{item.size}</span> | 
                                Qty: <span className="font-medium text-rich-black">{item.quantity}</span>
                              </p>
                            </div>
                            <p className="font-medium text-right">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400">No items data</p>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-border-light flex justify-between items-center text-lg">
                      <span className="font-serif text-rich-black">Total</span>
                      <span className="font-bold text-rich-black">₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-white p-5 border border-border-light rounded-sm">
                    <h3 className="font-serif text-lg text-rich-black mb-4 border-b border-border-light pb-2">Customer</h3>
                    <div className="space-y-1 text-sm text-neutral-500">
                      <p className="font-medium text-rich-black">{selectedOrder.customer_name}</p>
                      <p><a href={`mailto:${selectedOrder.customer_email}`} className="text-gold hover:underline">{selectedOrder.customer_email}</a></p>
                      <p>{selectedOrder.customer_phone}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white p-5 border border-border-light rounded-sm">
                    <h3 className="font-serif text-lg text-rich-black mb-4 border-b border-border-light pb-2">Shipping Address</h3>
                    {selectedOrder.shipping_address ? (
                      <div className="space-y-1 text-sm text-neutral-500">
                        <p className="font-medium text-rich-black">{selectedOrder.shipping_address.name}</p>
                        <p>{selectedOrder.shipping_address.address}</p>
                        <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                        <p>{selectedOrder.shipping_address.pin}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-neutral-400">No address data</p>
                    )}
                  </div>

                  {/* Payment Details */}
                  <div className="bg-white p-5 border border-border-light rounded-sm">
                    <h3 className="font-serif text-lg text-rich-black mb-4 border-b border-border-light pb-2">Payment Details</h3>
                    <div className="space-y-3 text-sm text-neutral-500">
                      <div>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Method</p>
                        <p className="font-medium text-rich-black uppercase">{selectedOrder.payment_method}</p>
                      </div>
                      {(selectedOrder.transaction_id || selectedOrder.utr_number) && (
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Transaction ID / UTR</p>
                          <p className="font-mono text-xs">{selectedOrder.transaction_id || selectedOrder.utr_number}</p>
                        </div>
                      )}
                      {selectedOrder.screenshot_url && (
                        <div>
                          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Screenshot</p>
                          <a href={selectedOrder.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-1">
                            <img src={selectedOrder.screenshot_url} alt="Payment Screenshot" className="w-full max-w-[200px] h-auto border border-border-light rounded-sm hover:opacity-80 transition-opacity" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fulfillment & Tracking */}
              <div className="bg-white p-5 border border-border-light rounded-sm">
                <h3 className="font-serif text-lg text-rich-black mb-4 border-b border-border-light pb-2">Fulfillment Details</h3>
                


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Courier Partner</label>
                    <input 
                      type="text" 
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. BlueDart, Delhivery"
                      className="w-full border border-border-light p-2 text-sm rounded-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Tracking ID</label>
                    <input 
                      type="text" 
                      value={trackingId}
                      onChange={(e) => setTrackingId(e.target.value)}
                      placeholder="AWB Number"
                      className="w-full border border-border-light p-2 text-sm rounded-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400 uppercase tracking-widest mb-1">Internal Notes</label>
                  <textarea 
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add a note to this order (invisible to customer)..."
                    rows={3}
                    className="w-full border border-border-light p-2 text-sm rounded-sm focus:outline-none focus:border-gold"
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={saveFulfillmentDetails}
                    disabled={updating}
                    className="bg-rich-black text-white px-4 py-2 text-sm font-medium hover:bg-gold transition-colors rounded-sm disabled:opacity-50"
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
        <div className="overflow-hidden h-0 w-0 absolute -left-[9999px]">
          <div id="invoice-content" className="p-10 bg-white text-black w-[800px] font-sans leading-relaxed">
            {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-rich-black pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold tracking-widest uppercase mb-2">{invoiceSettings.companyName}</h1>
              <p className="text-sm text-gray-600 font-medium tracking-wide uppercase">{invoiceSettings.tagline}</p>
              <div className="mt-4 text-sm text-gray-500 space-y-1">
                <p>{invoiceSettings.addressLine1}</p>
                <p>{invoiceSettings.addressLine2}</p>
                <p>{invoiceSettings.email} | {invoiceSettings.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-rich-black uppercase tracking-wider mb-4">Invoice</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 text-left w-64 ml-auto">
                <span className="font-semibold text-gray-800">Invoice No:</span>
                <span className="text-right uppercase">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</span>
                <span className="font-semibold text-gray-800">Date:</span>
                <span className="text-right">{selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
                <span className="font-semibold text-gray-800">Order No:</span>
                <span className="text-right uppercase">{selectedOrder.order_number || selectedOrder.id.slice(0, 8)}</span>
                <span className="font-semibold text-gray-800">Payment:</span>
                <span className="text-right uppercase">{selectedOrder.payment_method} ({selectedOrder.payment_status})</span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Billed To</h3>
              <p className="font-bold text-rich-black text-lg">{selectedOrder.customer_name}</p>
              <p className="text-sm text-gray-600 mt-1">{selectedOrder.customer_email}</p>
              <p className="text-sm text-gray-600 mb-2">{selectedOrder.customer_phone}</p>
            </div>
            {selectedOrder.shipping_address && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Shipped To</h3>
                <p className="font-bold text-rich-black">{selectedOrder.shipping_address.name || selectedOrder.customer_name}</p>
                <p className="text-sm text-gray-600 mt-1">{selectedOrder.shipping_address.address}</p>
                <p className="text-sm text-gray-600">{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}</p>
                <p className="text-sm text-gray-600">PIN: {selectedOrder.shipping_address.pin}</p>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="mb-10">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-ivory border-y border-rich-black">
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Item Description</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-center">HSN</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-center">Qty</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-right">Rate</th>
                  <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedOrder.items?.map((item, i) => (
                  <tr key={i}>
                    <td className="py-4 px-4">
                      <p className="font-bold text-rich-black">{item.product_name || item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Color: {item.color_name || 'N/A'} | Size: {item.size}</p>
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">6204</td>
                    <td className="py-4 px-4 text-center">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">₹{item.price?.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-4 text-right font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-80">
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN') ?? selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                <span>Shipping &amp; Handling</span>
                <span>₹{selectedOrder.shipping_fee?.toLocaleString('en-IN') ?? 0}</span>
              </div>
              <div className="flex justify-between py-4 text-xl font-bold text-rich-black">
                <span>Grand Total</span>
                <span>₹{selectedOrder.total_amount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Footer & T&C */}
          <div className="grid grid-cols-2 gap-8 border-t-2 border-border-light pt-8 text-xs text-gray-500">
            <div>
              <h4 className="font-bold text-rich-black mb-2 uppercase tracking-widest">Terms & Conditions</h4>
              <ul className="list-disc pl-4 space-y-1">
                {invoiceSettings.terms.split('\n').map((term, idx) => (
                  <li key={idx}>{term}</li>
                ))}
              </ul>
            </div>
            <div className="text-right flex flex-col justify-end">
              <h4 className="font-bold text-rich-black mb-1">For {invoiceSettings.companyName}</h4>
              <p className="italic">{invoiceSettings.signatory}</p>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-rich-black text-white px-6 py-4 rounded-sm shadow-xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-medium">
            <span className="text-gold">{selectedOrders.length}</span> orders selected
          </div>
          <div className="h-6 w-px bg-white/20"></div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Change status to:</span>
            <select 
              value={bulkStatus} 
              onChange={(e) => setBulkStatus(e.target.value)}
              className="bg-white/10 border border-white/20 text-sm py-1.5 px-3 rounded-sm focus:outline-none focus:border-gold"
            >
              <option value="" className="text-black">Select Status</option>
              {STATUS_OPTIONS.map(s => (
                <option key={s.value} value={s.value} className="text-black">{s.label}</option>
              ))}
            </select>
            <button 
              onClick={applyBulkAction}
              disabled={!bulkStatus || updating}
              className="bg-gold text-white px-4 py-1.5 text-sm font-medium rounded-sm hover:bg-[#B38D66] transition-colors disabled:opacity-50"
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
