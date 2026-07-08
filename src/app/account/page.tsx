"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, Truck, RefreshCw, Plus, Loader2, Trash2, Printer } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/useCartStore";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("home");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authFirstName, setAuthFirstName] = useState("");
  const [authLastName, setAuthLastName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [invoiceSettings, setInvoiceSettings] = useState<any>({
    companyName: "Tranquil",
    tagline: "LUXURY FASHION & APPAREL",
    addressLine1: "123 Serenity Avenue, Fashion District",
    addressLine2: "New Delhi, Delhi 110001, India",
    gstin: "07AABCU9603R1ZX",
    email: "support@tranquil.co.in",
    phone: "+91 98765 43210",
    terms: "Returns accepted within 7 days of delivery.\nItems must be unworn with original tags attached.\nThis is a computer generated invoice and requires no signature.",
    signatory: "Authorized Signatory"
  });
  const [selectedOrderToPrint, setSelectedOrderToPrint] = useState<any>(null);
  
  const addToCart = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  
  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  
  // Security form state
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "", landmark: "", alternate_phone: ""
  });
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  useEffect(() => {
    async function fetchAccountData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuth(false);
        setIsLoading(false);
        return;
      }
      setIsAuth(true);

      // Fetch profile
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        setUserProfile(profile);
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setPhone(profile.phone || "");
      } else {
        setUserProfile({ email: session.user.email });
      }

      // Fetch orders
      const { data: userOrders } = await supabase.from('orders').select('*, items:order_items(*)').eq('customer_email', profile?.email || session.user.email).order('created_at', { ascending: false });
      if (userOrders) {
        setOrders(userOrders);
      }

      // Fetch addresses
      const { data: userAddresses } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false });
      if (userAddresses) {
        setAddresses(userAddresses);
      }

      // Fetch wishlist
      const { data: userWishlist } = await supabase.from('wishlist').select('id, products(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
      if (userWishlist) {
        setWishlist(userWishlist);
      }

      // Fetch invoice settings
      const { data: invData } = await supabase.from('store_settings').select('value').eq('key', 'invoice_settings').single();
      if (invData?.value) {
        setInvoiceSettings(invData.value);
      }

      setIsLoading(false);
    }
    fetchAccountData();
  }, [router]);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  const triggerPrint = (order: any) => {
    setSelectedOrderToPrint(order);
    setTimeout(() => {
      const printContent = document.getElementById("invoice-content");
      if (!printContent) return;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }, 100);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleUpdateProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: userProfile?.email
    });

    if (error) {
      showFeedback('Error updating profile');
    } else {
      showFeedback('Profile saved successfully! ✓');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showFeedback('Password must be at least 6 characters.');
      return;
    }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      showFeedback('Error updating password: ' + error.message);
    } else {
      setNewPassword("");
      showFeedback('Password updated successfully! ✓');
    }
    setIsUpdatingPassword(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAddress(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.from('addresses').insert({
      user_id: session.user.id,
      ...addressForm,
      is_default: addresses.length === 0
    }).select().single();

    if (error) {
      showFeedback('Error saving address');
    } else {
      setAddresses([data, ...addresses]);
      setShowAddressForm(false);
      setAddressForm({ name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "", landmark: "", alternate_phone: "" });
      showFeedback('Address saved successfully! ✓');
    }
    setIsSubmittingAddress(false);
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from('addresses').delete().eq('id', id);
    if (!error) {
      setAddresses(addresses.filter(a => a.id !== id));
      showFeedback('Address deleted.');
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    // Unset current default
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id);
    // Set new default
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    
    setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
    showFeedback('Default address updated.');
  };

  const handleRemoveFromWishlist = async (id: string) => {
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (!error) {
      setWishlist(wishlist.filter(w => w.id !== id));
      showFeedback('Removed from wishlist.');
    }
  };

  const handleMoveToCart = async (wishlistItem: any) => {
    const product = wishlistItem.products;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || 'https://via.placeholder.com/400x500',
      quantity: 1,
      color: "Standard",
      size: "M", // Defaulting for now
    });
    await handleRemoveFromWishlist(wishlistItem.id);
    openCart();
  };

  if (isLoading) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C7A17A]" />
      </div>
    );
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password: authPassword,
        options: {
          data: {
            first_name: authFirstName,
            last_name: authLastName,
          }
        }
      });
      if (error) {
        showFeedback(error.message);
      } else {
        // Create profile directly for immediate access if needed
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            first_name: authFirstName,
            last_name: authLastName,
            email: authEmail
          });
        }
        showFeedback('Account created! Logging you in...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (error) {
        showFeedback('Invalid email or password.');
      } else {
        window.location.reload();
      }
    }
    setAuthLoading(false);
  };

  if (!isAuth) {
    return (
      <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24 flex justify-center items-center">
        <div className="container mx-auto px-6 lg:px-12 flex justify-center">
          <div className="bg-white border border-[#EFEFEF] p-8 lg:p-12 max-w-md w-full shadow-sm">
            
            {feedbackMessage && (
              <div className="mb-6 bg-[#111111] text-white px-4 py-3 text-sm text-center">
                {feedbackMessage}
              </div>
            )}

            <h1 className="font-serif text-3xl text-[#111111] mb-2 text-center">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-[#666666] text-sm text-center mb-8">
              {authMode === "login" ? "Sign in to access your account." : "Join Tranquil to track your orders."}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">First Name</label>
                    <input required type="text" value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Last Name</label>
                    <input required type="text" value={authLastName} onChange={e => setAuthLastName(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                <input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Password</label>
                <input required type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors" />
              </div>

              <button disabled={authLoading} type="submit" className="w-full bg-[#111111] hover:bg-[#C7A17A] text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors mt-4 flex justify-center">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === "login" ? "Sign In" : "Create Account")}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-[#EFEFEF] w-full"></div>
              <span className="text-[#999999] text-xs uppercase tracking-widest">Or</span>
              <div className="h-px bg-[#EFEFEF] w-full"></div>
            </div>

            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/account' } })}
              className="mt-6 w-full flex items-center justify-center gap-3 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors py-3.5 rounded-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-[#111111]">Continue with Google</span>
            </button>

            <div className="mt-8 text-center text-sm text-[#666666]">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setAuthMode("signup")} className="text-[#111111] hover:text-[#C7A17A] font-medium underline underline-offset-4">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("login")} className="text-[#111111] hover:text-[#C7A17A] font-medium underline underline-offset-4">
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="font-serif text-4xl text-[#111111] mb-12 text-center">My Account</h1>
        
        <div className="flex flex-col gap-12 max-w-5xl mx-auto">
          {/* Content */}
          <main className="w-full">

            {feedbackMessage && (
              <div className="fixed top-24 right-6 bg-[#111111] text-white px-6 py-3 shadow-lg z-50 text-sm animate-fade-in">
                {feedbackMessage}
              </div>
            )}
            {activeTab === "home" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Orders Card */}
                <button 
                  onClick={() => setActiveTab("orders")}
                  className="flex items-start gap-4 p-6 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <Package className="w-8 h-8 text-[#C7A17A] opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium text-lg mb-1">Your Orders</h3>
                    <p className="text-sm text-[#666666]">Track, return, or view your past orders</p>
                  </div>
                </button>

                {/* Profile Card */}
                <button 
                  onClick={() => setActiveTab("profile")}
                  className="flex items-start gap-4 p-6 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <User className="w-8 h-8 text-[#C7A17A] opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium text-lg mb-1">Login & Security</h3>
                    <p className="text-sm text-[#666666]">Edit login, name, and mobile number</p>
                  </div>
                </button>

                {/* Addresses Card */}
                <button 
                  onClick={() => setActiveTab("addresses")}
                  className="flex items-start gap-4 p-6 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <MapPin className="w-8 h-8 text-[#C7A17A] opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium text-lg mb-1">Your Addresses</h3>
                    <p className="text-sm text-[#666666]">Edit addresses for orders</p>
                  </div>
                </button>

                {/* Wishlist Card */}
                <button 
                  onClick={() => setActiveTab("wishlist")}
                  className="flex items-start gap-4 p-6 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <Heart className="w-8 h-8 text-[#C7A17A] opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium text-lg mb-1">Your Wishlist</h3>
                    <p className="text-sm text-[#666666]">View your saved items</p>
                  </div>
                </button>

                {/* Sign Out Card */}
                <button 
                  onClick={handleSignOut}
                  className="flex items-start gap-4 p-6 border border-[#EFEFEF] hover:bg-[#FAF8F5] transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <LogOut className="w-8 h-8 text-[#111111] opacity-60" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-medium text-lg mb-1">Sign Out</h3>
                    <p className="text-sm text-[#666666]">Securely log out of your account</p>
                  </div>
                </button>
                
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white border border-[#EFEFEF] p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-[#C7A17A] hover:underline">Your Account</button>
                  <span className="mx-2 text-[#999999]">›</span>
                  <span className="text-[#111111]">Your Orders</span>
                </div>
                <h2 className="font-serif text-3xl text-[#111111] mb-8">Order History</h2>
                <div className="space-y-8">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#EFEFEF]">
                      <Package className="w-12 h-12 text-[#EFEFEF] mx-auto mb-4" />
                      <p className="text-[#666666]">You haven't placed any orders yet.</p>
                      <button onClick={() => router.push('/collections/all')} className="mt-4 text-[#111111] font-medium hover:text-[#C7A17A] underline underline-offset-4">Start Shopping</button>
                    </div>
                  ) : (
                    orders.map(order => {

                      return (
                        <div key={order.id} className="border border-[#EFEFEF] rounded-sm overflow-hidden">
                          {/* Order Header */}
                          <div className="bg-[#FAF8F5] p-6 border-b border-[#EFEFEF] flex flex-wrap justify-between items-center gap-6">
                            <div className="flex gap-8">
                              <div>
                                <p className="text-xs uppercase tracking-widest text-[#666666] mb-1">Order Placed</p>
                                <p className="text-sm font-medium text-[#111111]">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-widest text-[#666666] mb-1">Total</p>
                                <p className="text-sm font-medium text-[#111111]">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-widest text-[#666666] mb-1">Order #</p>
                              <p className="text-sm font-medium text-[#111111]">{(order.order_number || order.id.split('-')[0]).toUpperCase()}</p>
                            </div>
                          </div>

                          {/* Progress Bar & Status Info */}
                          <div className="p-6 md:px-10 py-8 border-b border-[#EFEFEF]">
                            {['cancelled', 'returned', 'refunded'].includes(order.status) ? (
                              <div className="text-center py-4">
                                <p className={`font-bold uppercase tracking-widest text-lg ${
                                  order.status === 'cancelled' ? 'text-red-600' : 
                                  order.status === 'returned' ? 'text-gray-800' : 'text-orange-600'
                                }`}>
                                  Order {order.status}
                                </p>
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-[#EFEFEF]">
                                  <div style={{ width: `${(
                                    order.status === 'pending_verification' ? 0 :
                                    order.status === 'confirmed' || order.status === 'packed' ? 33.3 :
                                    order.status === 'shipped' || order.status === 'out_for_delivery' ? 66.6 :
                                    order.status === 'delivered' ? 100 : 0
                                  )}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#C7A17A] transition-all duration-500"></div>
                                </div>
                                <div className="flex justify-between text-xs font-medium uppercase tracking-widest text-[#666666]">
                                  {["Pending", "Confirmed", "Shipped", "Delivered"].map((status, idx) => {
                                    const isActive = (
                                      (idx === 0) || 
                                      (idx === 1 && ['confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status)) ||
                                      (idx === 2 && ['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) ||
                                      (idx === 3 && order.status === 'delivered')
                                    );
                                    return (
                                      <div key={status} className={`text-center ${isActive ? 'text-[#111111] font-bold' : ''}`}>
                                        {status}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Items */}
                          <div className="p-6 space-y-6">
                            {order.items?.map((item: any, idx: number) => (
                              <div key={idx} className="flex flex-col sm:flex-row gap-6">
                                <div className="relative w-24 h-32 bg-[#FAF8F5] flex-shrink-0">
                                  {item.image_url || item.image ? (
                                    <Image src={item.image_url || item.image} alt={item.product_name || item.name || 'Product Image'} fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#999999] text-xs uppercase tracking-widest text-center px-2">No Image</div>
                                  )}
                                </div>
                                <div className="flex-1 flex flex-col justify-center">
                                  <h3 className="font-medium text-[#111111] text-lg mb-1">{item.product_name || item.name}</h3>
                                  <p className="text-sm text-[#666666] mb-2">{item.color_name || item.color} / {item.size}</p>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="font-medium text-[#111111]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                    <span className="text-[#999999]">|</span>
                                    <span className="text-[#666666]">Qty: {item.quantity}</span>
                                  </div>
                                </div>
                                <div className="sm:text-right flex flex-col justify-center gap-3">
                                  <button onClick={() => router.push(`/products/${item.product_id}`)} className="bg-[#111111] text-white hover:bg-[#C7A17A] px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors w-full sm:w-auto text-center">Buy it again</button>
                                  <button onClick={() => showFeedback('Review system coming soon.')} className="border border-[#EFEFEF] hover:border-[#111111] px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors w-full sm:w-auto text-center">Write a Review</button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Footer Actions */}
                          <div className="bg-[#FAF8F5] p-4 px-6 flex flex-col sm:flex-row justify-between items-center border-t border-[#EFEFEF] gap-4">
                            {order.tracking_id ? (
                              <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4 text-[#C7A17A]" />
                                <span className="text-sm text-[#111111]">
                                  Shipped via <span className="font-bold">{order.courier_name}</span> | Tracking ID: <span className="font-mono font-bold">{order.tracking_id}</span>
                                </span>
                              </div>
                            ) : (
                              <div className="text-sm text-[#999999] flex items-center gap-2">
                                <Truck className="w-4 h-4" /> Tracking info will appear here once shipped.
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button onClick={() => triggerPrint(order)} className="text-xs uppercase tracking-widest font-medium hover:text-[#C7A17A] transition-colors flex items-center gap-2 border border-[#EFEFEF] bg-white px-4 py-2 hover:border-[#111111]">
                                <Printer className="w-4 h-4" /> Download Invoice
                              </button>
                              <button onClick={() => showFeedback('To initiate a return, please contact us at returns@tranquil.co.in')} className="text-xs uppercase tracking-widest font-medium hover:text-[#C7A17A] transition-colors flex items-center gap-2 border border-[#EFEFEF] bg-white px-4 py-2 hover:border-[#111111]">
                                <RefreshCw className="w-4 h-4" /> Return Item
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="bg-white border border-[#EFEFEF] p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-[#C7A17A] hover:underline">Your Account</button>
                  <span className="mx-2 text-[#999999]">›</span>
                  <span className="text-[#111111]">Your Wishlist</span>
                </div>
                <h2 className="font-serif text-3xl text-[#111111] mb-8">My Wishlist</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlist.length === 0 ? (
                    <div className="col-span-2 md:col-span-3 text-center py-12 border border-dashed border-[#EFEFEF]">
                      <Heart className="w-12 h-12 text-[#EFEFEF] mx-auto mb-4" />
                      <p className="text-[#666666]">Your wishlist is currently empty.</p>
                      <button onClick={() => router.push('/collections/all')} className="mt-4 text-[#111111] font-medium hover:text-[#C7A17A] underline underline-offset-4">Discover Pieces</button>
                    </div>
                  ) : (
                    wishlist.map(item => (
                      <div key={item.id} className="group flex flex-col">
                        <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF8F5] mb-4">
                          <Image src={item.products?.images?.[0] || 'https://via.placeholder.com/400x500'} alt={item.products?.name} fill className="object-cover" />
                          <button onClick={() => handleRemoveFromWishlist(item.id)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#111111] hover:text-[#E63946] hover:bg-white transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                            <button onClick={() => handleMoveToCart(item)} className="w-full bg-white/90 backdrop-blur-md text-[#111111] hover:bg-[#C7A17A] hover:text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors">
                              Move to Cart
                            </button>
                          </div>
                        </div>
                        <Link href={`/products/${item.products?.slug}`} className="font-medium text-[#111111] hover:text-[#C7A17A] transition-colors mb-1 truncate">{item.products?.name}</Link>
                        <span className="text-[#666666]">₹{item.products?.price?.toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white border border-[#EFEFEF] p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-[#C7A17A] hover:underline">Your Account</button>
                  <span className="mx-2 text-[#999999]">›</span>
                  <span className="text-[#111111]">Your Addresses</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-3xl text-[#111111]">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-[#111111] text-white hover:bg-[#C7A17A] text-xs uppercase tracking-widest font-medium px-6 py-3 transition-colors flex items-center gap-2">
                    {showAddressForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add New Address</>}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="mb-12 bg-[#FAF8F5] p-8 border border-[#EFEFEF]">
                    <h3 className="font-serif text-xl mb-6">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Full Name</label>
                        <input required type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Address Line 1</label>
                        <input required type="text" value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Address Line 2 (Optional)</label>
                        <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">City</label>
                        <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">State / Province</label>
                        <select required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] text-[#666]">
                          <option value="" disabled>Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Postal / Zip Code</label>
                        <input required type="text" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Country</label>
                        <input required type="text" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Landmark (Optional)</label>
                        <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Phone Number</label>
                        <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Alternate Phone (Optional)</label>
                        <input type="tel" value={addressForm.alternate_phone} onChange={e => setAddressForm({...addressForm, alternate_phone: e.target.value})} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A]" />
                      </div>
                    </div>
                    <button disabled={isSubmittingAddress} type="submit" className="bg-[#111111] hover:bg-[#C7A17A] text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors">
                      {isSubmittingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.length === 0 ? (
                    <div className="col-span-2 text-center py-12 border border-dashed border-[#EFEFEF]">
                      <MapPin className="w-12 h-12 text-[#EFEFEF] mx-auto mb-4" />
                      <p className="text-[#666666]">You don't have any saved addresses.</p>
                    </div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className={`border p-6 relative transition-colors ${addr.is_default ? 'border-[#C7A17A] bg-[#FAF8F5]' : 'border-[#EFEFEF] hover:border-[#111111]'}`}>
                        {addr.is_default && <span className="absolute top-0 right-0 bg-[#C7A17A] text-white text-[10px] uppercase tracking-widest px-3 py-1">Default</span>}
                        <h3 className="font-medium mb-2 text-[#111111]">{addr.name}</h3>
                        <p className="text-sm text-[#666666] leading-relaxed mb-6">
                          {addr.address_line1}<br />
                          {addr.address_line2 && <>{addr.address_line2}<br /></>}
                          {addr.city}, {addr.state} {addr.postal_code}<br />
                          {addr.country}<br />
                          {addr.landmark && <>Landmark: {addr.landmark}<br /></>}
                          Phone: {addr.phone || userProfile?.phone || 'Not provided'}<br />
                          {addr.alternate_phone && <>Alternate Phone: {addr.alternate_phone}</>}
                        </p>
                        <div className="flex gap-4 pt-4 border-t border-[#EFEFEF]">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#C7A17A] transition-colors">Set Default</button>
                          )}
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#E63946] transition-colors">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white border border-[#EFEFEF] p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-[#C7A17A] hover:underline">Your Account</button>
                  <span className="mx-2 text-[#999999]">›</span>
                  <span className="text-[#111111]">Login & Security</span>
                </div>
                <h2 className="font-serif text-3xl text-[#111111] mb-8">Login & Security</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-6 border-b border-[#EFEFEF] pb-2">Personal Information</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">First Name</label>
                          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Last Name</label>
                          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                      </div>
                      <button type="submit" className="bg-[#111111] hover:bg-[#C7A17A] text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors w-full">
                        Save Personal Info
                      </button>
                    </form>
                  </div>

                  {/* Security */}
                  <div>
                    <h3 className="font-medium text-lg mb-6 border-b border-[#EFEFEF] pb-2">Account Security</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                        <input type="email" value={userProfile?.email || ""} disabled className="w-full bg-[#EFEFEF] border border-[#EFEFEF] p-4 text-[#666666] cursor-not-allowed" />
                        <p className="text-xs text-[#999999] mt-2">Email address cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">New Password</label>
                        <input type="password" placeholder="Leave blank to keep current password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                      </div>
                      <button disabled={!newPassword || isUpdatingPassword} type="submit" className="bg-[#111111] hover:bg-[#C7A17A] disabled:opacity-50 disabled:hover:bg-[#111111] text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors w-full">
                        {isUpdatingPassword ? "Updating..." : "Update Password"}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Printable Invoice Template */}
            {selectedOrderToPrint && invoiceSettings && (
              <div id="invoice-content" className="hidden print:block p-10 bg-white text-black max-w-4xl mx-auto font-sans leading-relaxed">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-[#111111] pb-8 mb-8">
                  <div>
                    <h1 className="text-4xl font-serif font-bold tracking-widest uppercase mb-2">{invoiceSettings.companyName}</h1>
                    <p className="text-sm text-gray-600 font-medium tracking-wide uppercase">{invoiceSettings.tagline}</p>
                    <div className="mt-4 text-sm text-gray-500 space-y-1">
                      <p>{invoiceSettings.addressLine1}</p>
                      <p>{invoiceSettings.addressLine2}</p>
                      <p>GSTIN: {invoiceSettings.gstin}</p>
                      <p>{invoiceSettings.email} | {invoiceSettings.phone}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-[#111111] uppercase tracking-wider mb-4">Tax Invoice</h2>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 text-left w-64 ml-auto">
                      <span className="font-semibold text-gray-800">Invoice No:</span>
                      <span className="text-right uppercase">{selectedOrderToPrint.id.slice(0, 8)}</span>
                      <span className="font-semibold text-gray-800">Date:</span>
                      <span className="text-right">{selectedOrderToPrint.created_at ? new Date(selectedOrderToPrint.created_at).toLocaleDateString('en-IN') : 'N/A'}</span>
                      <span className="font-semibold text-gray-800">Order No:</span>
                      <span className="text-right uppercase">{selectedOrderToPrint.order_number || selectedOrderToPrint.id.slice(0, 8)}</span>
                      <span className="font-semibold text-gray-800">Payment:</span>
                      <span className="text-right uppercase">{selectedOrderToPrint.payment_method} ({selectedOrderToPrint.payment_status})</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="grid grid-cols-2 gap-12 mb-10">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Billed To</h3>
                    <p className="font-bold text-[#111111] text-lg">{selectedOrderToPrint.customer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrderToPrint.customer_email}</p>
                    <p className="text-sm text-gray-600 mb-2">{selectedOrderToPrint.customer_phone}</p>
                  </div>
                  {selectedOrderToPrint.shipping_address && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Shipped To</h3>
                      <p className="font-bold text-[#111111]">{selectedOrderToPrint.shipping_address.name || selectedOrderToPrint.customer_name}</p>
                      <p className="text-sm text-gray-600 mt-1">{selectedOrderToPrint.shipping_address.address}</p>
                      <p className="text-sm text-gray-600">{selectedOrderToPrint.shipping_address.city}, {selectedOrderToPrint.shipping_address.state}</p>
                      <p className="text-sm text-gray-600">PIN: {selectedOrderToPrint.shipping_address.pin}</p>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                <div className="mb-10">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#FAF8F5] border-y border-[#111111]">
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs">Item Description</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-center">HSN</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-center">Qty</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-right">Rate</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wider text-xs text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrderToPrint.items?.map((item: any, i: number) => (
                        <tr key={i}>
                          <td className="py-4 px-4">
                            <p className="font-bold text-[#111111]">{item.product_name || item.name}</p>
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
                      <span>₹{selectedOrderToPrint.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                      <span>Shipping & Handling</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600">
                      <span>Taxable Amount</span>
                      <span>₹{(selectedOrderToPrint.total_amount * 0.82).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-[#111111]">
                      <span>IGST (18%)</span>
                      <span>₹{(selectedOrderToPrint.total_amount * 0.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-bold text-[#111111]">
                      <span>Grand Total</span>
                      <span>₹{selectedOrderToPrint.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer & T&C */}
                <div className="grid grid-cols-2 gap-8 border-t-2 border-[#EFEFEF] pt-8 text-xs text-gray-500">
                  <div>
                    <h4 className="font-bold text-[#111111] mb-2 uppercase tracking-widest">Terms & Conditions</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {invoiceSettings.terms.split('\n').map((term: string, idx: number) => (
                        <li key={idx}>{term}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right flex flex-col justify-end">
                    <h4 className="font-bold text-[#111111] mb-1">For {invoiceSettings.companyName}</h4>
                    <p className="italic">{invoiceSettings.signatory}</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
