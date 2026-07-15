"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Search, Mail, Phone, Calendar, ArrowUpDown, Loader2 } from "lucide-react";

interface Customer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
  total_orders: number;
  total_spend: number;
}

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [rawOrdersCount, setRawOrdersCount] = useState(0);
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    
    // 1. Fetch all profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError || !profiles) {
      setLoading(false);
      return;
    }

    // 2. Fetch all orders to calculate spend
    const { data: orders } = await supabase
      .from('orders')
      .select('user_id, customer_email, total_amount, status');

    setRawOrdersCount(orders?.length || 0);

    const customerData: Customer[] = profiles.map(profile => {
      const userOrders = (orders || []).filter(o => 
        o.user_id === profile.id || 
        (o.customer_email && o.customer_email.toLowerCase() === profile.email.toLowerCase())
      );
      const successfulOrders = userOrders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded');
      
      const totalSpend = successfulOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        created_at: profile.created_at,
        total_orders: successfulOrders.length,
        total_spend: totalSpend
      };
    });

    setCustomers(customerData);
    setLoading(false);
  }, [supabase]);;

  const filteredCustomers = customers
    .filter(c => 
      c.email.toLowerCase().includes(search.toLowerCase()) || 
      c.first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.last_name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => sortDir === 'desc' ? b.total_orders - a.total_orders : a.total_orders - b.total_orders);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-rich-black mb-1">Customers</h1>
          <p className="text-neutral-500 text-sm">View and manage your registered store customers.</p>
        </div>
      </div>

      <div className="bg-white border border-border-light rounded-sm shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border-light flex justify-between items-center bg-ivory">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-sm focus:outline-none focus:border-gold"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-border-light text-xs uppercase tracking-wider text-neutral-400">
                <th className="p-4 font-medium">Customer Name</th>
                <th className="p-4 font-medium">Contact</th>
                <th 
                  className="p-4 font-medium flex items-center gap-1 cursor-pointer hover:text-rich-black"
                  onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
                >
                  Total Orders <ArrowUpDown className="w-3 h-3" />
                </th>
                <th className="p-4 font-medium">Total Spend</th>
                <th className="p-4 font-medium hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="text-sm text-rich-black">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gold mx-auto mb-2" />
                    <p className="text-neutral-500">Loading customers...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-neutral-400">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border-light hover:bg-ivory transition-colors">
                    <td className="p-4">
                      <div className="font-medium">
                        {customer.first_name || customer.last_name ? `${customer.first_name} ${customer.last_name}` : 'Unknown Name'}
                      </div>
                      <div className="text-xs text-neutral-400 md:hidden">{customer.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Mail className="w-3 h-3 text-neutral-400" /> {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center gap-2 text-neutral-500">
                          <Phone className="w-3 h-3 text-neutral-400" /> {customer.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-medium">
                      {customer.total_orders}
                    </td>
                    <td className="p-4 font-medium text-gold">
                      ₹{customer.total_spend.toLocaleString()}
                    </td>
                    <td className="p-4 text-neutral-500 hidden md:table-cell">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-border-light flex justify-between items-center text-xs text-neutral-500">
          <span>Showing {filteredCustomers.length} customers</span>
        </div>
      </div>
    </div>
  );
}
