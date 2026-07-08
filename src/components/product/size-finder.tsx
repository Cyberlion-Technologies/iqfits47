"use client";

import { useState } from "react";
import { X, Ruler, HelpCircle, AlertCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SizeFinderProps {
  isOpen: boolean;
  onClose: () => void;
  productBrand: string;
  productName: string;
}

const BRANDS = ["Nike", "Adidas", "Puma", "New Balance", "Converse", "Yeezy"];
const SIZES = ["38", "39", "40", "41", "42", "43", "44", "45"];

export function SizeFinder({ isOpen, onClose, productBrand, productName }: SizeFinderProps) {
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculateFit = () => {
    if (!selectedBrand || !selectedSize) return;

    const sizeNum = parseFloat(selectedSize);
    let offset = 0;

    // Sizing fit offsets
    const currentBrandLower = productBrand.toLowerCase();
    const sourceBrandLower = selectedBrand.toLowerCase();

    // Calculate source brand offset relative to a baseline (e.g., Nike)
    let sourceOffset = 0;
    if (sourceBrandLower === "yeezy") sourceOffset = -0.5; // Yeezy runs small, so user size 43 is actually a 42.5 baseline
    if (sourceBrandLower === "converse") sourceOffset = +1.0; // Converse runs large, so user size 42 fits like a 43 baseline

    // Calculate target brand offset relative to baseline
    let targetOffset = 0;
    if (currentBrandLower === "yeezy") targetOffset = +0.5; // Yeezy requires sizing up
    if (currentBrandLower === "converse") targetOffset = -1.0; // Converse requires sizing down

    const recommendedSizeNum = Math.round((sizeNum + sourceOffset + targetOffset) * 2) / 2;
    setResult(recommendedSizeNum.toString());
  };

  const resetFinder = () => {
    setSelectedBrand("");
    setSelectedSize("");
    setResult(null);
  };

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
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] z-50 mx-auto max-w-lg rounded-2xl bg-stone-50 p-6 shadow-2xl md:top-[15%] max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-ink/5 pb-4">
              <div className="flex items-center gap-2">
                <Ruler className="text-hazard" size={20} />
                <h3 className="font-display text-lg uppercase tracking-tight">Size Finder</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 hover:bg-ink/5"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6">
              {!result ? (
                <div>
                  <p className="text-xs text-ink/50 leading-relaxed">
                    Find the perfect fit for **{productName}** by comparing it with a sneaker you already own that fits you comfortably.
                  </p>

                  {/* Step 1: Select Brand */}
                  <div className="mt-5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-ink/55 block mb-2">
                      1. Select a brand you own
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {BRANDS.map((brand) => (
                        <button
                          key={brand}
                          onClick={() => setSelectedBrand(brand)}
                          className={`rounded-lg border py-2 text-center text-xs font-medium uppercase tracking-wide transition-all ${
                            selectedBrand === brand
                              ? "border-ink bg-ink text-stone-50"
                              : "border-ink/10 bg-white hover:border-ink/30"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Size */}
                  <div className="mt-5">
                    <label className="font-mono text-[10px] uppercase tracking-wider text-ink/55 block mb-2">
                      2. Select your size in {selectedBrand || "that brand"} (EU)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {SIZES.map((size) => (
                        <button
                          key={size}
                          disabled={!selectedBrand}
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-lg border py-2 text-center text-xs font-mono transition-all ${
                            selectedSize === size
                              ? "border-ink bg-ink text-stone-50"
                              : "border-ink/10 bg-white hover:border-ink/30 disabled:opacity-40 disabled:hover:border-ink/10"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    disabled={!selectedBrand || !selectedSize}
                    onClick={calculateFit}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-ink py-3 font-mono text-xs uppercase tracking-widest text-stone-50 transition hover:bg-hazard disabled:bg-ink/20 disabled:text-ink/40"
                  >
                    Calculate Best Fit <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <span className="font-mono text-[10px] uppercase tracking-widest text-hazard">
                    Recommended Size for you
                  </span>
                  <div className="mt-2 font-display text-6xl text-ink">
                    EU {result}
                  </div>
                  <p className="mt-4 max-w-xs mx-auto text-xs text-ink/60 leading-relaxed">
                    Based on your comfy fit in **{selectedBrand} EU {selectedSize}**, we recommend size **EU {result}** in **{productBrand}** for the best experience.
                  </p>

                  <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200/50 p-3 text-left max-w-sm mx-auto text-[11px] text-amber-800">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>
                      {parseFloat(result) > parseFloat(selectedSize)
                        ? `${productBrand} silhouette runs smaller than usual. We recommend half a size up.`
                        : parseFloat(result) < parseFloat(selectedSize)
                        ? `${productBrand} silhouette runs larger than usual. We recommend half a size down.`
                        : `${productBrand} runs true-to-size. Stick with your baseline sneaker size.`}
                    </span>
                  </div>

                  <div className="mt-8 flex gap-3 justify-center">
                    <button
                      onClick={resetFinder}
                      className="border border-ink/20 hover:border-ink/40 px-5 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors"
                    >
                      Try another shoe
                    </button>
                    <button
                      onClick={onClose}
                      className="bg-ink hover:bg-hazard text-stone-50 px-6 py-2.5 font-mono text-xs uppercase tracking-wider transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
