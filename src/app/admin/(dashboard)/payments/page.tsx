"use client";

import { useState, useEffect } from "react";
import { Save, CreditCard, Receipt, FileText, Download } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_method: string;
  utr_number?: string;
  transaction_id?: string;
  screenshot_url?: string;
  status: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [activeGateway, setActiveGateway] = useState("stripe");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("orders")
      .select("id, customer_name, customer_email, total_amount, payment_method, utr_number, transaction_id, screenshot_url, status, created_at")
      .order("created_at", { ascending: false });
    
    if (data && !error) {
      setTransactions(data);
    }
    setFetching(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Payment settings saved successfully!");
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl text-[#111111]">Payments</h1>
          <p className="text-sm text-[#666666] mt-1">Manage customer transactions and payment gateways.</p>
        </div>
        {activeTab === "settings" && (
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-[#111111] text-white px-6 py-2 text-sm font-medium hover:bg-[#C7A17A] transition-colors rounded-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Settings"}
          </button>
        )}
        {activeTab === "transactions" && (
          <button className="flex items-center justify-center gap-2 bg-white border border-[#EFEFEF] text-[#111111] px-4 py-2 text-sm font-medium hover:bg-[#FAF8F5] transition-colors rounded-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-[#EFEFEF]">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "transactions" ? "text-[#C7A17A]" : "text-[#666666] hover:text-[#111111]"}`}
        >
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Recent Transactions
          </div>
          {activeTab === "transactions" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C7A17A]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === "settings" ? "text-[#C7A17A]" : "text-[#666666] hover:text-[#111111]"}`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Gateway Settings
          </div>
          {activeTab === "settings" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C7A17A]"></div>
          )}
        </button>
      </div>

      {activeTab === "transactions" && (
        <div className="bg-white border border-[#EFEFEF] rounded-sm shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-[#111111]">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Method</th>
                  <th className="p-4 font-medium">UTR / Ref</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFEF]">
                {fetching ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#666666]">Loading transactions...</td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-[#666666]">
                      <FileText className="w-12 h-12 text-[#EFEFEF] mx-auto mb-4" />
                      <p>No payments recorded yet.</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="p-4 font-mono text-xs text-[#666666]">{tx.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-4 text-[#666666]">
                        {new Date(tx.created_at).toLocaleDateString()}
                        <div className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#111111]">{tx.customer_name}</div>
                        <div className="text-xs text-[#666666]">{tx.customer_email}</div>
                      </td>
                      <td className="p-4 font-medium text-[#111111]">₹{tx.total_amount?.toLocaleString()}</td>
                      <td className="p-4 capitalize">
                        {tx.payment_method === 'bank_transfer' ? 'Bank Transfer' : tx.payment_method || 'Unknown'}
                      </td>
                      <td className="p-4 text-[#666666] font-mono text-xs">
                        {tx.transaction_id || tx.utr_number || '-'}
                        {tx.screenshot_url && (
                          <a href={tx.screenshot_url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-[#C7A17A] hover:underline text-[10px] uppercase tracking-widest font-sans">
                            View Receipt
                          </a>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-sm ${
                          tx.status === 'pending_verification' ? 'bg-yellow-100 text-yellow-800' : 
                          tx.status === 'cancelled' || tx.status === 'refunded' ? 'bg-red-100 text-red-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {tx.status === 'pending_verification' ? 'Pending' : 
                           tx.status === 'cancelled' ? 'Cancelled' :
                           tx.status === 'refunded' ? 'Refunded' : 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-2">
            <button 
              onClick={() => setActiveGateway("stripe")}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-sm flex items-center gap-3 transition-colors ${activeGateway === "stripe" ? "bg-[#111111] text-white" : "bg-white text-[#666666] hover:bg-[#FAF8F5] border border-[#EFEFEF]"}`}
            >
              <CreditCard className="w-4 h-4" /> Stripe
            </button>
            <button 
              onClick={() => setActiveGateway("razorpay")}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-sm flex items-center gap-3 transition-colors ${activeGateway === "razorpay" ? "bg-[#111111] text-white" : "bg-white text-[#666666] hover:bg-[#FAF8F5] border border-[#EFEFEF]"}`}
            >
              <CreditCard className="w-4 h-4" /> Razorpay
            </button>
            <button 
              onClick={() => setActiveGateway("paypal")}
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-sm flex items-center gap-3 transition-colors ${activeGateway === "paypal" ? "bg-[#111111] text-white" : "bg-white text-[#666666] hover:bg-[#FAF8F5] border border-[#EFEFEF]"}`}
            >
              <CreditCard className="w-4 h-4" /> PayPal
            </button>
          </div>

          <div className="md:col-span-3">
            {activeGateway === "stripe" && (
              <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#111111]">Stripe Integration</h2>
                  <p className="text-sm text-[#666666] mt-1">Accept credit cards and Apple Pay directly on your store.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Environment</label>
                    <select className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]">
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Publishable Key</label>
                    <input type="text" placeholder="pk_test_..." className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Secret Key</label>
                    <input type="password" placeholder="sk_test_..." className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                </div>
              </div>
            )}

            {activeGateway === "razorpay" && (
              <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#111111]">Razorpay Integration</h2>
                  <p className="text-sm text-[#666666] mt-1">Accept UPI, Netbanking, and Wallets in India.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Environment</label>
                    <select className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]">
                      <option value="test">Test Mode</option>
                      <option value="live">Live Mode</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Key ID</label>
                    <input type="text" placeholder="rzp_test_..." className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Key Secret</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                </div>
              </div>
            )}

            {activeGateway === "paypal" && (
              <div className="bg-white p-6 border border-[#EFEFEF] rounded-sm shadow-sm space-y-6">
                <div>
                  <h2 className="font-serif text-xl text-[#111111]">PayPal Integration</h2>
                  <p className="text-sm text-[#666666] mt-1">Allow customers to check out using their PayPal accounts.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Client ID</label>
                    <input type="text" placeholder="Enter PayPal Client ID" className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-[#111111]">Client Secret</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full border border-[#EFEFEF] p-2.5 rounded-sm text-sm focus:outline-none focus:border-[#C7A17A]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
