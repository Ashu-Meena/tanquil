"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeData = [
  { size: "XS", bust: "32–33\"", waist: "24–25\"", hips: "34–35\"", uk: "6", in: "XS" },
  { size: "S",  bust: "34–35\"", waist: "26–27\"", hips: "36–37\"", uk: "8", in: "S"  },
  { size: "M",  bust: "36–37\"", waist: "28–29\"", hips: "38–39\"", uk: "10", in: "M" },
  { size: "L",  bust: "38–39\"", waist: "30–31\"", hips: "40–41\"", uk: "12", in: "L" },
  { size: "XL", bust: "40–41\"", waist: "32–33\"", hips: "42–43\"", uk: "14", in: "XL"},
  { size: "FS", bust: "-", waist: "-", hips: "-", uk: "-", in: "FS" },
];

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] bg-white w-full max-w-xl mx-4 p-8 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-serif text-2xl text-rich-black">Size Guide</h2>
              <button onClick={onClose} className="hover:rotate-90 transition-transform p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-6">All measurements are in inches</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-light">
                    <th className="py-3 pr-4 font-medium text-rich-black uppercase tracking-widest text-[11px]">Size</th>
                    <th className="py-3 pr-4 font-medium text-rich-black uppercase tracking-widest text-[11px]">Bust</th>
                    <th className="py-3 pr-4 font-medium text-rich-black uppercase tracking-widest text-[11px]">Waist</th>
                    <th className="py-3 pr-4 font-medium text-rich-black uppercase tracking-widest text-[11px]">Hips</th>
                    <th className="py-3 pr-4 font-medium text-rich-black uppercase tracking-widest text-[11px]">UK</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeData.map((row) => (
                    <tr key={row.size} className="border-b border-border-light hover:bg-ivory transition-colors">
                      <td className="py-3 pr-4 font-medium text-rich-black">{row.size}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.bust}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.waist}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.hips}</td>
                      <td className="py-3 pr-4 text-neutral-500">{row.uk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 p-4 bg-ivory text-xs text-neutral-500 leading-relaxed">
              <strong className="text-rich-black">How to Measure:</strong> Measure around the fullest part of your bust, the narrowest part of your natural waist, and the fullest part of your hips. If between sizes, size up for comfort.
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
