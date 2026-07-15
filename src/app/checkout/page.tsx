"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Wallet, ChevronLeft, ChevronRight, Check, Loader2, Plus, Trash2, Minus, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useCartStore } from "@/store/useCartStore";

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number | null;
  is_active: boolean;
  used_count: number;
  is_free_shipping?: boolean;
}

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

interface Address {
  id: string;
  user_id: string;
  title: string | null;
  name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string | null;
  phone: string | null;
  is_default: boolean | null;
}

interface ShippingSettings {
  free_shipping_threshold: number;
  flat_rate: number;
}

const addressSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  addressLabel: z.string().optional(),
  addressLine1: z.string().min(5, "Address must be at least 5 characters"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pinCode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit Indian PIN Code is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  alternatePhone: z.string().optional(),
  landmark: z.string().optional(),
});
type AddressFormData = z.infer<typeof addressSchema>;


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
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isFreeShippingCouponApplied, setIsFreeShippingCouponApplied] = useState(false);
  const router = useRouter();
  
  const { items: cartItems, clearCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [paymentRef, setPaymentRef] = useState("");
  
  const { register, trigger, watch, setValue, formState: { errors: formErrors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      firstName: "", lastName: "", addressLine1: "", addressLine2: "", city: "", state: "", pinCode: "", phone: "", alternatePhone: "", landmark: "", addressLabel: ""
    }
  });

  const formData = watch();
  const { firstName, lastName, addressLine1, addressLine2, city, state, pinCode, phone, alternatePhone, landmark, addressLabel } = formData;
  
  useEffect(() => {
    setMounted(true);
    
    async function initOrderRef() {
      let tempId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
      try {
        const supabase = createClient();
        const { data: seqNumber, error } = await supabase.rpc('generate_order_number');
        if (!error && seqNumber) {
          tempId = seqNumber;
        }
      } catch (e) {
        console.error("RPC fallback to random order number", e);
      }
      setPaymentRef(tempId);
    }
    
    initOrderRef();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

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
        if (data.min_order_value !== null && currentSubtotal < data.min_order_value) {
          setDiscountMsg(`Minimum order value for this coupon is ₹${data.min_order_value}`);
          setAppliedCoupon(null);
          setIsFreeShippingCouponApplied(false);
        } else {
          setAppliedCoupon(data as Coupon);
          setIsFreeShippingCouponApplied(!!(data as Coupon).is_free_shipping);
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
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");

  const [email, setEmail] = useState("");
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({ free_shipping_threshold: 10000, flat_rate: 250 });
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
      
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (profile) {
        setUserProfile(profile);
          setValue("firstName", profile.first_name || "");
          setValue("lastName", profile.last_name || "");
          setEmail(profile.email || "");
          setValue("phone", profile.phone || "");
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
        setShippingSettings(settings.value as unknown as ShippingSettings);
      }
      
      setIsLoadingAuth(false);
    }
    checkAuth();
  }, []);

  const handleSaveNewAddress = async () => {
    const isValid = await trigger();
    if (!isValid) {
      setFormError("Please check the form for errors.");
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    // Use a provided name if one was added (for instance via another input, though there's no state for Address Name).
    // The screenshot shows the first field is "ajsdkasjdhaj". Wait, looking at the inputs:
    // Address Name (e.g. Home), Street Address
    // The "Address Name" input isn't bound to state! Let's bind it to firstName temporarily or just rely on what is in state.
    // I'll add an `addressName` state below. Wait, I can't add state hooks conditionally or randomly, I must add it to the top.
    
    let combinedAddressLine2 = addressLine2 || "";
    if (landmark) combinedAddressLine2 += (combinedAddressLine2 ? ", " : "") + `Landmark: ${landmark}`;
    if (alternatePhone) combinedAddressLine2 += (combinedAddressLine2 ? ", " : "") + `Alt Phone: ${alternatePhone}`;
    
    const newAddress = {
      user_id: session.user.id,
      title: addressLabel || "Home",
      name: userProfile?.first_name ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim() : "New Address",
      address_line1: addressLine1,
      address_line2: combinedAddressLine2,
      city,
      state,
      postal_code: pinCode,
      phone,
      is_default: savedAddresses.length === 0
    };

    const { data, error } = await supabase.from('addresses').insert(newAddress).select().single();
    
    if (error) {
      console.error("Address save error:", error);
      setFormError("An unexpected error occurred while saving your address. Please try again.");
    } else if (data) {
      setSavedAddresses([data, ...savedAddresses]);
      setSelectedAddress(data.id);
      setShowNewAddressForm(false);
      setFormError("");
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFormError("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setFormError("Only image files are allowed");
        return;
      }
      
      setFormError(""); // Clear any previous errors
      setPaymentScreenshot(file);
      setPaymentScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handlePlaceOrder = async () => {
    let finalTransactionId = transactionId.trim();

    if (paymentMethod === 'upi') {
      if (!finalTransactionId || !paymentScreenshot) {
        setFormError("Please enter Transaction ID and upload screenshot.");
        return;
      }

      if (!/^\d{12,16}$/.test(finalTransactionId)) {
        setFormError("Transaction ID must be between 12 and 16 numeric digits.");
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        if (paymentMethod === 'upi') {
          const { data: existingOrder, error: checkError } = await supabase
            .from('orders')
            .select('id')
            .eq('transaction_id', finalTransactionId)
            .maybeSingle();
            
          if (checkError) throw checkError;
          if (existingOrder) {
            setFormError("This Transaction ID has already been submitted.");
            setIsSubmitting(false);
            return;
          }
        }

        let screenshotUrl = "";
        
        if (paymentScreenshot) {
          const fileExt = paymentScreenshot.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('payment_screenshots')
            .upload(fileName, paymentScreenshot);
            
          if (uploadError || !uploadData) {
            throw new Error("Failed to upload payment screenshot. Please try again.");
          }
          const { data } = supabase.storage.from('payment_screenshots').getPublicUrl(fileName);
          screenshotUrl = data.publicUrl;
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

        // 1. Use the pre-generated Order Number
        let orderNumber = paymentRef || `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        const orderId = crypto.randomUUID();

        // 2. Insert Order
        const { error } = await supabase.from('orders').insert({
          id: orderId,
          user_id: isLoggedIn && userProfile ? userProfile.id : null,
          order_number: orderNumber,
          customer_name: isLoggedIn && userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() || email : `${firstName} ${lastName}`.trim() || email,
          customer_email: isLoggedIn && userProfile ? (userProfile.email || email) : email,
          customer_phone: isLoggedIn && userProfile ? (userProfile.phone || phone) : phone,
          shipping_address: shippingAddr as any,
          subtotal,
          shipping_fee: shipping,
          total_amount: total,
          payment_method: paymentMethod,
          transaction_id: finalTransactionId,
          screenshot_url: screenshotUrl,
          status: 'pending_verification',
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
          size: item.size
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) {
          // Roll back: delete the orphan order to keep DB clean
          await supabase.from('orders').delete().eq('id', orderId);
          throw itemsError;
        }
        
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

        // Increment coupon used_count
        if (appliedCoupon?.id) {
          await supabase.from('coupons')
            .update({ used_count: (appliedCoupon.used_count || 0) + 1 })
            .eq('id', appliedCoupon.id);
        }

        setOrderCompleted(true);
        clearCart();
        sessionStorage.setItem('recentOrderNumber', orderNumber);
        router.push('/checkout/success');
      } else {
        // Fallback simulate backend processing delay
        await new Promise(r => setTimeout(r, 1500));
        setOrderCompleted(true);
        clearCart();
        router.push('/checkout/success');
      }
    } catch (err) {
      console.error("Order placement error:", err);
      setFormError("An unexpected error occurred while placing your order. Please try again.");
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
        const isValid = await trigger();
        if (!isValid) {
          const firstError = Object.values(formErrors)[0]?.message;
          setFormError(firstError || "Please fill in all required address fields correctly.");
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
    <div className="bg-ivory min-h-screen pt-36 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium hover:text-gold-text transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Return to Shop
        </Link>
        
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Checkout Form */}
          <div className="flex-1">
            <h1 className="font-serif text-4xl text-rich-black mb-8">Checkout</h1>
            
            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-10 text-xs sm:text-sm uppercase tracking-widest font-medium overflow-x-auto no-scrollbar pb-2">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center gap-2 whitespace-nowrap">
                  <span className={`${index <= currentStep ? 'text-rich-black' : 'text-neutral-400'}`}>
                    {step}
                  </span>
                  {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-neutral-400" />}
                </div>
              ))}
            </div>
            
            {formError && (
              <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error text-sm rounded-sm">
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
                    <h2 className="text-xl font-serif text-rich-black border-b border-border-light pb-4">Shipping Address</h2>
                    {isLoggedIn ? (
                      <div className="space-y-4">
                        {savedAddresses.map(addr => (
                          <div 
                            key={addr.id} 
                            className={`border p-6 cursor-pointer transition-colors rounded-sm ${selectedAddress === addr.id ? 'border-gold bg-ivory' : 'border-border-light bg-white hover:border-[#CCCCCC]'}`} 
                            onClick={() => setSelectedAddress(addr.id)}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-3">
                                <input type="radio" checked={selectedAddress === addr.id} readOnly className="accent-gold" />
                                <span className="font-medium text-sm text-rich-black">{addr.name}</span>
                                {addr.is_default && <span className="text-[10px] uppercase tracking-wider bg-border-light px-2 py-1 rounded-sm text-neutral-500">Default</span>}
                              </div>
                            </div>
                            <p className="text-sm text-neutral-500 ml-7">{addr.address_line1}, {addr.address_line2 ? addr.address_line2 + ', ' : ''}{addr.city}, {addr.state} - {addr.postal_code}</p>
                            <p className="text-sm text-neutral-500 ml-7 mt-1">{addr.phone || userProfile?.phone}</p>
                          </div>
                        ))}
                        <button
                          onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                          className="text-sm text-gold-text hover:text-rich-black transition-colors mt-4 flex items-center gap-2 font-medium"
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
                              <div className="mt-4 space-y-4 border border-border-light p-6 rounded-sm bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="Address Name" {...register("addressLabel")} placeholder="Address Name (e.g. Home)" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.addressLabel && <p className="text-error text-xs mt-1">{formErrors.addressLabel.message}</p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="text" aria-label="Street Address" {...register("addressLine1")} placeholder="Street Address" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.addressLine1 && <p className="text-error text-xs mt-1">{formErrors.addressLine1.message}</p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="City" {...register("city")} placeholder="City" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.city && <p className="text-error text-xs mt-1">{formErrors.city.message}</p>}
                                  </div>
                                  <div className="w-full">
                                    <select aria-label="State" {...register("state")} className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm text-neutral-500">
                                      <option value="" disabled>Select State</option>
                                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    {formErrors.state && <p className="text-error text-xs mt-1">{formErrors.state.message}</p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="text" aria-label="PIN Code" {...register("pinCode")} placeholder="PIN Code" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.pinCode && <p className="text-error text-xs mt-1">{formErrors.pinCode.message}</p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="Landmark" {...register("landmark")} placeholder="Landmark (Optional)" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.landmark && <p className="text-error text-xs mt-1">{formErrors.landmark.message}</p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full">
                                    <input type="tel" aria-label="Primary Phone Number" {...register("phone")} placeholder="Primary Phone Number" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.phone && <p className="text-error text-xs mt-1">{formErrors.phone.message}</p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="tel" aria-label="Alternate Phone Number" {...register("alternatePhone")} placeholder="Alternate Phone (Optional)" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                                    {formErrors.alternatePhone && <p className="text-error text-xs mt-1">{formErrors.alternatePhone.message}</p>}
                                  </div>
                                </div>
                                <button onClick={handleSaveNewAddress} className="bg-rich-black text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-gold transition-colors mt-2">
                                  Save Address
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="First Name" {...register("firstName")} placeholder="First Name" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                            {formErrors.firstName && <p className="text-error text-xs mt-1">{formErrors.firstName.message}</p>}
                          </div>
                          <div className="w-full">
                            <input type="text" aria-label="Last Name" {...register("lastName")} placeholder="Last Name" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                            {formErrors.lastName && <p className="text-error text-xs mt-1">{formErrors.lastName.message}</p>}
                          </div>
                        </div>
                        <div className="w-full">
                          <input type="text" aria-label="Address" {...register("addressLine1")} placeholder="Address" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                          {formErrors.addressLine1 && <p className="text-error text-xs mt-1">{formErrors.addressLine1.message}</p>}
                        </div>
                        <div className="w-full">
                          <input type="text" aria-label="Apartment, suite, etc." {...register("addressLine2")} placeholder="Apartment, suite, etc. (optional)" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                          {formErrors.addressLine2 && <p className="text-error text-xs mt-1">{formErrors.addressLine2.message}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="City" {...register("city")} placeholder="City" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                            {formErrors.city && <p className="text-error text-xs mt-1">{formErrors.city.message}</p>}
                          </div>
                          <div className="w-full">
                            <select aria-label="State" {...register("state")} className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm text-neutral-500">
                                <option value="" disabled>Select State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {formErrors.state && <p className="text-error text-xs mt-1">{formErrors.state.message}</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="PIN Code" {...register("pinCode")} placeholder="PIN Code" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                            {formErrors.pinCode && <p className="text-error text-xs mt-1">{formErrors.pinCode.message}</p>}
                          </div>
                          <div className="w-full">
                            <input type="tel" aria-label="Phone Number" {...register("phone")} placeholder="Phone" className="w-full bg-transparent border-b border-border-light py-3 focus:outline-none focus:border-rich-black transition-colors text-sm placeholder-neutral-400" />
                            {formErrors.phone && <p className="text-error text-xs mt-1">{formErrors.phone.message}</p>}
                          </div>
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
                    <h2 className="text-xl font-serif text-rich-black border-b border-border-light pb-4">Payment Method</h2>
                    <p className="text-sm text-neutral-500 flex items-center gap-2">
                      <Lock className="w-4 h-4" /> Scan the QR code to pay instantly via UPI.
                    </p>
                    <div className="bg-white border border-border-light rounded-sm overflow-hidden">
                      <label 
                        className="flex items-center gap-3 p-4 border-b border-border-light cursor-pointer hover:bg-ivory transition-colors"
                        onClick={() => setPaymentMethod("upi")}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="accent-gold" />
                        <Wallet className="w-5 h-5 text-neutral-500" />
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
                            <div className="p-6 bg-ivory border-b border-border-light">
                              {/* Two-column layout: note left, QR right */}
                              <div className="flex flex-col sm:flex-row gap-6 items-start">

                                {/* LEFT — Important note + UTR + screenshot */}
                                <div className="flex-1 flex flex-col gap-5">
                                  <div className="bg-[#FFF8E7] border border-[#F2D08E] text-[#B07B18] p-4 rounded-md text-xs leading-relaxed">
                                    <span className="font-bold block mb-1">Important:</span>
                                    After completing your payment, you <strong>must return to this page</strong> to enter your Transaction Number and upload a payment screenshot. Then proceed to the next step and press <strong>Place Order</strong> to successfully complete your purchase.
                                  </div>

                                  <div className="space-y-5">
                                    <div>
                                      <label className="block text-[10px] font-medium text-neutral-500 mb-2 uppercase tracking-wider">Transaction ID / UTR No.</label>
                                      <input
                                        type="text"
                                        placeholder="Enter 12-digit UTR"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full bg-transparent border-b border-border-light pb-3 text-sm focus:outline-none focus:border-rich-black transition-colors placeholder-neutral-400"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-medium text-neutral-500 mb-3 uppercase tracking-wider">Payment Screenshot</label>
                                      <div className="relative border-2 border-dashed border-border-light rounded-md p-6 text-center hover:bg-ivory transition-colors group">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleScreenshotUpload}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        {paymentScreenshotPreview ? (
                                          <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="relative w-20 h-20 rounded-md overflow-hidden border border-border-light">
                                              <Image src={paymentScreenshotPreview} alt="Screenshot" fill className="object-cover" />
                                            </div>
                                            <p className="text-xs text-success flex items-center gap-1 font-medium mt-1">
                                              <Check className="w-3 h-3" /> Screenshot attached
                                            </p>
                                            <p className="text-[10px] text-neutral-500 group-hover:text-gold-text transition-colors">Tap to change image</p>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center gap-2">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-neutral-400 group-hover:text-rich-black transition-colors">
                                              <Upload className="w-4 h-4" />
                                            </div>
                                            <p className="text-sm font-medium text-rich-black mt-1">Upload Screenshot</p>
                                            <p className="text-xs text-neutral-400">Tap or drag image here (Max 5MB)</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* RIGHT — QR + payee + app buttons */}
                                <div className="flex flex-col items-center text-center shrink-0">
                                  <p className="text-sm font-medium mb-3">Scan to pay <span className="font-[family-name:var(--font-montserrat)] font-bold text-rich-black">₹{total.toLocaleString('en-IN')}</span></p>
                                    <div className="bg-white p-3 rounded-xl shadow-sm border border-border-light mb-3">
                                      <Image
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}&pn=${process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil'}&am=${total}&cu=INR&tn=${paymentRef}`)}`}
                                      alt="UPI QR Code"
                                      width={180}
                                      height={180}
                                      className="rounded-lg"
                                      unoptimized
                                    />
                                  </div>
                                  <p className="text-sm font-semibold text-rich-black">Gehna Vinod Motwani</p>
                                  <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-2 mb-3">
                                    <span className="font-mono tracking-wide">{process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}</span>
                                    <button
                                      type="button"
                                      onClick={() => navigator.clipboard.writeText(process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici')}
                                      className="text-gold-text hover:text-rich-black transition-colors"
                                      title="Copy UPI ID"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                    </button>
                                  </p>
                                  <p className="text-xs text-neutral-500 mb-4">Open any UPI app and scan to pay securely.</p>
                                  <div className="w-full flex flex-col gap-2">
                                    <a href={`phonepe://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}&pn=${process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil'}&am=${total}&cu=INR&tn=${paymentRef}`} className="w-full bg-[#5E328A] text-white py-2.5 rounded-md flex items-center justify-center text-xs font-medium hover:bg-[#4d2972] transition-colors shadow-sm lg:hidden">
                                      Pay using PhonePe
                                    </a>
                                    <a href={`paytmmp://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}&pn=${process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil'}&am=${total}&cu=INR&tn=${paymentRef}`} className="w-full bg-[#002970] text-white py-2.5 rounded-md flex items-center justify-center text-xs font-medium hover:bg-[#001d52] transition-colors shadow-sm lg:hidden">
                                      Pay using Paytm
                                    </a>
                                    <a href={`tez://upi/pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}&pn=${process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil'}&am=${total}&cu=INR&tn=${paymentRef}`} className="w-full bg-white border border-border-light text-rich-black py-2.5 rounded-md flex items-center justify-center text-xs font-medium hover:bg-ivory transition-colors shadow-sm lg:hidden">
                                      Pay using Google Pay
                                    </a>
                                    <a href={`upi://pay?pa=${process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}&pn=${process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil'}&am=${total}&cu=INR&tn=${paymentRef}`} className="w-full bg-rich-black text-white py-2.5 rounded-md flex items-center justify-center text-xs font-medium hover:bg-neutral-800 transition-colors shadow-sm lg:hidden">
                                      Other UPI Apps
                                    </a>
                                  </div>
                                </div>

                              </div>{/* end flex row */}
                            </div>{/* end p-6 outer */}
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
                    <h2 className="text-xl font-serif text-rich-black border-b border-border-light pb-4">Review Your Order</h2>
                    
                    <div className="bg-white border border-border-light p-6 text-sm">

                      <div className="flex justify-between border-b border-border-light pb-4 mb-4">
                        <div className="text-neutral-500">Ship to</div>
                        <div className="text-rich-black text-right max-w-[200px]">
                          {isLoggedIn && selectedAddress && !showNewAddressForm ? (
                            (() => {
                              const addr = savedAddresses.find(a => a.id === selectedAddress);
                              return addr ? `${addr.address_line1}, ${addr.city}, ${addr.postal_code}` : '';
                            })()
                          ) : (
                            `${addressLine1}, ${city}, ${pinCode}`
                          )}
                        </div>
                        <button onClick={() => setCurrentStep(0)} className="text-gold-text hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>
                      <div className="flex justify-between border-b border-border-light pb-4 mb-4">
                        <div className="text-neutral-500">Payment</div>
                        <div className="text-rich-black">UPI QR Code</div>
                        <button onClick={() => setCurrentStep(1)} className="text-gold-text hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>

                      {/* Cart Items Summary */}
                      <div className="pt-2">
                        <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4 font-medium">Items in your order ({cartItems.reduce((s, i) => s + i.quantity, 0)})</p>
                        <div className="space-y-4">
                          {cartItems.map(item => (
                            <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 items-center">
                              <div className="relative w-14 h-20 bg-ivory flex-shrink-0 rounded-sm overflow-hidden border border-border-light">
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neutral-500 text-white text-[9px] flex items-center justify-center rounded-full">{item.quantity}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-rich-black line-clamp-1">{item.name}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{item.color} / {item.size}</p>
                              </div>
                              <p className="text-sm font-medium text-rich-black font-[family-name:var(--font-montserrat)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10 pt-6 border-t border-border-light">
              {currentStep > 0 ? (
                <button 
                  onClick={prevStep}
                  className="text-rich-black hover:text-gold-text transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-medium w-full sm:w-auto justify-center"
                >
                  <ChevronLeft className="w-4 h-4" /> Return to {steps[currentStep - 1]}
                </button>
              ) : (
                <div /> // empty div to maintain flex justify-between
              )}

              {currentStep < steps.length - 1 ? (
                <button 
                  onClick={nextStep}
                  className="bg-rich-black hover:bg-gold text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full sm:w-auto"
                >
                  Continue to {steps[currentStep + 1]}
                </button>
              ) : (
                <button 
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="bg-gold hover:bg-rich-black text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} 
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              )}
            </div>
            <p className="text-center text-xs text-neutral-500 mt-6">
              By placing your order, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>

          {/* Right: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 lg:p-10 sticky top-32 shadow-[0_0_40px_rgba(0,0,0,0.03)] rounded-md">
              <h2 className="font-serif text-2xl text-rich-black mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8">
                {mounted && cartItems.length === 0 ? (
                  <p className="text-sm text-neutral-500">Your cart is empty.</p>
                ) : (
                  cartItems.map(item => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 border-b border-border-light pb-6 last:border-0 last:pb-0">
                      <div className="relative w-20 h-28 bg-ivory flex-shrink-0">
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-500 text-white text-[10px] flex items-center justify-center rounded-full">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex flex-col flex-1 justify-center">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-medium line-clamp-1 pr-2">{item.name}</h3>
                          <p className="font-medium text-sm font-[family-name:var(--font-montserrat)]">₹{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <p className="text-xs text-neutral-500 mb-3">{item.color} / {item.size}</p>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center border border-border-light bg-white rounded-sm h-7">
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, item.size, Math.max(1, item.quantity - 1))} 
                              className="w-7 h-full flex items-center justify-center text-neutral-500 hover:text-rich-black hover:bg-[#F5F5F5] transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs text-rich-black font-medium">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.color, item.size, item.quantity + 1)} 
                              className="w-7 h-full flex items-center justify-center text-neutral-500 hover:text-rich-black hover:bg-[#F5F5F5] transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id, item.color, item.size)}
                            className="text-neutral-400 hover:text-sale transition-colors text-[10px] uppercase tracking-widest border-b border-transparent hover:border-sale pb-0.5"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Discount Code */}
              <div className="mb-8 border-t border-border-light pt-8">
                <div className="flex relative">
                  <input
                    type="text"
                    placeholder="DISCOUNT CODE"
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyDiscount()}
                    className="w-full bg-transparent border-b border-border-light pb-3 focus:outline-none focus:border-rich-black transition-colors text-xs tracking-widest uppercase placeholder-neutral-400"
                  />
                  <button onClick={handleApplyDiscount} className="absolute right-0 top-0 text-[10px] uppercase tracking-widest text-rich-black hover:text-gold-text transition-colors pb-3 border-b border-transparent font-medium">Apply</button>
                </div>
                {discountMsg && <p className={`text-[10px] uppercase tracking-widest mt-3 ${discountMsg.includes('âœ“') ? 'text-success' : 'text-sale'}`}>{discountMsg}</p>}
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-border-light pt-6 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="text-rich-black font-medium font-[family-name:var(--font-montserrat)]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-success">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-medium font-[family-name:var(--font-montserrat)]">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-success font-medium uppercase tracking-widest text-xs">Free</span>
                  ) : (
                    <span className="text-rich-black font-medium font-[family-name:var(--font-montserrat)]">₹{shipping.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <div className="flex justify-between items-center border-t border-border-light mt-6 pt-6">
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
