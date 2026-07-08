"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Wallet, Truck, ChevronLeft, ChevronRight, Check, Loader2, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

const steps = ["Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [transactionId, setTransactionId] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [paymentScreenshotPreview, setPaymentScreenshotPreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discountMsg, setDiscountMsg] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isFreeShippingCouponApplied, setIsFreeShippingCouponApplied] = useState(false);
  const router = useRouter();
  
  const { items: cartItems, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if cart is empty after mount, unless order is completed
  useEffect(() => {
    if (mounted && cartItems.length === 0 && !orderCompleted) {
      router.push('/collections/all');
    }
  }, [mounted, cartItems.length, router, orderCompleted]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMsg("Please enter a discount code.");
      setAppliedCoupon(null);
      setIsFreeShippingCouponApplied(false);
      return;
    } 

    try {
      const { data, error } = await supabase.from('coupons')
        .select('*')
        .eq('code', discountCode.toUpperCase())
        .eq('is_active', true)
        .single();
        
      if (error || !data) {
        setDiscountMsg(`"${discountCode.toUpperCase()}" is not a valid or active discount code.`);
        setAppliedCoupon(null);
        setIsFreeShippingCouponApplied(false);
      } else {
        const currentSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
        if (currentSubtotal < data.min_order_value) {
          setDiscountMsg(`Minimum order value for this coupon is ₹${data.min_order_value}`);
          setAppliedCoupon(null);
          setIsFreeShippingCouponApplied(false);
        } else {
          setAppliedCoupon(data);
          setIsFreeShippingCouponApplied(!!data.is_free_shipping);
          setDiscountMsg(`${data.code} applied! ✓`);
        }
      }
    } catch (err) {
      setDiscountMsg("Error applying discount.");
    }
    
    setTimeout(() => {
      setDiscountMsg("");
    }, 4000);
  };

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  // Form states for guest checkout / new address
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");

  const [shippingSettings, setShippingSettings] = useState({ free_shipping_threshold: 10000, flat_rate: 250 });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/account');
        return;
      }
      setIsLoggedIn(true);
        // Fetch profile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (profile) {
          setUserProfile(profile);
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
        } else {
          setEmail(session.user.email || "");
        }
        
        // Fetch addresses
        const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', session.user.id).order('is_default', { ascending: false });
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          setSelectedAddress(addresses[0].id);
        }
      
      const { data: settings } = await supabase.from('store_settings').select('value').eq('key', 'shipping').single();
      if (settings?.value) {
        setShippingSettings(settings.value);
      }
      
      setIsLoadingAuth(false);
    }
    checkAuth();
  }, []);

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentScreenshot(e.target.files[0]);
      setPaymentScreenshotPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'upi' && (!transactionId || !paymentScreenshot)) {
      setFormError("Please enter Transaction ID and upload screenshot.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        let screenshotUrl = "";
        
        if (paymentScreenshot) {
          const fileExt = paymentScreenshot.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment_screenshots')
            .upload(fileName, paymentScreenshot);
            
          if (uploadData) {
            const { data } = supabase.storage.from('payment_screenshots').getPublicUrl(fileName);
            screenshotUrl = data.publicUrl;
          }
        }

        let shippingAddr = null;
        if (isLoggedIn && selectedAddress && !showNewAddressForm) {
          shippingAddr = savedAddresses.find(a => a.id === selectedAddress);
        } else {
          shippingAddr = {
            name: `${firstName} ${lastName}`.trim(),
            address_line1: addressLine1,
            address_line2: addressLine2,
            city,
            state,
            postal_code: pinCode,
            phone,
            landmark,
            alternate_phone: alternatePhone
          };
        }

        // 0. Pre-validate Cart Items to prevent ghost orders
        const productIds = cartItems.map(item => item.id);
        const { data: validProducts, error: valErr } = await supabase
          .from('products')
          .select('id')
          .in('id', productIds);
          
        if (valErr) throw valErr;
        
        if (!validProducts || validProducts.length !== productIds.length) {
          setFormError("Some items in your cart are no longer available in our store. Please review and update your cart.");
          setIsSubmitting(false);
          return;
        }

        // 1. Generate Order Number & ID
        let orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        try {
          const { data: seqNumber, error: rpcError } = await supabase.rpc('generate_order_number');
          if (!rpcError && seqNumber) {
            orderNumber = seqNumber;
          }
        } catch (e) {
          console.error("RPC fallback to random order number", e);
        }
        const orderId = crypto.randomUUID();

        // 2. Insert Order
        const { error } = await supabase.from('orders').insert({
          id: orderId,
          order_number: orderNumber,
          customer_name: isLoggedIn && userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || email : `${firstName} ${lastName}`.trim() || email,
          customer_email: isLoggedIn && userProfile ? userProfile.email : email,
          customer_phone: isLoggedIn && userProfile ? userProfile.phone : phone,
          shipping_address: shippingAddr,
          subtotal,
          shipping_fee: shipping,
          total_amount: total,
          payment_method: paymentMethod,
          transaction_id: transactionId,
          screenshot_url: screenshotUrl,
          status: 'pending',
          payment_status: 'pending'
        });

        if (error) throw error;
        
        // 3. Insert Order Items
        const orderItems = cartItems.map(item => ({
          order_id: orderId,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          price: item.price,
          color_name: item.color,
          size: item.size,
          image_url: item.image
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;
        
        // Send Order Confirmation Email
        const orderEmail = isLoggedIn && userProfile ? userProfile.email : email;
        const orderName = isLoggedIn && userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || email : `${firstName} ${lastName}`.trim() || email;
        
        try {
          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: orderEmail,
              subject: 'Order Confirmation - Tranquil',
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
                  <h1 style="text-align: center; font-weight: normal; margin-bottom: 30px;">TRANQUIL</h1>
                  <p>Hi ${orderName},</p>
                  <p>Thank you for your order! We've received it and will process it shortly.</p>
                  <p><strong>Order ID:</strong> #{orderNumber}</p>
                  <p><strong>Total:</strong> ₹${total.toLocaleString()}</p>
                  <p>We will notify you once your order has been dispatched.</p>
                  <p style="margin-top: 40px; font-size: 12px; color: #666;">Tranquil Team</p>
                </div>
              `
            })
          });
        } catch (emailErr) {
          console.error("Failed to send order email:", emailErr);
        }

        setOrderCompleted(true);
        clearCart();
        router.push(`/checkout/success?order=${orderNumber}`);
      } else {
        // Fallback simulate backend processing delay
        await new Promise(r => setTimeout(r, 1500));
        setOrderCompleted(true);
        clearCart();
        router.push('/checkout/success');
      }
    } catch (err) {
      console.error(err);
      setFormError("Error placing order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100;
    } else {
      discountAmount = appliedCoupon.discount_value;
    }
  }
  const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);
  
  const shipping = isFreeShippingCouponApplied || subtotalAfterDiscount >= shippingSettings.free_shipping_threshold ? 0 : shippingSettings.flat_rate;
  const total = subtotalAfterDiscount + shipping;

  const nextStep = async () => {
    setFormError("");
    if (currentStep === 0) { // Shipping
      const usingNew = !selectedAddress || showNewAddressForm || savedAddresses.length === 0;
      if (usingNew) {
        if (!addressLine1 || !city || !state || !pinCode || !phone) {
          setFormError("Please fill in all required address fields.");
          return;
        }
        if (addressLine1.length < 5 || city.length < 2 || state.length < 2) {
          setFormError("Please enter a valid address, city, and state.");
          return;
        }
        if (!/^[1-9][0-9]{5}$/.test(pinCode)) {
          setFormError("Please enter a valid 6-digit Indian PIN Code.");
          return;
        }
        
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pinCode}`);
          const data = await res.json();
          if (data[0]?.Status === "Error" || data[0]?.Status === "404") {
            setFormError("The PIN Code you entered does not appear to be valid. Please check and try again.");
            return;
          }
        } catch (err) {
          console.error("Pincode validation error", err);
        }
        
        if (isLoggedIn && userProfile && savedAddresses.length === 0) {
          const { data, error } = await supabase.from('addresses').insert({
            user_id: userProfile.id,
            name: "Home",
            address_line1: addressLine1,
            address_line2: addressLine2,
            city: city,
            state: state,
            postal_code: pinCode,
            country: 'India',
            phone: phone || userProfile?.phone,
            landmark,
            alternate_phone: alternatePhone,
            is_default: true
          }).select().single();
          
          if (data && !error) {
            setSavedAddresses([data]);
            setSelectedAddress(data.id);
            setShowNewAddressForm(false);
          }
        }
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };
  const prevStep = () => { setFormError(""); setCurrentStep(prev => Math.max(prev - 1, 0)); };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-36 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium hover:text-[#C7A17A] transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Return to Shop
        </Link>
        
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Checkout Form */}
          <div className="flex-1">
            <h1 className="font-serif text-4xl text-[#111111] mb-8">Checkout</h1>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-10 text-xs sm:text-sm uppercase tracking-widest font-medium overflow-x-auto no-scrollbar pb-2">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2 whitespace-nowrap">
                  <span className={`${index <= currentStep ? 'text-[#111111]' : 'text-[#999999]'}`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-[#CCCCCC]" />}
                </div>
              ))}
            </div>
            
            {formError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-sm">
                {formError}
              </div>
            )}

            <div>
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Shipping Address</h2>
                    {isLoggedIn ? (
                      <div className="space-y-4">
                        {savedAddresses.map(addr => (
                          <div 
                            key={addr.id} 
                            className={`border p-6 cursor-pointer transition-colors rounded-sm ${selectedAddress === addr.id ? 'border-[#C7A17A] bg-[#FAF8F5]' : 'border-[#EFEFEF] bg-white hover:border-[#CCCCCC]'}`} 
                            onClick={() => setSelectedAddress(addr.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <input type="radio" checked={selectedAddress === addr.id} readOnly className="accent-[#C7A17A]" />
                                <span className="font-medium text-sm text-[#111111]">{addr.name}</span>
                                {addr.is_default && <span className="text-[10px] uppercase tracking-wider bg-[#EFEFEF] px-2 py-1 rounded-sm text-[#666666]">Default</span>}
                              </div>
                            </div>
                            <p className="text-sm text-[#666666] ml-7">{addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ', ' : ''}{addr.city}, {addr.state} - {addr.postal_code}</p>
                            <p className="text-sm text-[#666666] ml-7 mt-1">{addr.phone || userProfile?.phone}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                          className="text-sm text-[#C7A17A] hover:text-[#111111] transition-colors mt-4 flex items-center gap-2 font-medium"
                        >
                          <Plus className="w-4 h-4" /> {showNewAddressForm ? 'Cancel' : 'Add a new address'}
                        </button>
                        <AnimatePresence>
                          {showNewAddressForm && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 space-y-4 border border-[#EFEFEF] p-4 rounded-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="text" placeholder="Address Name (e.g. Home)" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Street Address" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <select value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm text-[#666]">
                                    <option value="" disabled>Select State</option>
                                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                  <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="PIN Code" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                  <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="Landmark (Optional)" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Primary Phone Number" required className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                  <input type="tel" value={alternatePhone} onChange={e => setAlternatePhone(e.target.value)} placeholder="Alternate Phone (Optional)" className="w-full bg-white border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                                </div>
                                <button className="bg-[#111111] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-[#C7A17A] transition-colors">
                                  Save Address
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                          <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        </div>
                        <input type="text" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} placeholder="Address" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        <input type="text" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                          <select value={state} onChange={e => setState(e.target.value)} className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors text-[#666]">
                              <option value="" disabled>Select State</option>
                              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} placeholder="PIN Code" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Payment Method</h2>
                    <p className="text-sm text-[#666666] flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Scan the QR code to pay instantly via UPI.
                    </p>
                    <div className="bg-white border border-[#EFEFEF] rounded-sm overflow-hidden">
                      <label 
                        className="flex items-center gap-3 p-4 border-b border-[#EFEFEF] cursor-pointer hover:bg-[#FAF8F5] transition-colors"
                        onClick={() => setPaymentMethod("upi")}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-[#C7A17A]" />
                        <Wallet className="w-5 h-5 text-[#666666]" />
                        <span>Pay via UPI (GPay, PhonePe, Paytm)</span>
                      </label>
                      
                      <AnimatePresence>
                        {paymentMethod === "upi" && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-8 bg-[#FAF8F5] border-b border-[#EFEFEF] flex flex-col items-center justify-center text-center">
                              <div className="bg-[#FFF8E7] border border-[#F2D08E] text-[#B07B18] p-4 rounded-md mb-6 max-w-[350px] text-xs leading-relaxed text-left">
                                <span className="font-bold block mb-1">Important:</span> 
                                After completing your payment, you <strong>must return to this page</strong> to enter your Transaction Number and upload a payment screenshot. Then proceed to the next step and press <strong>Place Order</strong> to successfully complete your purchase.
                              </div>
                              <p className="text-sm font-medium mb-4">Scan to pay <span className="font-[family-name:var(--font-montserrat)] font-bold text-[#111111]">₹{total.toLocaleString('en-IN')}</span></p>
                              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#EFEFEF] mb-4">
                                <Image 
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=7827555428@slc&pn=Tranquil&am=${total}&cu=INR`)}`} 
                                  alt="UPI QR Code" 
                                  width={200} 
                                  height={200} 
                                  className="rounded-lg"
                                  unoptimized
                                />
                              </div>
                              <p className="text-xs text-[#666666] max-w-[250px] mb-6">Open any UPI app and scan the QR code to complete your purchase securely.</p>
                              
                              <div className="w-full max-w-[300px] flex flex-col gap-3 mb-8">
                                <a href={`phonepe://pay?pa=7827555428@slc&pn=Tranquil&am=${total}&cu=INR`} className="w-full bg-[#5E328A] text-white py-3 rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#4d2972] transition-colors shadow-sm">
                                  Pay using PhonePe
                                </a>
                                <a href={`paytmmp://pay?pa=7827555428@slc&pn=Tranquil&am=${total}&cu=INR`} className="w-full bg-[#002970] text-white py-3 rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#001d52] transition-colors shadow-sm">
                                  Pay using Paytm
                                </a>
                                <a href={`tez://upi/pay?pa=7827555428@slc&pn=Tranquil&am=${total}&cu=INR`} className="w-full bg-white border border-[#EFEFEF] text-[#111111] py-3 rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#FAF8F5] transition-colors shadow-sm">
                                  Pay using Google Pay
                                </a>
                                <a href={`upi://pay?pa=7827555428@slc&pn=Tranquil&am=${total}&cu=INR`} className="w-full bg-[#111111] text-white py-3 rounded-md flex items-center justify-center text-sm font-medium hover:bg-[#333333] transition-colors shadow-sm lg:hidden mt-2">
                                  Other UPI Apps
                                </a>
                              </div>
                              
                              <div className="w-full max-w-[300px] space-y-4 text-left border-t border-[#EFEFEF] pt-6">
                                <div>
                                  <label className="block text-xs font-medium text-[#111111] mb-1 uppercase tracking-wider">Transaction ID / UTR No.</label>
                                  <input 
                                    type="text" 
                                    placeholder="Enter 12-digit UTR" 
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    className="w-full bg-white border border-[#EFEFEF] p-3 text-sm focus:outline-none focus:border-[#C7A17A] transition-colors rounded-sm" 
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-[#111111] mb-1 uppercase tracking-wider">Payment Screenshot</label>
                                  <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleScreenshotUpload}
                                    className="w-full bg-white border border-[#EFEFEF] p-2 text-xs focus:outline-none focus:border-[#C7A17A] transition-colors rounded-sm file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-xs file:font-medium file:bg-[#111111] file:text-white hover:file:bg-[#C7A17A] file:transition-colors file:cursor-pointer cursor-pointer" 
                                  />
                                  {paymentScreenshotPreview && (
                                    <p className="text-xs text-[#2F855A] mt-2 flex items-center gap-1 font-medium">
                                      <Check className="w-3 h-3" /> Screenshot attached
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <label 
                        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors border-t border-[#EFEFEF]"
                        onClick={() => setPaymentMethod("cod")}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="accent-[#C7A17A]" />
                        <Truck className="w-5 h-5 text-[#666666]" />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                      
                      <AnimatePresence>
                        {paymentMethod === "cod" && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-6 bg-[#FAF8F5] border-t border-[#EFEFEF]">
                              <p className="text-sm text-[#666666] text-center">Pay with cash when your order is delivered to your doorstep.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Review Your Order</h2>
                    
                    <div className="bg-white border border-[#EFEFEF] p-6 text-sm">

                      <div className="flex justify-between border-b border-[#EFEFEF] pb-4 mb-4">
                        <div className="text-[#666666]">Ship to</div>
                        <div className="text-[#111111] text-right max-w-[200px]">
                          {isLoggedIn && selectedAddress && !showNewAddressForm ? (
                            (() => {
                              const addr = savedAddresses.find(a => a.id === selectedAddress);
                              return addr ? `${addr.address_line1}, ${addr.city}, ${addr.postal_code}` : '';
                            })()
                          ) : (
                            `${addressLine1}, ${city}, ${pinCode}`
                          )}
                        </div>
                        <button onClick={() => setCurrentStep(0)} className="text-[#C7A17A] hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-[#666666]">Payment</div>
                        <div className="text-[#111111]">{paymentMethod === "upi" ? "UPI QR Code" : "Cash on Delivery"}</div>
                        <button onClick={() => setCurrentStep(1)} className="text-[#C7A17A] hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-[#EFEFEF]">
              {currentStep > 0 ? (
                <button 
                  onClick={prevStep}
                  className="text-[#111111] hover:text-[#C7A17A] transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-medium w-full sm:w-auto justify-center"
                >
                  <ChevronLeft className="w-4 h-4" /> Return to {steps[currentStep - 1]}
                </button>
              ) : (
                <div /> // empty div to maintain flex justify-between
              )}

              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={nextStep}
                  className="bg-[#111111] hover:bg-[#C7A17A] text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  Continue to {steps[currentStep + 1]}
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="bg-[#C7A17A] hover:bg-[#111111] text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              )}
            </div>
            <p className="text-center text-xs text-[#666666] mt-6">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white border border-[#EFEFEF] p-6 lg:p-8 sticky top-32">
              <h2 className="font-serif text-2xl text-[#111111] mb-6">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                {mounted && cartItems.length === 0 ? (
                  <p className="text-sm text-[#666666]">Your cart is empty.</p>
                ) : (
                  cartItems.map(item => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4">
                      <div className="relative w-20 h-28 bg-[#FAF8F5] flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#666666] text-white text-[10px] flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h3 className="text-sm font-medium mb-1 line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-[#666666] mb-2">{item.color} / {item.size}</p>
                        <p className="font-medium text-sm font-[family-name:var(--font-montserrat)]">₹{item.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-8 border-t border-[#EFEFEF] pt-6">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount Code"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                    className="flex-1 bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm uppercase"
                  />
                  <button onClick={handleApplyDiscount} className="bg-[#111111] hover:bg-[#C7A17A] text-white px-6 uppercase tracking-widest text-xs font-medium transition-colors">Apply</button>
                </div>
                {discountMsg && <p className={`text-xs mt-2 ${discountMsg.includes('✓') ? 'text-[#2F855A]' : 'text-[#E63946]'}`}>{discountMsg}</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-[#EFEFEF] pt-6 text-sm">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium font-[family-name:var(--font-montserrat)]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-[#2F855A]">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-medium font-[family-name:var(--font-montserrat)]">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#666666]">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-[#2F855A] font-medium uppercase tracking-widest text-xs">Free</span>
                  ) : (
                    <span className="text-[#111111] font-medium font-[family-name:var(--font-montserrat)]">₹{shipping.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex justify-between text-[#666666]">
                  <span>Taxes</span>
                  <span className="text-[#111111]">Calculated at checkout</span>
                </div>
                <div className="flex justify-between items-center border-t border-[#EFEFEF] mt-6 pt-6">
                  <span className="font-serif text-xl">Total</span>
                  <span className="font-serif text-2xl font-[family-name:var(--font-montserrat)]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
