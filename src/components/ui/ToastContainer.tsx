"use client";

import { useToastStore } from "@/store/useToastStore";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 min-w-[300px] max-w-[400px] rounded-sm shadow-xl bg-white border-l-4 ${
              t.type === 'success' ? 'border-green-500' : t.type === 'error' ? 'border-red-500' : 'border-[#C7A17A]'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-[#C7A17A] flex-shrink-0" />}
            <span className="text-sm font-medium text-[#111111]">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="ml-auto flex-shrink-0 text-[#999999] hover:text-[#111111] transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
