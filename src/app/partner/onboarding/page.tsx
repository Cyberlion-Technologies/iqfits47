"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Handshake,
  CheckCircle2,
  Download,
  ExternalLink,
  MessageSquare,
  Compass,
  ArrowRight,
  UserCheck,
  Sparkles,
  Phone,
  BookOpen,
  Award,
  ChevronRight,
  FileText
} from "lucide-react";
import Link from "next/link";
import { InstagramIcon } from "@/components/ui/instagram-icon";

type PartnershipType = "creator" | "brand" | "consignment" | "wholesale";

interface Step {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  actionLabel: string;
  actionType: "link" | "mpesa_form" | "download" | "none";
  targetUrl?: string;
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const nameParam = searchParams.get("name") || "";
  const typeParam = (searchParams.get("type") || "creator") as PartnershipType;

  const [name, setName] = useState("Partner");
  const [partnerType, setPartnerType] = useState<PartnershipType>("creator");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [mpesaLinked, setMpesaLinked] = useState(false);

  useEffect(() => {
    if (nameParam) setName(nameParam);
    if (["creator", "brand", "consignment", "wholesale"].includes(typeParam)) {
      setPartnerType(typeParam);
    }
  }, [nameParam, typeParam]);

  // Steps state
  const [steps, setSteps] = useState<Step[]>([
    {
      id: 1,
      title: "Application Approved",
      description: "Your proposal matches our culture. Welcome to IQFITS-47!",
      isCompleted: true,
      actionLabel: "Completed",
      actionType: "none"
    },
    {
      id: 2,
      title: "Register Referral Profile",
      description: "Create your referral profile to get your tracking code.",
      isCompleted: false,
      actionLabel: "Register Profile",
      actionType: "link",
      targetUrl: "/referral"
    },
    {
      id: 3,
      title: "Link M-Pesa for Payouts",
      description: "Enter your phone number to receive secure payouts and commission.",
      isCompleted: false,
      actionLabel: "Link M-Pesa",
      actionType: "mpesa_form"
    },
    {
      id: 4,
      title: "Download Brand Assets",
      description: "Get verified logo marks, banners, and overlays for your content.",
      isCompleted: false,
      actionLabel: "Download Pack",
      actionType: "download"
    },
    {
      id: 5,
      title: "Join Creator WhatsApp Community",
      description: "Connect directly with our team and other partners in the WhatsApp group.",
      isCompleted: false,
      actionLabel: "Join Group",
      actionType: "link",
      targetUrl: "https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH"
    }
  ]);

  // Load state from localStorage on mount and dynamically listen for updates from other tabs
  useEffect(() => {
    const loadChecklistState = () => {
      const savedMpesa = localStorage.getItem("onboarding_mpesa_phone");
      const savedReferral = localStorage.getItem("onboarding_referral_registered");
      const savedDownloaded = localStorage.getItem("onboarding_brand_downloaded");
      const savedWhatsApp = localStorage.getItem("onboarding_whatsapp_joined");

      if (savedMpesa) {
        setMpesaPhone(savedMpesa);
        setMpesaLinked(true);
      }

      setSteps(prev =>
        prev.map(s => {
          if (s.id === 2 && savedReferral === "true") {
            return { ...s, isCompleted: true };
          }
          if (s.id === 3 && savedMpesa) {
            return { ...s, isCompleted: true };
          }
          if (s.id === 4 && savedDownloaded) {
            return { ...s, isCompleted: true };
          }
          if (s.id === 5 && savedWhatsApp) {
            return { ...s, isCompleted: true };
          }
          return s;
        })
      );
    };

    loadChecklistState();

    // Listen to storage changes (fired from the other tab on the same origin)
    window.addEventListener("storage", loadChecklistState);
    // Listen to focus changes (fired when the user switches tabs back to this page)
    window.addEventListener("focus", loadChecklistState);

    return () => {
      window.removeEventListener("storage", loadChecklistState);
      window.removeEventListener("focus", loadChecklistState);
    };
  }, []);

