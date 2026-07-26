"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Syringe } from "lucide-react";

export function MobileFloatingCta() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-40 md:hidden"
        >
          <a
            href="#booking-form"
            className="flex items-center justify-center gap-2 rounded-full bg-hazard py-3.5 px-6 font-display text-sm uppercase tracking-wide text-white shadow-2xl shadow-hazard/40 ring-2 ring-white/20 active:scale-95 transition-transform"
          >
            <Syringe size={16} />
            Book Tattoo Session
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
