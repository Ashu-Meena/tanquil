"use client";

import { useState, useEffect } from "react";
import { FileText, Download } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Transaction {
  id: string;
  order_number?: string;
  customer_name: string;
  customer_email: string;
  total_amount: number;
  payment_method: string;
  utr_number?: string;
  transaction_id?: string;
  screenshot_url?: string;
  status: string;
  payment_status: string;
  created_at: string;
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setFetching(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data && !error) {
      setTransactions(data as any as Transaction[]);
    }
    setFetching(false);
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Amount", "Method", "UTR/Ref", "Status"];
    const rows = transactions.map(tx => [
      `#${tx.order_number || tx.id.slice(0, 8).toUpperCase()}`,
      new Date(tx.created_at).toLocaleDateString(),
      tx.customer_name,
      tx.customer_email,
      `₹${tx.total_amount}`,
      tx.payment_method === 'bank_transfer' ? 'Bank Transfer' : tx.payment_method || 'Unknown',
      tx.transaction_id || tx.utr_number || '-',
      tx.status
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payments_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-serif text-3xl text-rich-black">Payments</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage customer transactions.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center justify-center gap-2 bg-white border border-border-light text-rich-black px-4 py-2 text-sm font-medium hover:bg-ivory transition-colors rounded-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-ivory text-rich-black">
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
            <tbody className="divide-y divide-border-light">
              {fetching ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    <FileText className="w-12 h-12 text-border-light mx-auto mb-4" />
                    <p>No payments recorded yet.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-ivory transition-colors">
                    <td className="p-4 font-mono text-xs text-neutral-500">#{tx.order_number || tx.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-neutral-500">
                      {new Date(tx.created_at).toLocaleDateString()}
                      <div className="text-xs">{new Date(tx.created_at).toLocaleTimeString()}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-rich-black">{tx.customer_name}</div>
                      <div className="text-xs text-neutral-500">{tx.customer_email}</div>
                    </td>
                    <td className="p-4 font-medium text-rich-black">₹{tx.total_amount?.toLocaleString()}</td>
                    <td className="p-4 capitalize">
                      {tx.payment_method === 'bank_transfer' ? 'Bank Transfer' : tx.payment_method || 'Unknown'}
                    </td>
                    <td className="p-4 text-neutral-500 font-mono text-xs">
                      {tx.transaction_id || tx.utr_number || '-'}
                      {tx.screenshot_url && (
                        <a href={tx.screenshot_url} target="_blank" rel="noopener noreferrer" className="block mt-1 text-gold hover:underline text-[10px] uppercase tracking-widest font-sans">
                          View Receipt
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-sm capitalize ${
                        tx.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        tx.payment_status === 'failed' || tx.payment_status === 'refunded' ? 'bg-error/10 text-error' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {tx.payment_status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
