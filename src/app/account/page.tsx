"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, Truck, RefreshCw, Plus, Loader2, Trash2, FileDown, MessageCircle, ChevronDown, ChevronUp, Info, Star, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "@/store/useToastStore";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "home");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const supabase = createClient();

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    } else {
      setActiveTab("home");
    }
  }, [tabParam]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

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
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  // Wishlist to Cart Modal State
  const [wishlistModalItem, setWishlistModalItem] = useState<any>(null);
  const [wishlistModalColor, setWishlistModalColor] = useState<string>('');
  const [wishlistModalSize, setWishlistModalSize] = useState<string>('');
  const [wishlistModalMeasurements, setWishlistModalMeasurements] = useState({ bust: "", waist: "", hips: "", length: "" });
  const [wishlistModalError, setWishlistModalError] = useState("");

  const toggleOrderExpand = (id: string) => {
    setExpandedOrders(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
    terms: "Exchanges accepted within 72 hours of delivery.\nItems must be unworn with original tags attached.\nThis is a computer generated invoice and requires no signature.",
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
  const [debugError, setDebugError] = useState<string | null>(null);

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
      const { data: userOrders } = await supabase.from('orders').select('*, items:order_items(*, product:products(product_images(url)))').eq('customer_email', session.user.email || '').order('created_at', { ascending: false });
      if (userOrders) {
        setOrders(userOrders);
      }

      // Fetch addresses
      const { data: userAddresses } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false });
      if (userAddresses) {
        setAddresses(userAddresses);
      }

      // Fetch wishlist
      const { data: userWishlist, error: fetchErr } = await supabase.from('wishlist').select('id, product_id, products(*, product_images(url), product_variants(*))').eq('user_id', session.user.id).order('created_at', { ascending: false });
      
      if (fetchErr) setDebugError(JSON.stringify(fetchErr));

      if (userWishlist || fetchErr) {
        // Even if there's an error, we should try to show local items
        const actualUserWishlist = userWishlist || [];
        const dbItemIds = actualUserWishlist.map((w: any) => String(w.product_id));
        const localItems = useWishlistStore.getState().items;
        const toUpload = localItems.filter(id => id && String(id) !== "undefined" && String(id) !== "null" && !dbItemIds.includes(String(id)));
        
        if (toUpload.length > 0) {
          // Upload local items to DB
          const { error: insertError } = await supabase.from('wishlist').insert(toUpload.map(id => ({ user_id: session.user.id, product_id: id })));
          if (insertError) {
             console.error("Wishlist insert error:", JSON.stringify(insertError, null, 2) === "{}" ? insertError.message || insertError.details || insertError.hint || insertError : insertError);
          }
          
          // Refetch to get the full joined data
          const { data: mergedWishlist, error: fetchError } = await supabase.from('wishlist').select('id, product_id, products(*, product_variants(*))').eq('user_id', session.user.id).order('created_at', { ascending: false });
          if (fetchError) console.error("Wishlist refetch error:", fetchError);
          
          if (mergedWishlist) {
            setWishlist(mergedWishlist);
            useWishlistStore.getState().setItems(mergedWishlist.map((w: any) => String(w.product_id)));
          } else {
             // Fallback if fetch completely failed
             const { data: fallbackProducts } = await supabase.from('products').select('*, product_images(url), product_variants(*)').in('id', toUpload);
             const fallbackWishlist = (fallbackProducts || []).map((p: any) => ({
                id: p.id, // fake wishlist ID
                product_id: p.id,
                products: p
             }));
             setWishlist([...actualUserWishlist, ...fallbackWishlist]); 
          }
        } else {
          setWishlist(actualUserWishlist);
          if (!fetchErr) {
            useWishlistStore.getState().setItems(dbItemIds);
          }
        }
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
    toast.success("Preparing invoice for download...");
    
    setTimeout(async () => {
      try {
        const printContent = document.getElementById("invoice-content");
        if (!printContent) {
          toast.error("Error finding invoice template.");
          return;
        }

        const html2canvas = (await import('html2canvas-pro')).default;
        const jsPDF = (await import('jspdf')).jsPDF;
        
        const invoiceName = order?.order_number || order?.id.slice(0,8) || 'invoice';
        
        const canvas = await html2canvas(printContent, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 10, 10, pdfWidth - 20, pdfHeight - 20);
        pdf.save(`invoice-${invoiceName}.pdf`);
      } catch (err) {
        console.error("PDF Generation Error:", err);
        toast.error("Failed to download PDF.");
      }
    }, 500);
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
      email: userProfile?.email || session.user.email || ""
    });

    if (error) {
      showFeedback('Error updating profile');
    } else {
      showFeedback('Profile saved successfully! âœ“');
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
      console.error("Password update error:", error);
      showFeedback('Error updating password. Please try again.');
    } else {
      setNewPassword("");
      showFeedback('Password updated successfully! âœ“');
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
      name: addressForm.name,
      address_line1: addressForm.address_line1,
      address_line2: addressForm.address_line2,
      city: addressForm.city,
      state: addressForm.state,
      postal_code: addressForm.postal_code,
      country: addressForm.country,
      phone: addressForm.phone,
      is_default: addresses.length === 0
    }).select().single();

    if (error) {
      showFeedback('Error saving address');
    } else {
      setAddresses([data, ...addresses]);
      setShowAddressForm(false);
      setAddressForm({ name: "", address_line1: "", address_line2: "", city: "", state: "", postal_code: "", country: "", phone: "", landmark: "", alternate_phone: "" });
      showFeedback('Address saved successfully! âœ“');
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

  const handleRemoveFromWishlist = async (id: string, productId?: string) => {
    const { error } = await supabase.from('wishlist').delete().eq('id', id);
    if (!error) {
      setWishlist(wishlist.filter(w => w.id !== id));
      if (productId) {
        useWishlistStore.getState().removeItem(productId);
      }
      showFeedback('Removed from wishlist.');
    }
  };

  const handleMoveToCart = async (wishlistItem: any) => {
    const product = wishlistItem.products;
    const variants = product?.product_variants || [];
    
    if (variants.length > 0) {
      setWishlistModalItem(wishlistItem);
      setWishlistModalColor(variants[0].color_name || 'Standard');
      setWishlistModalSize(variants[0].size || 'M');
      setWishlistModalMeasurements({ bust: "", waist: "", hips: "", length: "" });
      setWishlistModalError("");
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.product_images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x500',
        quantity: 1,
        color: "Standard",
        size: "M",
      });
      await handleRemoveFromWishlist(wishlistItem.id, product.id);
      openCart();
    }
  };

  const handleConfirmMoveToCart = async () => {
    if (!wishlistModalItem) return;
    
    if (wishlistModalSize === "Custom") {
      if (!wishlistModalMeasurements.bust || !wishlistModalMeasurements.waist || !wishlistModalMeasurements.hips || !wishlistModalMeasurements.length) {
        setWishlistModalError("Please provide all measurements for a custom fit.");
        return;
      }
    }
    
    const product = wishlistModalItem.products;
    
    const finalSize = wishlistModalSize === "Custom" 
      ? `Custom (Bust: ${wishlistModalMeasurements.bust}, Waist: ${wishlistModalMeasurements.waist}, Hips: ${wishlistModalMeasurements.hips}, Length: ${wishlistModalMeasurements.length})` 
      : (wishlistModalSize || "M");

    const nameParts = (wishlistModalColor || "Standard").split("||");
    const baseColorName = nameParts[0];
    const customProductTitle = nameParts.length > 1 ? nameParts[1] : product.name;

    addToCart({
      id: product.id,
      name: customProductTitle,
      price: product.price,
      image: product.product_images?.[0]?.url || product.images?.[0] || 'https://via.placeholder.com/400x500',
      quantity: 1,
      color: baseColorName,
      size: finalSize,
    });
    await handleRemoveFromWishlist(wishlistModalItem.id, product.id);
    setWishlistModalItem(null);
    openCart();
  };

  if (isLoading) {
    return (
      <div className="bg-ivory min-h-screen pt-32 pb-24 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
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
        console.error("Auth error:", error);
        showFeedback('Authentication error. Please check your details and try again.');
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
        setRegistrationSuccess(true);
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
      <div className="bg-ivory min-h-screen pt-32 pb-24 flex justify-center items-center">
        <div className="container mx-auto px-6 lg:px-12 flex justify-center">
          <div className="bg-white border border-border-light p-8 lg:p-12 max-w-md w-full shadow-sm">
            {registrationSuccess ? (
              <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-ivory rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h2 className="font-serif text-3xl text-rich-black mb-4">Check your email</h2>
                <p className="text-neutral-500 mb-8 leading-relaxed">
                  We've sent a confirmation link to <br /><span className="font-medium text-rich-black">{authEmail}</span>.<br />Please click the link to verify your account and complete registration.
                </p>
                <button onClick={() => { setRegistrationSuccess(false); setAuthMode("login"); }} className="bg-rich-black text-white px-8 py-3 uppercase tracking-widest text-xs font-medium hover:bg-gold transition-colors w-full">
                  Return to login
                </button>
              </div>
            ) : (
              <>
                {feedbackMessage && (
              <div className="mb-6 bg-rich-black text-white px-4 py-3 text-sm text-center">
                {feedbackMessage}
              </div>
            )}

            <h1 className="font-serif text-3xl text-rich-black mb-2 text-center">
              {authMode === "login" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-neutral-500 text-sm text-center mb-8">
              {authMode === "login" ? "Sign in to access your account." : "Join Tranquil to track your orders."}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">First Name</label>
                    <input required type="text" value={authFirstName} onChange={e => setAuthFirstName(e.target.value)} className="w-full bg-ivory border border-border-light p-3 focus:outline-none focus:border-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Last Name</label>
                    <input required type="text" value={authLastName} onChange={e => setAuthLastName(e.target.value)} className="w-full bg-ivory border border-border-light p-3 focus:outline-none focus:border-gold transition-colors" />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                <input required type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} className="w-full bg-ivory border border-border-light p-3 focus:outline-none focus:border-gold transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Password</label>
                <input required type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="w-full bg-ivory border border-border-light p-3 focus:outline-none focus:border-gold transition-colors" />
              </div>

              <button disabled={authLoading} type="submit" className="w-full bg-rich-black hover:bg-gold text-white py-4 uppercase tracking-widest text-sm font-medium transition-colors mt-4 flex justify-center">
                {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (authMode === "login" ? "Sign In" : "Create Account")}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center space-x-4">
              <div className="h-px bg-border-light w-full"></div>
              <span className="text-neutral-400 text-xs uppercase tracking-widest">Or</span>
              <div className="h-px bg-border-light w-full"></div>
            </div>

            <button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/account' } })}
              className="mt-6 w-full flex items-center justify-center gap-3 border border-border-light hover:bg-ivory transition-colors py-3.5 rounded-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span className="text-sm font-medium text-rich-black">Continue with Google</span>
            </button>

            <div className="mt-8 text-center text-sm text-neutral-500">
              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setAuthMode("signup")} className="text-rich-black hover:text-gold font-medium underline underline-offset-4">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("login")} className="text-rich-black hover:text-gold font-medium underline underline-offset-4">
                    Sign in
                  </button>
                </>
              )}
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="font-serif text-4xl text-rich-black mb-12 text-center">My Account</h1>
        
        <div className="flex flex-col gap-12 max-w-5xl mx-auto">
          {/* Content */}
          <main className="w-full">

            {feedbackMessage && (
              <div className="fixed top-24 right-6 bg-rich-black text-white px-6 py-3 shadow-lg z-50 text-sm animate-fade-in">
                {feedbackMessage}
              </div>
            )}
            {activeTab === "home" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Orders Card */}
                <button 
                  onClick={() => setActiveTab("orders")}
                  className="flex items-start gap-4 p-6 border border-border-light hover:bg-ivory transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <Package className="w-8 h-8 text-gold opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-rich-black font-medium text-lg mb-1">Your Orders</h3>
                    <p className="text-sm text-neutral-500">Track, return, or view your past orders</p>
                  </div>
                </button>

                {/* Profile Card */}
                <button 
                  onClick={() => setActiveTab("profile")}
                  className="flex items-start gap-4 p-6 border border-border-light hover:bg-ivory transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <User className="w-8 h-8 text-gold opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-rich-black font-medium text-lg mb-1">Login & Security</h3>
                    <p className="text-sm text-neutral-500">Edit login, name, and mobile number</p>
                  </div>
                </button>

                {/* Addresses Card */}
                <button 
                  onClick={() => setActiveTab("addresses")}
                  className="flex items-start gap-4 p-6 border border-border-light hover:bg-ivory transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <MapPin className="w-8 h-8 text-gold opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-rich-black font-medium text-lg mb-1">Your Addresses</h3>
                    <p className="text-sm text-neutral-500">Edit addresses for orders</p>
                  </div>
                </button>

                {/* Wishlist Card */}
                <button 
                  onClick={() => setActiveTab("wishlist")}
                  className="flex items-start gap-4 p-6 border border-border-light hover:bg-ivory transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <Heart className="w-8 h-8 text-gold opacity-80" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-rich-black font-medium text-lg mb-1">Your Wishlist</h3>
                    <p className="text-sm text-neutral-500">View your saved items</p>
                  </div>
                </button>

                {/* Sign Out Card */}
                <button 
                  onClick={handleSignOut}
                  className="flex items-start gap-4 p-6 border border-border-light hover:bg-ivory transition-colors text-left rounded-sm"
                >
                  <div className="mt-1 flex-shrink-0">
                    <LogOut className="w-8 h-8 text-rich-black opacity-60" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-rich-black font-medium text-lg mb-1">Sign Out</h3>
                    <p className="text-sm text-neutral-500">Securely log out of your account</p>
                  </div>
                </button>
                
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-white md:border border-border-light py-6 md:p-8 lg:p-12 md:rounded-sm md:shadow-sm -mx-6 md:mx-0">
                <div className="px-6 md:px-0 mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-gold hover:underline">Your Account</button>
                  <span className="mx-2 text-neutral-400">/</span>
                  <span className="text-rich-black">Your Orders</span>
                </div>
                <h2 className="px-6 md:px-0 font-serif text-2xl md:text-3xl text-rich-black mb-6 md:mb-8">Order History</h2>
                <div className="space-y-4 md:space-y-8">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border-light">
                      <Package className="w-12 h-12 text-border-light mx-auto mb-4" />
                      <p className="text-neutral-500">You haven't placed any orders yet.</p>
                      <button onClick={() => router.push('/collections/all')} className="mt-4 text-rich-black font-medium hover:text-gold underline underline-offset-4">Start Shopping</button>
                    </div>
                  ) : (
                    orders.map(order => {

                      return (
                        <div key={order.id} className="border-y md:border border-border-light md:rounded-sm overflow-hidden mb-2 bg-white">
                          
                          {/* --- MOBILE COMPACT HEADER (Flipkart style) --- */}
                          <div 
                            className="md:hidden p-4 px-6 md:px-4 border-b border-border-light flex items-center justify-between cursor-pointer" 
                            onClick={() => toggleOrderExpand(order.id)}
                          >
                            <div className="flex gap-4 items-center w-full pr-4">
                              <div className="w-16 h-16 bg-ivory relative flex-shrink-0 rounded-sm overflow-hidden border border-border-light">
                                {order.items?.[0]?.image_url || order.items?.[0]?.image || order.items?.[0]?.product?.product_images?.[0]?.url ? (
                                  <Image src={order.items[0].image_url || order.items[0].image || order.items[0].product?.product_images?.[0]?.url} alt="Product" fill className="object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-neutral-400">No Img</div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className={`text-[10px] md:text-xs font-bold mb-1 uppercase tracking-wider ${order.status === 'delivered' ? 'text-green-600' : 'text-orange-500'}`}>
                                  {order.status === 'delivered' ? `Delivered on ${new Date(order.updated_at || order.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short'})}` : order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                                </p>
                                <p className="text-xs text-neutral-400 mb-1 font-medium tracking-wide">ORDER #{(order.order_number || order.id.split('-')[0]).toUpperCase()}</p>
                                <p className="text-sm text-rich-black line-clamp-1 font-medium">{order.items?.[0]?.product_name || order.items?.[0]?.name || 'Order Item'}</p>
                                {order.items?.length > 1 && <p className="text-xs text-neutral-500 mt-0.5">+{order.items.length - 1} more items</p>}
                              </div>
                            </div>
                            <div>
                              {expandedOrders[order.id] ? <ChevronUp className="w-5 h-5 text-neutral-400" /> : <ChevronDown className="w-5 h-5 text-neutral-400" />}
                            </div>
                          </div>
                          
                          {/* --- EXPANDABLE/DESKTOP DETAILS --- */}
                          <div className={`${expandedOrders[order.id] ? 'block' : 'hidden'} md:block`}>
                            {/* Desktop Order Header */}
                            <div className="hidden md:flex bg-ivory p-6 border-b border-border-light flex-wrap justify-between items-center gap-6">
                              <div className="flex gap-8">
                                <div>
                                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Order Placed</p>
                                  <p className="text-sm font-medium text-rich-black">{new Date(order.created_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Total</p>
                                  <p className="text-sm font-medium text-rich-black">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Order #</p>
                                <p className="text-sm font-medium text-rich-black">{(order.order_number || order.id.split('-')[0]).toUpperCase()}</p>
                              </div>
                            </div>

                            {/* Progress Bar & Status Info */}
                            <div className="p-6 md:px-10 py-8 border-b border-border-light">
                              {['cancelled', 'returned', 'refunded'].includes(order.status) ? (
                                <div className="text-center py-4">
                                  <p className={`font-bold uppercase tracking-widest text-lg ${
                                    order.status === 'cancelled' ? 'text-error' : 
                                    order.status === 'returned' ? 'text-gray-800' : 'text-orange-600'
                                  }`}>
                                    Order {order.status}
                                  </p>
                                </div>
                              ) : (
                                <div className="relative pb-8 pt-2">
                                    {/* The Background Bar */}
                                    <div className="absolute top-[14px] md:top-[15px] left-0 w-full h-[2px] bg-border-light"></div>
                                    
                                    {/* The Active Bar */}
                                    <div 
                                      className="absolute top-[14px] md:top-[15px] left-0 h-[2px] bg-rich-black transition-all duration-700 ease-out" 
                                      style={{ width: `${(
                                        order.status === 'pending_verification' ? 0 :
                                        ['confirmed', 'packed'].includes(order.status) ? 33.3 :
                                        ['shipped', 'out_for_delivery'].includes(order.status) ? 66.6 :
                                        order.status === 'delivered' ? 100 : 0
                                      )}%` }}
                                    ></div>
                                    
                                    {/* The Nodes */}
                                    <div className="relative flex justify-between z-10">
                                      {["Pending", "Confirmed", "Shipped", "Delivered"].map((status, idx) => {
                                        const currentStepIndex = (
                                          order.status === 'pending_verification' ? 0 :
                                          ['confirmed', 'packed'].includes(order.status) ? 1 :
                                          ['shipped', 'out_for_delivery'].includes(order.status) ? 2 :
                                          order.status === 'delivered' ? 3 : 0
                                        );
                                        
                                        const isCompleted = currentStepIndex >= idx;
                                        const isActive = currentStepIndex === idx;
                                        
                                        return (
                                          <div key={status} className="flex flex-col items-center relative w-8">
                                            <div className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-full flex items-center justify-center bg-white border-[2px] transition-colors duration-500 ${isCompleted ? 'border-rich-black' : 'border-border-light'}`}>
                                              {isCompleted && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rich-black"></div>}
                                            </div>
                                            <span className={`absolute top-6 whitespace-nowrap text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase font-medium ${isActive ? 'text-rich-black font-bold' : isCompleted ? 'text-rich-black' : 'text-neutral-400'}`}>
                                              {/* Show all on sm screens, only active on mobile */}
                                              <span className="hidden sm:inline">{status}</span>
                                              <span className="sm:hidden">{isActive ? status : ''}</span>
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                              )}
                            </div>
                            
                            {/* Items */}
                            <div className="p-4 md:p-6 space-y-6">
                              {order.items?.map((item: any, idx: number) => {
                                // Calculate Exchange Eligibility
                                const deliveryDate = new Date(order.created_at);
                                deliveryDate.setDate(deliveryDate.getDate() + 5); // Rough delivery estimate
                                const exchangeDeadline = new Date(deliveryDate);
                                exchangeDeadline.setDate(exchangeDeadline.getDate() + 3); // 72-hour exchange policy (3 days)
                                const isExchangeEligible = order.status === 'delivered' ? new Date() <= exchangeDeadline : true;
                                
                                return (
                                <div key={idx} className="flex flex-col sm:flex-row gap-4 md:gap-6 border-b border-border-light pb-6 last:border-0 last:pb-0">
                                  <div className="flex gap-4 sm:w-full">
                                    <div className="relative w-20 h-28 md:w-24 md:h-32 bg-ivory flex-shrink-0">
                                      {item.image_url || item.image || item.product?.product_images?.[0]?.url ? (
                                        <Image src={item.image_url || item.image || item.product?.product_images?.[0]?.url} alt={item.product_name || item.name || 'Product Image'} fill className="object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs uppercase tracking-widest text-center px-2">No Image</div>
                                      )}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-center">
                                      <h3 className="font-medium text-rich-black text-base md:text-lg mb-1">{item.product_name || item.name}</h3>
                                      <p className="text-xs md:text-sm text-neutral-500 mb-2">{item.color_name || item.color} / {item.size}</p>
                                      <div className="flex items-center gap-3 text-xs md:text-sm">
                                        <span className="font-medium text-rich-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                        <span className="text-neutral-400">|</span>
                                        <span className="text-neutral-500">Qty: {item.quantity}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="sm:text-right flex flex-col justify-center gap-2 mt-2 sm:mt-0">
                                    {order.status === 'delivered' && (
                                      <div className={`text-[10px] flex items-center gap-1 sm:justify-end mb-1 ${isExchangeEligible ? 'text-green-600' : 'text-neutral-400'}`}>
                                        <Info className="w-3 h-3" />
                                        {isExchangeEligible ? `Exchange valid till ${exchangeDeadline.toLocaleDateString('en-US', {day:'numeric', month:'short'})}` : 'Exchange window closed'}
                                      </div>
                                    )}
                                    <button onClick={() => router.push(`/products/${item.product_id}`)} className="bg-rich-black text-white hover:bg-gold px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest font-medium transition-colors w-full sm:w-auto text-center">Buy it again</button>
                                    <button onClick={() => showFeedback('Review system coming soon.')} className="border border-border-light hover:border-rich-black px-4 py-2 text-[10px] md:text-xs uppercase tracking-widest font-medium transition-colors w-full sm:w-auto text-center flex items-center justify-center gap-1">
                                      <Star className="w-3 h-3" /> Write a Review
                                    </button>
                                  </div>
                                </div>
                              )})}
                            </div>

                            {/* Footer Actions */}
                            <div className="bg-ivory p-4 md:px-6 flex flex-col lg:flex-row justify-between lg:items-center border-t border-border-light gap-4">
                              {order.tracking_id ? (
                                <div className="flex items-center gap-2">
                                  <Truck className="w-4 h-4 text-gold flex-shrink-0" />
                                  <span className="text-xs md:text-sm text-rich-black">
                                    Shipped via <span className="font-bold">{order.courier_name}</span> | Tracking: <span className="font-mono font-bold break-all">{order.tracking_id}</span>
                                  </span>
                                </div>
                              ) : (
                                <div className="text-xs md:text-sm text-neutral-400 flex items-center gap-2">
                                  <Truck className="w-4 h-4 flex-shrink-0" /> Tracking info will appear here once shipped.
                                </div>
                              )}
                              
                              <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                                {order.payment_status === 'paid' && (
                                  <button onClick={() => triggerPrint(order)} className="flex-1 lg:flex-none text-[10px] md:text-xs uppercase tracking-widest font-medium hover:text-gold transition-colors flex justify-center items-center gap-1.5 border border-border-light bg-white px-3 py-2.5 md:py-2 hover:border-rich-black">
                                    <FileDown className="w-3 h-3 md:w-4 md:h-4" /> Download Invoice
                                  </button>
                                )}
                                <button onClick={() => window.open(`https://wa.me/919226120292?text=Hey!%20I%20need%20help%20with%20my%20order%20${order.order_number || order.id.split('-')[0]}`, '_blank')} className="flex-1 lg:flex-none text-[10px] md:text-xs uppercase tracking-widest font-medium text-white bg-green-600 hover:bg-green-700 transition-colors flex justify-center items-center gap-1.5 px-3 py-2.5 md:py-2 rounded-sm shadow-sm">
                                  <MessageCircle className="w-3 h-3 md:w-4 md:h-4" /> Need Help?
                                </button>
                              </div>
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
              <div className="bg-white border border-border-light p-4 sm:p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-4 sm:mb-6 flex items-center text-xs sm:text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-gold hover:underline">Your Account</button>
                  <span className="mx-2 text-neutral-400">/</span>
                  <span className="text-rich-black">Your Wishlist</span>
                </div>
                <h2 className="font-serif text-2xl md:text-3xl text-rich-black mb-6 md:mb-8">My Wishlist</h2>
                {debugError && <div className="p-4 bg-red-100 text-red-700 mb-4">{debugError}</div>}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                  {wishlist.length === 0 ? (
                    <div className="col-span-2 md:col-span-3 text-center py-12 border border-dashed border-border-light">
                      <Heart className="w-12 h-12 text-border-light mx-auto mb-4" />
                      <p className="text-neutral-500">Your wishlist is currently empty.</p>
                      <button onClick={() => router.push('/collections/all')} className="mt-4 text-rich-black font-medium hover:text-gold underline underline-offset-4">Discover Pieces</button>
                    </div>
                  ) : (
                    wishlist.map(item => (
                      <div key={item.id} className="group flex flex-col h-full">
                        <div className="relative aspect-[3/4] overflow-hidden bg-ivory mb-3 sm:mb-4">
                          <Image src={item.products?.product_images?.[0]?.url || 'https://via.placeholder.com/400x500'} alt={item.products?.name} fill className="object-cover" />
                          <button onClick={() => handleRemoveFromWishlist(item.id, item.product_id)} className="absolute top-2 right-2 sm:top-3 sm:right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-rich-black hover:text-sale hover:bg-white transition-all shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          {/* Desktop Hover Action */}
                          <div className="hidden md:block absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                            <button onClick={() => handleMoveToCart(item)} className="w-full bg-white/90 backdrop-blur-md text-rich-black hover:bg-gold hover:text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors">
                              Move to Cart
                            </button>
                          </div>
                        </div>
                        <Link href={`/products/${item.products?.slug}`} className="font-medium text-xs sm:text-sm md:text-base text-rich-black hover:text-gold transition-colors mb-1 line-clamp-2 leading-snug">{item.products?.name}</Link>
                        <span className="text-[11px] sm:text-xs md:text-sm text-neutral-500 mb-3">₹{item.products?.price?.toLocaleString('en-IN')}</span>
                        
                        {/* Mobile Action Button (always visible) */}
                        <button onClick={() => handleMoveToCart(item)} className="mt-auto md:hidden w-full bg-ivory border border-border-light text-rich-black py-2.5 text-[10px] uppercase tracking-widest font-medium hover:bg-rich-black hover:text-white transition-colors">
                          Move to Cart
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white border border-border-light p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-gold hover:underline">Your Account</button>
                  <span className="mx-2 text-neutral-400">/</span>
                  <span className="text-rich-black">Your Addresses</span>
                </div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-3xl text-rich-black">Saved Addresses</h2>
                  <button onClick={() => setShowAddressForm(!showAddressForm)} className="bg-rich-black text-white hover:bg-gold text-xs uppercase tracking-widest font-medium px-6 py-3 transition-colors flex items-center gap-2">
                    {showAddressForm ? "Cancel" : <><Plus className="w-4 h-4" /> Add New Address</>}
                  </button>
                </div>

                {showAddressForm && (
                  <form onSubmit={handleSaveAddress} className="mb-12 bg-ivory p-8 border border-border-light">
                    <h3 className="font-serif text-xl mb-6">Add New Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Full Name</label>
                        <input required type="text" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Address Line 1</label>
                        <input required type="text" value={addressForm.address_line1} onChange={e => setAddressForm({...addressForm, address_line1: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Address Line 2 (Optional)</label>
                        <input type="text" value={addressForm.address_line2} onChange={e => setAddressForm({...addressForm, address_line2: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">City</label>
                        <input required type="text" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">State / Province</label>
                        <select required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold text-neutral-500">
                          <option value="" disabled>Select State</option>
                          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Postal / Zip Code</label>
                        <input required type="text" value={addressForm.postal_code} onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Country</label>
                        <input required type="text" value={addressForm.country} onChange={e => setAddressForm({...addressForm, country: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Landmark (Optional)</label>
                        <input type="text" value={addressForm.landmark} onChange={e => setAddressForm({...addressForm, landmark: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Phone Number</label>
                        <input required type="tel" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Alternate Phone (Optional)</label>
                        <input type="tel" value={addressForm.alternate_phone} onChange={e => setAddressForm({...addressForm, alternate_phone: e.target.value})} className="w-full bg-white border border-border-light p-3 focus:outline-none focus:border-gold" />
                      </div>
                    </div>
                    <button disabled={isSubmittingAddress} type="submit" className="bg-rich-black hover:bg-gold text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors">
                      {isSubmittingAddress ? "Saving..." : "Save Address"}
                    </button>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.length === 0 ? (
                    <div className="col-span-2 text-center py-12 border border-dashed border-border-light">
                      <MapPin className="w-12 h-12 text-border-light mx-auto mb-4" />
                      <p className="text-neutral-500">You don't have any saved addresses.</p>
                    </div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className={`border p-6 relative transition-colors ${addr.is_default ? 'border-gold bg-ivory' : 'border-border-light hover:border-rich-black'}`}>
                        {addr.is_default && <span className="absolute top-0 right-0 bg-gold text-white text-[10px] uppercase tracking-widest px-3 py-1">Default</span>}
                        <h3 className="font-medium mb-2 text-rich-black">{addr.name}</h3>
                        <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                          {addr.address_line1}<br />
                          {addr.address_line2 && <>{addr.address_line2}<br /></>}
                          {addr.city}, {addr.state} {addr.postal_code}<br />
                          {addr.country}<br />
                          {addr.landmark && <>Landmark: {addr.landmark}<br /></>}
                          Phone: {addr.phone || userProfile?.phone || 'Not provided'}<br />
                          {addr.alternate_phone && <>Alternate Phone: {addr.alternate_phone}</>}
                        </p>
                        <div className="flex gap-4 pt-4 border-t border-border-light">
                          {!addr.is_default && (
                            <button onClick={() => handleSetDefaultAddress(addr.id)} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-gold transition-colors">Set Default</button>
                          )}
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-sale transition-colors">Delete</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white border border-border-light p-8 lg:p-12 rounded-sm shadow-sm">
                <div className="mb-6 flex items-center text-sm font-medium">
                  <button onClick={() => setActiveTab("home")} className="text-gold hover:underline">Your Account</button>
                  <span className="mx-2 text-neutral-400">/</span>
                  <span className="text-rich-black">Login & Security</span>
                </div>
                <h2 className="font-serif text-3xl text-rich-black mb-8">Login & Security</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {/* Personal Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-6 border-b border-border-light pb-2">Personal Information</h3>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">First Name</label>
                          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-ivory border border-border-light p-4 focus:outline-none focus:border-gold transition-colors" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Last Name</label>
                          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-ivory border border-border-light p-4 focus:outline-none focus:border-gold transition-colors" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Phone Number</label>
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-ivory border border-border-light p-4 focus:outline-none focus:border-gold transition-colors" />
                      </div>
                      <button type="submit" className="bg-rich-black hover:bg-gold text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors w-full">
                        Save Personal Info
                      </button>
                    </form>
                  </div>

                  {/* Security */}
                  <div>
                    <h3 className="font-medium text-lg mb-6 border-b border-border-light pb-2">Account Security</h3>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">Email Address</label>
                        <input type="email" value={userProfile?.email || ""} disabled className="w-full bg-border-light border border-border-light p-4 text-neutral-500 cursor-not-allowed" />
                        <p className="text-xs text-neutral-400 mt-2">Email address cannot be changed.</p>
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-2">New Password</label>
                        <input type="password" placeholder="Leave blank to keep current password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-ivory border border-border-light p-4 focus:outline-none focus:border-gold transition-colors" />
                        <button disabled={!newPassword || isUpdatingPassword} type="submit" className="bg-rich-black hover:bg-gold disabled:opacity-50 disabled:hover:bg-rich-black text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors w-full">
                          {isUpdatingPassword ? "Updating..." : "Update Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden Printable Invoice Template */}
            {selectedOrderToPrint && invoiceSettings && (
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
                      <span className="text-right uppercase">{selectedOrderToPrint.order_number || selectedOrderToPrint.id.slice(0, 8)}</span>
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
                    <p className="font-bold text-rich-black text-lg">{selectedOrderToPrint.customer_name}</p>
                    <p className="text-sm text-gray-600 mt-1">{selectedOrderToPrint.customer_email}</p>
                    <p className="text-sm text-gray-600 mb-2">{selectedOrderToPrint.customer_phone}</p>
                  </div>
                  {selectedOrderToPrint.shipping_address && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Shipped To</h3>
                      <p className="font-bold text-rich-black">{selectedOrderToPrint.shipping_address.name || selectedOrderToPrint.customer_name}</p>
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
                      <tr className="bg-ivory border-y border-rich-black">
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
                      <span>₹{selectedOrderToPrint.subtotal?.toLocaleString('en-IN') ?? selectedOrderToPrint.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm text-gray-600 border-b border-gray-200">
                      <span>Shipping &amp; Handling</span>
                      <span>₹{selectedOrderToPrint.shipping_fee?.toLocaleString('en-IN') ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-4 text-xl font-bold text-rich-black">
                      <span>Grand Total</span>
                      <span>₹{selectedOrderToPrint.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Footer & T&C */}
                <div className="grid grid-cols-2 gap-8 border-t-2 border-border-light pt-8 text-xs text-gray-500">
                  <div>
                    <h4 className="font-bold text-rich-black mb-2 uppercase tracking-widest">Terms & Conditions</h4>
                    <ul className="list-disc pl-4 space-y-1">
                      {invoiceSettings.terms.split('\n').map((term: string, idx: number) => (
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
            
            {/* Wishlist to Cart Modal */}
            {wishlistModalItem && (
              <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-ivory w-full max-w-md p-6 relative rounded-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={() => setWishlistModalItem(null)} className="absolute top-4 right-4 text-neutral-400 hover:text-rich-black transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif text-2xl text-rich-black mb-1">Move to Cart</h3>
                  <p className="text-sm text-neutral-500 mb-6">Select options for {wishlistModalItem.products?.name}</p>
                  
                  {(() => {
                    const variants = wishlistModalItem.products?.product_variants || [];
                    const colors = Array.from(new Set(variants.map((v: any) => v.color_name).filter(Boolean))) as string[];
                    const sizesRaw = wishlistModalColor 
                      ? variants.filter((v: any) => v.color_name === wishlistModalColor && (v.stock_quantity > 0)).map((v: any) => v.size)
                      : variants.filter((v: any) => v.stock_quantity > 0).map((v: any) => v.size);
                    const sizes = Array.from(new Set(sizesRaw.filter(Boolean))) as string[];
                    
                    const productSizes = wishlistModalItem.products?.sizes || [];
                    const hasCustomAllowed = productSizes.includes("Custom") || variants.some((v: any) => v.size === "Custom");
                    
                    if (sizes.length > 0 && !sizes.includes("Custom") && hasCustomAllowed) {
                      sizes.push("Custom");
                    }
                    
                    return (
                      <div className="space-y-6">
                        {colors.length > 0 && (
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Color</label>
                            <div className="flex flex-wrap gap-2">
                              {colors.map((color) => {
                                const baseColorName = color.split("||")[0];
                                return (
                                  <button
                                    key={color}
                                    onClick={() => {
                                      setWishlistModalColor(color);
                                      const newSizes = variants.filter((v: any) => v.color_name === color && (v.stock_quantity > 0)).map((v: any) => v.size);
                                      if (newSizes.length > 0 && !newSizes.includes(wishlistModalSize) && wishlistModalSize !== "Custom") {
                                        setWishlistModalSize(newSizes[0]);
                                      }
                                    }}
                                    className={`px-3 py-2 text-xs border transition-colors ${wishlistModalColor === color ? 'border-rich-black bg-rich-black text-white' : 'border-border-light hover:border-rich-black'}`}
                                  >
                                    {baseColorName}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {sizes.length > 0 && (
                          <div>
                            <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-2">Size</label>
                            <div className="flex flex-wrap gap-2">
                              {sizes.map((size) => (
                                <button
                                  key={size}
                                  onClick={() => {
                                    setWishlistModalSize(size);
                                    setWishlistModalError("");
                                  }}
                                  className={`w-12 h-12 flex items-center justify-center border text-xs transition-colors ${wishlistModalSize === size ? 'border-rich-black bg-rich-black text-white' : 'border-border-light hover:border-rich-black'} ${size === 'Custom' ? 'w-auto px-4' : ''}`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {wishlistModalSize === "Custom" && (
                          <div className="space-y-4 pt-4 border-t border-border-light">
                            <h4 className="text-xs uppercase tracking-widest text-rich-black">Custom Measurements (inches)</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Bust</label>
                                <input type="text" value={wishlistModalMeasurements.bust} onChange={e => { setWishlistModalMeasurements({...wishlistModalMeasurements, bust: e.target.value}); setWishlistModalError(""); }} className="w-full border border-border-light p-2 text-sm focus:border-gold focus:outline-none bg-white" placeholder="e.g. 34" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Waist</label>
                                <input type="text" value={wishlistModalMeasurements.waist} onChange={e => { setWishlistModalMeasurements({...wishlistModalMeasurements, waist: e.target.value}); setWishlistModalError(""); }} className="w-full border border-border-light p-2 text-sm focus:border-gold focus:outline-none bg-white" placeholder="e.g. 28" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Hips</label>
                                <input type="text" value={wishlistModalMeasurements.hips} onChange={e => { setWishlistModalMeasurements({...wishlistModalMeasurements, hips: e.target.value}); setWishlistModalError(""); }} className="w-full border border-border-light p-2 text-sm focus:border-gold focus:outline-none bg-white" placeholder="e.g. 38" />
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase text-neutral-500 mb-1">Length</label>
                                <input type="text" value={wishlistModalMeasurements.length} onChange={e => { setWishlistModalMeasurements({...wishlistModalMeasurements, length: e.target.value}); setWishlistModalError(""); }} className="w-full border border-border-light p-2 text-sm focus:border-gold focus:outline-none bg-white" placeholder="e.g. 40" />
                              </div>
                            </div>
                            {wishlistModalError && <p className="text-red-500 text-xs">{wishlistModalError}</p>}
                          </div>
                        )}
                        
                        <button onClick={handleConfirmMoveToCart} className="w-full bg-rich-black text-white py-3 mt-4 text-xs uppercase tracking-widest font-medium hover:bg-gold transition-colors">
                          Confirm & Add
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
          </main>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-ivory"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>}>
      <AccountContent />
    </Suspense>
  );
}
