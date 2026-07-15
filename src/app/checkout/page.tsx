"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Lock, Wallet, ChevronLeft, ChevronRight, Check, Loader2, Plus, Trash2, Minus, Upload, ShoppingCart, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
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
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  
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
    <>
      {/* CHECKOUT BRAND HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 sm:h-20 bg-white border-b border-border-light z-50 flex items-center justify-center">
        <Link href="/" className="font-serif text-2xl sm:text-3xl tracking-wide text-rich-black hover:opacity-80 transition-opacity">
          Tranquil
        </Link>
      </header>

      <div className="bg-white min-h-screen pt-16 sm:pt-24 pb-12 sm:pb-20 font-[family-name:var(--font-montserrat)]">
        
        {/* MOBILE HEADER ACCORDION */}
        <div className="lg:hidden bg-[#FAFAFA] border-b border-border-light mb-6 sm:mb-8 sticky top-16 z-40">
        <button 
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full px-6 py-4 flex items-center justify-between text-rich-black"
        >
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-gold-text" />
            <span className="text-xs uppercase tracking-widest font-medium">{showMobileSummary ? 'Hide' : 'Show'} Order Summary</span>
            {showMobileSummary ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
          </div>
          <span className="font-serif text-lg">₹{total.toLocaleString('en-IN')}</span>
        </button>
        
        <AnimatePresence>
          {showMobileSummary && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border-light bg-white"
            >
              <div className="px-6 py-6 space-y-6">
                {cartItems.map(item => (
                  <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 items-center">
                    <div className="relative w-16 h-24 bg-[#FAFAFA] flex-shrink-0 rounded-md overflow-hidden border border-border-light">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-600 text-white text-[10px] flex items-center justify-center rounded-full shadow-sm">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-rich-black line-clamp-1">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-1">{item.color} / {item.size}</p>
                    </div>
                    <p className="text-sm font-medium text-rich-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
                
                <div className="pt-6 border-t border-border-light space-y-3 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="text-rich-black font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-success">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span className="font-medium">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-500">
                    <span>Shipping</span>
                    <span className="text-rich-black font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-24">
          
          {/* Left: Checkout Form */}
          <div className="flex-1 lg:max-w-3xl">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="font-serif text-2xl sm:text-4xl text-rich-black">Checkout</h1>
              <Link href="/" className="hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium text-neutral-500 hover:text-gold-text transition-colors">
                <ChevronLeft className="w-3 h-3" /> Return to Shop
              </Link>
            </div>
            
            {/* Redesigned Step Indicator */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-6 mb-8 sm:mb-12 border-b border-border-light pb-4 overflow-x-auto no-scrollbar">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isPast = index < currentStep;
                return (
                  <div key={step} className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-medium transition-colors ${isActive ? 'bg-rich-black text-white' : isPast ? 'bg-gold-text text-white' : 'bg-[#F5F5F5] text-neutral-400'}`}>
                        {isPast ? <Check className="w-2.5 h-2.5 sm:w-4 sm:h-4" /> : index + 1}
                      </div>
                      <span className={`text-[9px] sm:text-xs uppercase tracking-widest font-medium transition-colors ${isActive ? 'text-rich-black' : isPast ? 'text-gold-text' : 'text-neutral-400'}`}>
                        {step}
                      </span>
                    </div>
                    {index < steps.length - 1 && <div className="w-3 sm:w-8 h-[1px] bg-border-light mx-1 sm:mx-0" />}
                  </div>
                );
              })}
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
                            className={`border p-4 sm:p-6 cursor-pointer transition-colors rounded-xl shadow-sm ${selectedAddress === addr.id ? 'border-gold bg-ivory' : 'border-border-light bg-white hover:border-gold/30'}`} 
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
                              <div className="mt-4 space-y-4 sm:space-y-6 border border-border-light p-5 sm:p-8 rounded-2xl bg-white shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="Address Name" {...register("addressLabel")} placeholder="Address Name (e.g. Home)" className="w-full bg-white border border-border-light rounded-lg px-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.addressLabel && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.addressLabel.message}</motion.p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="text" aria-label="Street Address" {...register("addressLine1")} placeholder="Street Address" className="w-full bg-white border border-border-light rounded-lg px-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.addressLine1 && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.addressLine1.message}</motion.p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="City" {...register("city")} placeholder="City" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.city && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.city.message}</motion.p>}
                                  </div>
                                  <div className="w-full relative">
                                    <select aria-label="State" {...register("state")} className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-neutral-500 shadow-sm appearance-none">
                                      <option value="" disabled>Select State</option>
                                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4 top-4 pointer-events-none" />
                                    {formErrors.state && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.state.message}</motion.p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="text" aria-label="PIN Code" {...register("pinCode")} placeholder="PIN Code" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.pinCode && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.pinCode.message}</motion.p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                  <div className="w-full">
                                    <input type="text" aria-label="Landmark" {...register("landmark")} placeholder="Landmark (Optional)" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.landmark && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.landmark.message}</motion.p>}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="w-full">
                                    <input type="tel" aria-label="Primary Phone Number" {...register("phone")} placeholder="Primary Phone Number" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.phone && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.phone.message}</motion.p>}
                                  </div>
                                  <div className="w-full">
                                    <input type="tel" aria-label="Alternate Phone Number" {...register("alternatePhone")} placeholder="Alternate Phone (Optional)" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                                    {formErrors.alternatePhone && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.alternatePhone.message}</motion.p>}
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
                      <div className="space-y-4 sm:space-y-6 bg-white p-5 sm:p-8 rounded-2xl border border-border-light shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="First Name" {...register("firstName")} placeholder="First Name" className="w-full bg-white border border-border-light rounded-lg px-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                            {formErrors.firstName && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.firstName.message}</motion.p>}
                          </div>
                          <div className="w-full">
                            <input type="text" aria-label="Last Name" {...register("lastName")} placeholder="Last Name" className="w-full bg-white border border-border-light rounded-lg px-4 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                            {formErrors.lastName && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.lastName.message}</motion.p>}
                          </div>
                        </div>
                        <div className="w-full">
                          <input type="text" aria-label="Address" {...register("addressLine1")} placeholder="Address" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                          {formErrors.addressLine1 && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.addressLine1.message}</motion.p>}
                        </div>
                        <div className="w-full">
                          <input type="text" aria-label="Apartment, suite, etc." {...register("addressLine2")} placeholder="Apartment, suite, etc. (optional)" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                          {formErrors.addressLine2 && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.addressLine2.message}</motion.p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="City" {...register("city")} placeholder="City" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                            {formErrors.city && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.city.message}</motion.p>}
                          </div>
                          <div className="w-full relative">
                            <select aria-label="State" {...register("state")} className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm text-neutral-500 shadow-sm appearance-none">
                                <option value="" disabled>Select State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-4 top-4 pointer-events-none" />
                            {formErrors.state && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.state.message}</motion.p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="w-full">
                            <input type="text" aria-label="PIN Code" {...register("pinCode")} placeholder="PIN Code" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                            {formErrors.pinCode && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.pinCode.message}</motion.p>}
                          </div>
                          <div className="w-full">
                            <input type="tel" aria-label="Phone Number" {...register("phone")} placeholder="Phone" className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all text-sm placeholder-neutral-400 shadow-sm" />
                            {formErrors.phone && <motion.p initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="text-error text-[10px] mt-1.5 flex items-center gap-1 font-medium"><AlertCircle className="w-3 h-3" /> {formErrors.phone.message}</motion.p>}
                          </div>
                        </div>
                      </div>
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
                    <p className="text-sm text-neutral-500 mb-6">
                      Securely pay using any UPI application.
                    </p>
                    <div className="bg-white border border-border-light rounded-2xl overflow-hidden shadow-sm">
                      <label 
                        className="flex items-center gap-4 p-6 border-b border-border-light cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                        onClick={() => setPaymentMethod("upi")}
                      >
                        <input type="radio" name="payment" checked={paymentMethod === "upi"} onChange={() => setPaymentMethod("upi")} className="w-4 h-4 accent-rich-black" />
                        <Wallet className="w-5 h-5 text-rich-black" />
                        <span className="font-medium text-rich-black">Pay via UPI (GPay, PhonePe, Paytm)</span>
                      </label>
                      
                      <AnimatePresence>
                        {paymentMethod === "upi" && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-5 sm:p-8 bg-[#FAFAFA]">
                              <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">

                                {/* LEFT — QR + payee + app buttons */}
                                <div className="flex flex-col items-center justify-center shrink-0 lg:w-64">
                                  <p className="text-sm font-medium mb-4 text-center">Scan to pay <span className="font-[family-name:var(--font-montserrat)] font-bold text-rich-black text-lg block mt-1">₹{total.toLocaleString('en-IN')}</span></p>
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-light mb-4">
                                      {(() => {
                                        const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici';
                                        const storeName = encodeURIComponent(process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil');
                                        const ref = encodeURIComponent(paymentRef || `ORD-${Date.now().toString().slice(-6)}`);
                                        const upiString = `upi://pay?pa=${upiId}&pn=${storeName}&am=${total}&cu=INR&tn=${ref}&tr=${ref}`;
                                        
                                        return (
                                          <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiString)}`}
                                            alt="UPI QR Code"
                                            width={200}
                                            height={200}
                                            className="rounded-lg mix-blend-multiply"
                                            unoptimized
                                          />
                                        );
                                      })()}
                                  </div>
                                  <p className="text-sm font-semibold text-rich-black">Gehna Vinod Motwani</p>
                                  <p className="text-xs text-neutral-500 mt-1 flex items-center justify-center gap-2 mb-4">
                                    <span className="font-mono tracking-wide">{process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici'}</span>
                                  </p>
                                  
                                  {(() => {
                                    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'thetranquilstor@okicici';
                                    const storeName = encodeURIComponent(process.env.NEXT_PUBLIC_STORE_NAME || 'Tranquil');
                                    const ref = encodeURIComponent(paymentRef || `ORD-${Date.now().toString().slice(-6)}`);
                                    
                                    const phonepe = `phonepe://pay?pa=${upiId}&pn=${storeName}&am=${total}&cu=INR&tn=${ref}&tr=${ref}`;
                                    const paytm = `paytmmp://pay?pa=${upiId}&pn=${storeName}&am=${total}&cu=INR&tn=${ref}&tr=${ref}`;
                                    const gpay = `tez://upi/pay?pa=${upiId}&pn=${storeName}&am=${total}&cu=INR&tn=${ref}&tr=${ref}`;
                                    const upi = `upi://pay?pa=${upiId}&pn=${storeName}&am=${total}&cu=INR&tn=${ref}&tr=${ref}`;
                                    
                                    return (
                                      <div className="w-full flex flex-col gap-3 lg:hidden mt-2">
                                        <a href={phonepe} className="w-full bg-[#5E328A] text-white py-3 rounded-xl flex items-center justify-center text-sm font-medium shadow-sm active:scale-95 transition-all">
                                          Pay with PhonePe
                                        </a>
                                        <a href={gpay} className="w-full bg-white border border-border-light text-rich-black py-3 rounded-xl flex items-center justify-center text-sm font-medium shadow-sm active:scale-95 transition-all">
                                          Pay with GPay
                                        </a>
                                        <a href={paytm} className="w-full bg-[#002970] text-white py-3 rounded-xl flex items-center justify-center text-sm font-medium shadow-sm active:scale-95 transition-all">
                                          Pay with Paytm
                                        </a>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* RIGHT — Verification */}
                                <div className="flex-1 flex flex-col gap-6 lg:border-l lg:border-border-light lg:pl-12">
                                  <div className="bg-white border border-border-light p-5 rounded-xl shadow-sm text-sm text-neutral-600 leading-relaxed relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>
                                    <span className="font-semibold text-rich-black block mb-1">Verify Your Payment</span>
                                    After completing the transaction on your app, please enter the 12-digit UTR/Reference number and upload a screenshot to confirm your order.
                                  </div>

                                  <div className="space-y-6">
                                    <div>
                                      <label className="block text-xs font-semibold text-rich-black mb-2">Transaction ID / UTR No.</label>
                                      <input
                                        type="text"
                                        placeholder="Enter 12-digit UTR"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        className="w-full bg-white border border-border-light rounded-lg px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all placeholder-neutral-400 shadow-sm"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-semibold text-rich-black mb-2">Payment Screenshot</label>
                                      <div className="relative border-2 border-dashed border-border-light bg-white rounded-xl p-8 text-center hover:border-gold/50 hover:bg-gold/5 transition-colors group cursor-pointer shadow-sm">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleScreenshotUpload}
                                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        {paymentScreenshotPreview ? (
                                          <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border-light shadow-sm">
                                              <Image src={paymentScreenshotPreview} alt="Screenshot" fill className="object-cover" />
                                            </div>
                                            <p className="text-xs text-success flex items-center gap-1 font-medium mt-1 bg-success/10 px-3 py-1 rounded-full">
                                              <Check className="w-3 h-3" /> Uploaded Successfully
                                            </p>
                                            <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-widest mt-1">Tap to change</p>
                                          </div>
                                        ) : (
                                          <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-12 h-12 bg-[#FAFAFA] border border-border-light rounded-full flex items-center justify-center shadow-sm text-neutral-400 group-hover:text-gold transition-colors">
                                              <Upload className="w-5 h-5" />
                                            </div>
                                            <div>
                                              <p className="text-sm font-medium text-rich-black">Upload Screenshot</p>
                                              <p className="text-xs text-neutral-400 mt-1">Tap or drag image here (Max 5MB)</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
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

                      {/* Cart Items Summary Removed for Cleaner UI */}
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

          {/* Right: Order Summary (Desktop Only) */}
          <div className="hidden lg:block lg:w-[420px]">
            <div className="bg-[#FAFAFA] p-8 sticky top-[120px] rounded-2xl border border-border-light shadow-sm">
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
                        
                        {currentStep === 0 ? (
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
                        ) : (
                          <div className="mt-auto pt-2">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Qty: {item.quantity}</p>
                          </div>
                        )}
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
    </>
  );
}
