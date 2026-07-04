"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, Heart, MapPin, LogOut, Truck, RefreshCw, Plus } from "lucide-react";
import Image from "next/image";

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const router = useRouter();

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(""), 3000);
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="font-serif text-4xl text-[#111111] mb-12 text-center">My Account</h1>
        
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white border border-[#EFEFEF] p-6 sticky top-32">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#EFEFEF]">
                <div className="w-12 h-12 bg-[#111111] rounded-full flex items-center justify-center text-white font-serif text-xl">
                  A
                </div>
                <div>
                  <p className="font-medium text-[#111111]">Aanya Sharma</p>
                  <p className="text-xs text-[#666666]">aanya@example.com</p>
                </div>
              </div>
              
              <nav className="flex flex-col gap-2">
                <button 
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center gap-3 p-3 text-sm font-medium transition-colors ${activeTab === "orders" ? 'bg-[#FAF8F5] text-[#C7A17A]' : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAF8F5]'}`}
                >
                  <Package className="w-4 h-4" /> Orders
                </button>
                <button 
                  onClick={() => setActiveTab("wishlist")}
                  className={`flex items-center gap-3 p-3 text-sm font-medium transition-colors ${activeTab === "wishlist" ? 'bg-[#FAF8F5] text-[#C7A17A]' : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAF8F5]'}`}
                >
                  <Heart className="w-4 h-4" /> Wishlist
                </button>
                <button 
                  onClick={() => setActiveTab("addresses")}
                  className={`flex items-center gap-3 p-3 text-sm font-medium transition-colors ${activeTab === "addresses" ? 'bg-[#FAF8F5] text-[#C7A17A]' : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAF8F5]'}`}
                >
                  <MapPin className="w-4 h-4" /> Addresses
                </button>
                <button 
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center gap-3 p-3 text-sm font-medium transition-colors ${activeTab === "profile" ? 'bg-[#FAF8F5] text-[#C7A17A]' : 'text-[#666666] hover:text-[#111111] hover:bg-[#FAF8F5]'}`}
                >
                  <User className="w-4 h-4" /> Profile Details
                </button>
                <button 
                onClick={() => { router.push('/'); }}
                className="flex items-center gap-3 p-3 text-sm text-left w-full hover:bg-[#FAF8F5] transition-colors text-[#666666] hover:text-[#E63946] rounded"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 bg-white border border-[#EFEFEF] p-8 lg:p-12">
            {feedbackMessage && (
              <div className="fixed top-24 right-6 bg-[#111111] text-white px-6 py-3 shadow-lg z-50 text-sm animate-fade-in">
                {feedbackMessage}
              </div>
            )}
            {activeTab === "orders" && (
              <div>
                <h2 className="font-serif text-2xl text-[#111111] mb-8">Order History</h2>
                <div className="space-y-6">
                  {/* Sample Order */}
                  <div className="border border-[#EFEFEF] p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#EFEFEF] pb-4 mb-6 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#111111]">Order #LYK-29481</p>
                        <p className="text-xs text-[#666666] mt-1">Placed on Oct 12, 2026</p>
                      </div>
                      <div className="flex gap-4">
                        <span className="bg-[#FAF8F5] text-[#C7A17A] text-xs uppercase tracking-widest px-3 py-1 font-medium">Delivered</span>
                        <span className="text-sm font-medium text-[#111111]">Total: ₹4,999</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative w-24 h-32 bg-[#FAF8F5] overflow-hidden">
                        <Image src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80" alt="Product" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#111111]">Satin Slip Midi Dress</h3>
                        <p className="text-xs text-[#666666] mt-1">Champagne / M</p>
                        <div className="mt-4 flex gap-4">
                          <button onClick={() => showFeedback('Tracking info coming soon! Check your email for updates.')} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#C7A17A] transition-colors flex items-center gap-1">
                            <Truck className="w-3 h-3" /> Track Order
                          </button>
                          <button onClick={() => showFeedback('To initiate a return, please contact us at returns@tranquil.co.in')} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#C7A17A] transition-colors flex items-center gap-1">
                            <RefreshCw className="w-3 h-3" /> Return / Exchange
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="font-serif text-2xl text-[#111111] mb-8">My Wishlist</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {/* Sample Wishlist Item */}
                  <div className="group flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#FAF8F5] mb-4">
                      <Image src="https://images.unsplash.com/photo-1588117260148-b47818741c74?w=400&q=80" alt="Product" fill className="object-cover" />
                      <button className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-[#E63946]">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                        <button className="w-full bg-white/90 backdrop-blur-md text-[#111111] hover:bg-[#C7A17A] hover:text-white py-3 text-xs uppercase tracking-widest font-medium transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                    <Link href="/products/2" className="font-medium text-[#111111] hover:text-[#C7A17A] transition-colors mb-1">Embellished Corset Top</Link>
                    <span className="text-[#666666]">₹3,499</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-serif text-2xl text-[#111111]">Saved Addresses</h2>
                  <button onClick={() => showFeedback('Address form coming soon! Feature in development.')} className="bg-[#111111] text-white hover:bg-[#C7A17A] text-xs uppercase tracking-widest font-medium px-6 py-3 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add New Address
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-[#111111] p-6 relative">
                    <span className="absolute top-0 right-0 bg-[#111111] text-white text-[10px] uppercase tracking-widest px-2 py-1">Default</span>
                    <h3 className="font-medium mb-2">Aanya Sharma</h3>
                    <p className="text-sm text-[#666666] leading-relaxed mb-4">
                      Flat 4B, The Residency<br />
                      Bandra West<br />
                      Mumbai, Maharashtra 400050<br />
                      India<br />
                      Phone: +91 98765 43210
                    </p>
                    <div className="flex gap-4">
                      <button onClick={() => showFeedback('Address editing coming soon!')} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#C7A17A] transition-colors">Edit</button>
                      <button onClick={() => showFeedback('Address deletion coming soon!')} className="text-xs uppercase tracking-widest underline underline-offset-4 hover:text-[#E63946] transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "profile" && (
              <div>
                <h2 className="font-serif text-2xl text-[#111111] mb-8">Profile Details</h2>
                <form className="max-w-xl space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">First Name</label>
                      <input type="text" defaultValue="Aanya" className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Last Name</label>
                      <input type="text" defaultValue="Sharma" className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Email Address</label>
                    <input type="email" defaultValue="aanya@example.com" disabled className="w-full bg-[#EFEFEF] border border-[#EFEFEF] p-4 text-[#666666] cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#666666] mb-2">Phone Number</label>
                    <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-[#FAF8F5] border border-[#EFEFEF] p-4 focus:outline-none focus:border-[#C7A17A] transition-colors" />
                  </div>
                  <button type="button" onClick={() => showFeedback('Profile saved successfully! ✓')} className="bg-[#111111] hover:bg-[#C7A17A] text-white py-4 px-10 uppercase tracking-widest text-sm font-medium transition-colors">
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
