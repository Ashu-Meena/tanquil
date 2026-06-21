"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Lock, CreditCard, Wallet, Truck, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["Information", "Shipping", "Payment", "Review"];

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const cartItems = [
    {
      id: 1,
      name: "Satin Slip Midi Dress",
      price: 4999,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80",
      color: "Champagne",
      size: "M",
      quantity: 1,
    }
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let shipping = 0; // Free shipping over 10k or just promo
  const total = subtotal + shipping;

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium hover:text-[#C7A17A] transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Return to Shop
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
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

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {currentStep === 0 && (
                  <motion.div
                    key="step0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Contact Information</h2>
                    <input type="email" placeholder="Email Address" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    <label className="flex items-center gap-2 text-sm text-[#666666]">
                      <input type="checkbox" className="accent-[#C7A17A]" /> Email me with news and offers
                    </label>
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
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Shipping Address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First Name" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                      <input type="text" placeholder="Last Name" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    </div>
                    <input type="text" placeholder="Address" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="City" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                      <input type="text" placeholder="State" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="PIN Code" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                      <input type="tel" placeholder="Phone" className="w-full bg-white border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
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
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Payment Method</h2>
                    <p className="text-sm text-[#666666] flex items-center gap-2">
                      <Lock className="w-4 h-4" /> All transactions are secure and encrypted.
                    </p>
                    <div className="bg-white border border-[#EFEFEF] rounded-sm overflow-hidden">
                      <label className="flex items-center gap-3 p-4 border-b border-[#EFEFEF] cursor-pointer hover:bg-[#FAF8F5] transition-colors">
                        <input type="radio" name="payment" defaultChecked className="accent-[#C7A17A]" />
                        <CreditCard className="w-5 h-5 text-[#666666]" />
                        <span>Credit / Debit Card</span>
                      </label>
                      <div className="p-4 bg-[#FAF8F5] border-b border-[#EFEFEF]">
                        <p className="text-sm text-[#666666] text-center py-4">You will be securely redirected to our payment gateway.</p>
                      </div>
                      
                      <label className="flex items-center gap-3 p-4 border-b border-[#EFEFEF] cursor-pointer hover:bg-[#FAF8F5] transition-colors">
                        <input type="radio" name="payment" className="accent-[#C7A17A]" />
                        <Wallet className="w-5 h-5 text-[#666666]" />
                        <span>UPI / Net Banking</span>
                      </label>
                      
                      <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#FAF8F5] transition-colors">
                        <input type="radio" name="payment" className="accent-[#C7A17A]" />
                        <Truck className="w-5 h-5 text-[#666666]" />
                        <span>Cash on Delivery (COD)</span>
                      </label>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif text-[#111111] border-b border-[#EFEFEF] pb-4">Review Your Order</h2>
                    
                    <div className="bg-white border border-[#EFEFEF] p-6 text-sm">
                      <div className="flex justify-between border-b border-[#EFEFEF] pb-4 mb-4">
                        <div className="text-[#666666]">Contact</div>
                        <div className="text-[#111111]">user@example.com</div>
                        <button onClick={() => setCurrentStep(0)} className="text-[#C7A17A] hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>
                      <div className="flex justify-between border-b border-[#EFEFEF] pb-4 mb-4">
                        <div className="text-[#666666]">Ship to</div>
                        <div className="text-[#111111]">123 Fashion Ave, Mumbai, 400001</div>
                        <button onClick={() => setCurrentStep(1)} className="text-[#C7A17A] hover:underline uppercase tracking-widest text-xs">Edit</button>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-[#666666]">Payment</div>
                        <div className="text-[#111111]">Credit / Debit Card</div>
                        <button onClick={() => setCurrentStep(2)} className="text-[#C7A17A] hover:underline uppercase tracking-widest text-xs">Edit</button>
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
                  className="bg-[#C7A17A] hover:bg-[#111111] text-white px-8 py-4 uppercase tracking-widest text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Place Order
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
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
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
                ))}
              </div>

              {/* Discount Code */}
              <div className="flex gap-2 mb-8 border-t border-[#EFEFEF] pt-6">
                <input type="text" placeholder="Discount Code" className="flex-1 bg-[#FAF8F5] border border-[#EFEFEF] p-3 focus:outline-none focus:border-[#C7A17A] transition-colors text-sm" />
                <button className="bg-[#111111] hover:bg-[#C7A17A] text-white px-6 uppercase tracking-widest text-xs font-medium transition-colors">Apply</button>
              </div>

              {/* Totals */}
              <div className="space-y-3 border-t border-[#EFEFEF] pt-6 text-sm">
                <div className="flex justify-between text-[#666666]">
                  <span>Subtotal</span>
                  <span className="text-[#111111] font-medium font-[family-name:var(--font-montserrat)]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
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