  const handleStepAction = (step: Step) => {
    if (step.actionType === "link" && step.targetUrl) {
      if (step.id === 5) {
        localStorage.setItem("onboarding_whatsapp_joined", "true");
        setSteps(prev => prev.map(s => s.id === 5 ? { ...s, isCompleted: true } : s));
        toast.success("Redirecting to WhatsApp Community...");
        window.open(step.targetUrl, "_blank", "noopener,noreferrer");
      } else if (step.id === 2) {
        // Open referral registration in a new tab
        toast.info("Opening Referral Registration in a new tab...");
        window.open(step.targetUrl, "_blank", "noopener,noreferrer");
      } else {
        router.push(step.targetUrl);
      }
    } else if (step.actionType === "mpesa_form") {
      setShowMpesaModal(true);
    } else if (step.actionType === "download") {
      // Simulate file download
      toast.info("Downloading Brand Assets zip...");
      setTimeout(() => {
        localStorage.setItem("onboarding_brand_downloaded", "true");
        setSteps(prev => prev.map(s => s.id === 4 ? { ...s, isCompleted: true } : s));
        toast.success("Logo Pack & Social Templates downloaded!");
        
        // Trigger a mock file download of a text file just for browser behavior
        const element = document.createElement("a");
        const file = new Blob(["IQFITS-47 Brand Assets Pack\nLogos, color specs, and overlay guidelines."], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = "iqfits47_brand_assets_readme.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }, 1500);
    }
  };

  const handleMpesaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = mpesaPhone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "254" + cleaned.slice(1);
    }
    if (!cleaned.startsWith("254") || cleaned.length !== 12) {
      toast.error("Please enter a valid Safaricom number, e.g. 0712345678");
      return;
    }

    localStorage.setItem("onboarding_mpesa_phone", cleaned);
    setMpesaLinked(true);
    setShowMpesaModal(false);
    setSteps(prev => prev.map(s => s.id === 3 ? { ...s, isCompleted: true } : s));
    toast.success("M-Pesa payout number linked successfully!");
  };

  const allCompleted = steps.every(s => s.isCompleted);

  // Partnership specific text details
  const getPartnerLabel = () => {
    switch (partnerType) {
      case "creator": return "Content Creator / Influencer";
      case "brand": return "Brand Collaboration Partner";
      case "consignment": return "Consignment Partner";
      case "wholesale": return "Wholesale Buyer Partner";
    }
  };

  const getPartnerInstructions = () => {
    switch (partnerType) {
      case "creator":
        return [
          {
            icon: <InstagramIcon className="text-hazard" size={18} />,
            title: "Create Lookbooks & Reviews",
            desc: "Film video reviews or post premium outfits wearing our latest drops on Instagram and TikTok."
          },
          {
            icon: <Compass className="text-hazard" size={18} />,
            title: "Share Your Referral Link",
            desc: "Add your unique referral link (obtained via the Referral Dashboard) to your bio to track incoming sales."
          },
          {
            icon: <Award className="text-hazard" size={18} />,
            title: "Earn Up to 10% Commission",
            desc: "Your followers get 5% off kicks - and you earn cash credits starting from KES 200 per sale, increasing as you rank up."
          }
        ];
      case "brand":
        return [
          {
            icon: <FileText className="text-hazard" size={18} />,
            title: "Submit Capsule Proposals",
            desc: "Present your sketches, custom concepts, or physical line sheets to our design review team."
          },
          {
            icon: <Sparkles className="text-hazard" size={18} />,
            title: "Collaborative Launches",
            desc: "We co-promote joint drops on our Instagram feed and coordinate official release calendars."
          },
          {
            icon: <Handshake className="text-hazard" size={18} />,
            title: "Fulfillment Handling",
            desc: "We stock, verify, package, and ship your designer items directly from our Nairobi physical store."
          }
        ];
      case "consignment":
        return [
          {
            icon: <BookOpen className="text-hazard" size={18} />,
            title: "Submit Footwear Details",
            desc: "Register brand, silhouette, sizing, condition, and high-res photos in our seller catalog."
          },
          {
            icon: <UserCheck className="text-hazard" size={18} />,
            title: "In-Store Inspection",
            desc: "Deliver kicks to our shop. Our authenticators review stitching, tags, box, and condition labels."
          },
          {
            icon: <Award className="text-hazard" size={18} />,
            title: "Secure Payouts",
            desc: "Once a customer pays, we process security checks and send your funds directly via M-Pesa."
          }
        ];
      case "wholesale":
        return [
          {
            icon: <FileText className="text-hazard" size={18} />,
            title: "Access Wholesale Catalogs",
            desc: "Download spreadsheets containing bulk pricing, volume discount tiers, and inbound inventory sheets."
          },
          {
            icon: <Compass className="text-hazard" size={18} />,
            title: "Verified Sourcing",
            desc: "Buy assured authentic releases imported directly from global streetwear hubs."
          },
          {
            icon: <Handshake className="text-hazard" size={18} />,
            title: "Bulk Express Delivery",
            desc: "We coordinate sorting and heavy shipments to your retail locations anywhere in Kenya."
          }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-ink text-stone-50 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #FF5A1F 0, #FF5A1F 1px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.04]" />
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-hazard/5 filter blur-3xl pointer-events-none -ml-20 -mt-20" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="border-b border-white/10 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-hazard/30 bg-hazard/10 px-3.5 py-1.5 text-xs font-mono uppercase tracking-widest text-hazard">
            <Handshake size={14} /> Partner Onboarding
          </div>
          <h1 className="mt-4 font-display text-3xl leading-none tracking-tight sm:text-5xl uppercase">
            Welcome to the Circle, <span className="text-hazard">{name}</span>
          </h1>
          <p className="mt-3 text-sm text-stone-50/60 max-w-xl">
            You've been successfully accepted as a <span className="text-stone-50 font-semibold">{getPartnerLabel()}</span>. Follow this checklist to complete your onboarding setup.
          </p>
        </div>

        {/* Grid layout */}
        <div className="mt-12 grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Panel: Checklist */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-lg uppercase tracking-wider text-stone-50/50 mb-2">
              Onboarding Checklist
            </h2>

            <div className="space-y-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-5 transition-all duration-300 bg-white/5 flex gap-4 items-start ${
                    step.isCompleted ? "border-stone-50/10 opacity-75" : "border-hazard/30 ring-1 ring-hazard/10"
                  }`}
                >
                  <div className="mt-0.5">
                    {step.isCompleted ? (
                      <CheckCircle2 className="text-green-500 shrink-0" size={20} />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-hazard/50 shrink-0 flex items-center justify-center font-mono text-[10px] text-hazard font-bold">
                        {step.id}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-sm uppercase tracking-wide flex items-center gap-2">
                      {step.title}
                      {step.isCompleted && <span className="font-mono text-[9px] text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-0.5 rounded-full">Ready</span>}
                    </h3>
                    <p className="mt-1 text-xs text-stone-50/50 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {!step.isCompleted && step.actionType !== "none" && (
                      <button
                        onClick={() => handleStepAction(step)}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-hazard px-4 py-2 font-display text-[10px] uppercase tracking-wider text-white hover:bg-hazard/90 transition-colors"
                      >
                        {step.actionLabel}
                        {step.actionType === "link" && <ExternalLink size={10} />}
                        {step.actionType === "download" && <Download size={10} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Custom Guidelines & Resources */}
          <div className="lg:col-span-5 space-y-6">
            {/* Guidelines Card */}
            <div className="rounded-3xl border border-stone-50/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-display text-sm uppercase tracking-wider text-stone-50/50 mb-5">
                How We Collaborate
              </h3>
              
              <ul className="space-y-5">
                {getPartnerInstructions().map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-50/10 text-hazard">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-display text-xs uppercase tracking-wide">{item.title}</h4>
                      <p className="text-[11px] text-stone-50/40 mt-0.5 leading-normal">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Downloads Card */}
            <div className="rounded-3xl border border-stone-50/10 bg-white/5 p-6 shadow-xl backdrop-blur-sm">
              <h3 className="font-display text-sm uppercase tracking-wider text-stone-50/50 mb-4">
                Partner Resources
              </h3>
              
              <div className="space-y-2.5">
                <button
                  onClick={() => handleStepAction(steps[3])}
                  className="flex w-full items-center justify-between rounded-xl border border-stone-50/10 bg-white/5 p-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-hazard/10 text-hazard flex items-center justify-center">
                      <Download size={14} />
                    </div>
                    <div>
                      <div className="font-display text-xs uppercase">Vector Logo Pack</div>
                      <div className="text-[10px] text-stone-50/40">SVG & PNG elements</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-stone-50/30" />
                </button>

                <a
                  href="https://chat.whatsapp.com/HKekz4fQhR8AQudjaP4qeH"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-xl border border-stone-50/10 bg-white/5 p-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 text-green-500 flex items-center justify-center">
                      <MessageSquare size={14} />
                    </div>
                    <div>
                      <div className="font-display text-xs uppercase">WhatsApp Group</div>
                      <div className="text-[10px] text-stone-50/40">Direct contact with staff</div>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-stone-50/30" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA / What's Next Block */}
        <div className="mt-12 rounded-3xl border border-hazard/20 bg-hazard/5 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 rounded-full bg-hazard/10 filter blur-3xl pointer-events-none" />
          
          <h2 className="font-display text-xl sm:text-2xl uppercase tracking-tight">
            Ready to track your commissions?
          </h2>
          <p className="mt-2 text-xs text-stone-50/50 max-w-lg mx-auto">
            Once onboarding is complete, you should be directed to the **Referral & Affiliate Dashboard** to access your unique referral links, track user clicks, and monitor payout logs.
          </p>
          
          <div className="mt-6 flex justify-center">
            <Link
              href="/referral"
              className={`inline-flex items-center gap-2 rounded-xl bg-hazard px-8 py-3.5 font-display text-xs uppercase tracking-wider text-white hover:scale-[1.01] hover:bg-hazard/90 transition-all ${
                !allCompleted ? "opacity-90 shadow-lg" : "shadow-lg ring-2 ring-hazard/50 shadow-hazard/10"
              }`}
            >
              Enter Referral Dashboard <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* M-Pesa Modal */}
      <AnimatePresence>
        {showMpesaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMpesaModal(false)}
              className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-stone-50/10 bg-stone-900 p-6 shadow-2xl overflow-hidden"
            >
              <h3 className="font-display text-lg uppercase tracking-wide mb-1">Link M-Pesa Payout Number</h3>
              <p className="text-xs text-stone-50/50 mb-6">Enter the Safaricom number where your referral credits and consignment payouts should be sent.</p>
              
              <form onSubmit={handleMpesaSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block font-mono text-[9px] uppercase tracking-wider text-stone-50/50">M-Pesa Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-stone-50/40">
                      <Phone size={14} />
                    </span>
                    <input
                      type="text"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full rounded-xl border border-stone-50/10 bg-ink/50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-hazard"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMpesaModal(false)}
                    className="rounded-xl border border-stone-50/10 px-4 py-2 font-display text-[10px] uppercase tracking-wider hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-hazard px-5 py-2 font-display text-[10px] uppercase tracking-wider text-white hover:bg-hazard/90 transition-colors"
                  >
                    Link Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink text-white flex items-center justify-center font-mono">Loading dashboard...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
