"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Tag,
  Megaphone,
  LogOut,
  RefreshCw,
  Plus,
  Edit2,
  Trash2,
  Database,
  Search,
  CheckCircle,
  Truck,
  Package,
  Calendar,
  User,
  MapPin,
  Loader2,
  Star,
  ExternalLink,
  Gift,
  Handshake,
  Users,
  Crown,
  Flame,
  Medal,
  Zap,
  DollarSign,
  Activity,
} from "lucide-react";
import { formatKES } from "@/lib/utils";
import { Product, Order, OrderStatus } from "@/lib/types";
import { toast } from "sonner";
import ReportsTab from "@/components/admin/ReportsTab";

type Tab = "orders" | "products" | "offers" | "announcements" | "referrals" | "partners" | "reports";

interface AffiliateAdmin {
  id: string;
  phone: string;
  display_name: string;
  referral_code: string;
  referral_count: number;
  total_credit_kes: number;
  pending_credit_kes: number;
  rank: string;
  created_at: string;
}

interface ReferralEvent {
  id: string;
  affiliate_id: string;
  order_number: string;
  order_total_kes: number;
  credit_awarded: number;
  discount_given: number;
  created_at: string;
}

interface AffiliateStats {
  totalAffiliates: number;
  activeAffiliates: number;
  totalReferrals: number;
  totalCreditIssued: number;
  pendingCredit: number;
  totalOrdersReferred: number;
  totalOrderValueReferred: number;
}

const RANK_ICON: Record<string, React.ReactNode> = {
  none:     <Star size={12} />,
  bronze:   <Medal size={12} />,
  silver:   <Star size={12} />,
  gold:     <Crown size={12} />,
  platinum: <Zap size={12} />,
  legend:   <Flame size={12} />,
};
const RANK_COLOR: Record<string, string> = {
  none:     "bg-stone-100 text-stone-500",
  bronze:   "bg-amber-100 text-amber-700",
  silver:   "bg-slate-100 text-slate-600",
  gold:     "bg-yellow-100 text-yellow-700",
  platinum: "bg-cyan-100 text-cyan-700",
  legend:   "bg-[#d4ff3d]/20 text-[#6b8000]",
};

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: "payment_pending", label: "Payment Pending", color: "bg-amber-100 text-amber-800" },
  { value: "paid", label: "Paid", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "Processing", color: "bg-indigo-100 text-indigo-800" },
  { value: "dispatched", label: "Dispatched", color: "bg-purple-100 text-purple-800" },
  { value: "out_for_delivery", label: "Out For Delivery", color: "bg-orange-100 text-orange-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-rose-100 text-rose-800" },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // State lists
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<AffiliateAdmin[]>([]);
  const [referralEvents, setReferralEvents] = useState<ReferralEvent[]>([]);
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats | null>(null);
  const [affiliateQuery, setAffiliateQuery] = useState("");
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerQuery, setPartnerQuery] = useState("");
  const [partnerStatusFilter, setPartnerStatusFilter] = useState<string>("all");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("all");

  // Selection for edit/add modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("processing");

  // Announcement state
  const [newAnnouncement, setNewAnnouncement] = useState("");
  const [announcementPriority, setAnnouncementPriority] = useState(0);

  // Offer state
  const [offerTitle, setOfferTitle] = useState("");
  const [offerCode, setOfferCode] = useState("");
  const [offerDiscount, setOfferDiscount] = useState(10);
  const [offerActive, setOfferActive] = useState(true);

  // Stats
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    totalProductsCount: 0,
    activeAnnouncementCount: 0,
  });

  // Filters & Search
  const [orderQuery, setOrderQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");

  // Product form fields
  const [pForm, setPForm] = useState({
    name: "",
    brand: "",
    category: "sneakers",
    price: "",
    compareAtPrice: "",
    colorway: "",
    description: "",
    detailsInput: "",
    imagesInput: "",
    tagsInput: "",
    sizesInput: "38:5, 39:5, 40:8, 41:10, 42:8, 43:5, 44:2",
    isNewDrop: false,
    dropNumber: "",
  });

  useEffect(() => {
    checkAuthentication();
  }, []);

  async function checkAuthentication() {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      if (!data.isAuthenticated) {
        router.push("/admin/login");
      } else {
        await loadAllData();
      }
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  async function handleUpdatePartnerStatus(id: string, newStatus: "pending" | "reviewed" | "accepted" | "rejected") {
    try {
      const res = await fetch("/api/admin/partners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update partner status");
      } else {
        toast.success(`Partner status updated to ${newStatus}`);
        setPartners((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus, updated_at: new Date().toISOString() } : p))
        );
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
  }

  async function loadAllData() {
    try {
      const [ordRes, prodRes, offRes, annRes, affRes, partRes] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/products"),
        fetch("/api/admin/offers"),
        fetch("/api/admin/announcements"),
        fetch("/api/admin/affiliates"),
        fetch("/api/admin/partners"),
      ]);

      const ordData = await ordRes.json();
      const prodData = await prodRes.json();
      const offData = await offRes.json();
      const annData = await annRes.json();
      const affData = await affRes.json();
      const partData = await partRes.json().catch(() => ({}));

      const ordersList = ordData.orders || [];
      const productsList = prodData.products || [];
      const offersList = offData.offers || [];
      const announcementsList = annData.announcements || [];

      setOrders(ordersList);
      setProducts(productsList);
      setOffers(offersList);
      setAnnouncements(announcementsList);
      setPartners(partData?.partners || []);

      if (!affData.error) {
        setAffiliates(affData.affiliates || []);
        setReferralEvents(affData.events || []);
        setAffiliateStats(affData.stats || null);
      }

      // Compute stats
      const paidOrders = ordersList.filter(
        (o: Order) => o.status !== "payment_pending" && o.status !== "cancelled"
      );
      const revenue = paidOrders.reduce((sum: number, o: Order) => sum + o.total, 0);

      setStats({
        totalRevenue: revenue,
        paidCount: paidOrders.length,
        totalProductsCount: productsList.length,
        activeAnnouncementCount: announcementsList.filter((a: any) => a.active).length,
      });
    } catch (err) {
      toast.error("Failed to load dashboard data.");
    }
  }

  // Database seed function
  async function handleSeedDatabase(force = false) {
    const isConfirmed = confirm(
      force
        ? "Warning: This will clear the products table and overwrite it with initial catalog. Proceed?"
        : "Seed Supabase products table with initial catalog?"
    );
    if (!isConfirmed) return;

    toast.promise(
      fetch(`/api/admin/seed${force ? "?force=true" : ""}`, { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          loadAllData();
          return data.message;
        }),
      {
        loading: "Seeding products...",
        success: (msg) => msg,
        error: (err) => `Seeding failed: ${err.message}`,
      }
    );
  }

  // Announcement triggers
  async function handleAddAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!newAnnouncement) return;

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newAnnouncement, priority: announcementPriority }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setNewAnnouncement("");
      setAnnouncementPriority(0);
      toast.success("Announcement added.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleToggleAnnouncement(ann: any) {
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...ann, active: !ann.active }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    if (!confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Announcement deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Offer triggers
  async function handleAddOffer(e: React.FormEvent) {
    e.preventDefault();
    if (!offerTitle) return;

    try {
      const res = await fetch("/api/admin/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: offerTitle,
          code: offerCode || undefined,
          discount_percent: offerDiscount,
          active: offerActive,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOfferTitle("");
      setOfferCode("");
      setOfferDiscount(10);
      toast.success("Offer campaign created.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleToggleOffer(off: any) {
    try {
      const res = await fetch("/api/admin/offers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...off, active: !off.active }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleDeleteOffer(id: string) {
    if (!confirm("Delete this offer?")) return;
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Offer deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  // Order status update
  async function handleUpdateOrderStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrder) return;

    toast.promise(
      fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber,
          status: orderStatus,
          note: orderNote || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setSelectedOrder(null);
          setOrderNote("");
          loadAllData();
          return `Order ${data.order.orderNumber} updated to ${statusLabel(orderStatus)}.`;
        }),
      {
        loading: "Updating status & sending email notification...",
        success: (msg) => msg,
        error: (err) => `Update failed: ${err.message}`,
      }
    );
  }

  // Product CRUD
  function openAddProduct() {
    setSelectedProduct(null);
    setPForm({
      name: "",
      brand: "",
      category: "sneakers",
      price: "",
      compareAtPrice: "",
      colorway: "",
      description: "",
      detailsInput: "",
      imagesInput: "",
      tagsInput: "",
      sizesInput: "38:5, 39:5, 40:8, 41:10, 42:8, 43:5, 44:2",
      isNewDrop: false,
      dropNumber: "",
    });
    setProductFormOpen(true);
  }

  function openEditProduct(product: Product) {
    setSelectedProduct(product);
    setPForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      compareAtPrice: product.compareAtPrice?.toString() || "",
      colorway: product.colorway,
      description: product.description,
      detailsInput: product.details.join("\n"),
      imagesInput: product.images.join("\n"),
      tagsInput: product.tags.join(", "),
      sizesInput: product.sizes.map((s) => `${s.size}:${s.stock}`).join(", "),
      isNewDrop: !!product.isNewDrop,
      dropNumber: product.dropNumber || "",
    });
    setProductFormOpen(true);
  }

  async function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Parse sub-fields
    const details = pForm.detailsInput
      .split("\n")
      .map((d) => d.trim())
      .filter(Boolean);
    const images = pForm.imagesInput
      .split("\n")
      .map((img) => img.trim())
      .filter(Boolean);
    const tags = pForm.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const sizes = pForm.sizesInput
      .split(",")
      .map((sz) => {
        const parts = sz.trim().split(":");
        return {
          size: parts[0]?.trim() || "",
          stock: Number(parts[1]?.trim() || 0),
        };
      })
      .filter((s) => s.size);

    const payload = {
      id: selectedProduct?.id,
      name: pForm.name,
      brand: pForm.brand,
      category: pForm.category,
      price: Number(pForm.price),
      compare_at_price: pForm.compareAtPrice ? Number(pForm.compareAtPrice) : null,
      description: pForm.description,
      details,
      images,
      colorway: pForm.colorway,
      sizes,
      tags,
      is_new_drop: pForm.isNewDrop,
      drop_number: pForm.dropNumber || null,
    };

    const isEdit = !!selectedProduct;
    const url = "/api/admin/products";
    const method = isEdit ? "PUT" : "POST";

    toast.promise(
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setProductFormOpen(false);
          loadAllData();
          return isEdit ? "Product updated." : "Product added successfully.";
        }),
      {
        loading: "Saving product...",
        success: (msg) => msg,
        error: (err) => `Save failed: ${err.message}`,
      }
    );
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success("Product deleted.");
      loadAllData();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function statusLabel(status: OrderStatus) {
    return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
  }

  function statusColor(status: OrderStatus) {
    return STATUS_OPTIONS.find((s) => s.value === status)?.color ?? "bg-stone-100 text-stone-800";
  }

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-hazard" />
      </div>
    );
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(orderQuery.toLowerCase()) ||
      o.delivery.fullName.toLowerCase().includes(orderQuery.toLowerCase()) ||
      o.delivery.phone.includes(orderQuery)
  );

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.colorway.toLowerCase().includes(productQuery.toLowerCase())
  );

  const filteredPartners = partners.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(partnerQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(partnerQuery.toLowerCase()) ||
      (p.company && p.company.toLowerCase().includes(partnerQuery.toLowerCase())) ||
      (p.website && p.website.toLowerCase().includes(partnerQuery.toLowerCase()));
    const matchStatus = partnerStatusFilter === "all" || p.status === partnerStatusFilter;
    const matchType = partnerTypeFilter === "all" || p.partnership_type === partnerTypeFilter;
    return matchQuery && matchStatus && matchType;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-ink/10 pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-xs uppercase tracking-wide text-hazard">
            Store Console
          </span>
          <h1 className="font-display text-4xl uppercase tracking-tight">Admin Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSeedDatabase(true)}
            className="flex items-center gap-1.5 rounded-full border border-hazard/30 bg-hazard/10 px-4 py-2 text-xs font-mono uppercase tracking-wide text-hazard hover:bg-hazard/20"
          >
            <Database size={12} /> Seed/Reset Products
          </button>
          <button
            onClick={() => loadAllData()}
            className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-mono uppercase tracking-wide hover:bg-stone-50"
          >
            <RefreshCw size={12} /> Sync Data
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-full bg-rose-500 px-4 py-2 text-xs font-mono uppercase tracking-wide text-white hover:bg-rose-600"
          >
            <LogOut size={12} /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
          <div className="flex items-center justify-between text-ink/40">
            <span className="font-mono text-xs uppercase tracking-wider">Total Sales</span>
            <TrendingUp size={20} className="text-hazard" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{formatKES(stats.totalRevenue)}</p>
          <span className="text-[10px] text-ink/40 font-mono">Confirmed Payments</span>
        </div>

        <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
          <div className="flex items-center justify-between text-ink/40">
            <span className="font-mono text-xs uppercase tracking-wider">Paid Orders</span>
            <ShoppingBag size={20} className="text-hazard" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{stats.paidCount}</p>
          <span className="text-[10px] text-ink/40 font-mono">Ready to Pack/Ship</span>
        </div>

        <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
          <div className="flex items-center justify-between text-ink/40">
            <span className="font-mono text-xs uppercase tracking-wider">Total Products</span>
            <Tag size={20} className="text-hazard" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{stats.totalProductsCount}</p>
          <span className="text-[10px] text-ink/40 font-mono">Dynamic Database Catalog</span>
        </div>

        <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
          <div className="flex items-center justify-between text-ink/40">
            <span className="font-mono text-xs uppercase tracking-wider">Announcements</span>
            <Megaphone size={20} className="text-hazard" />
          </div>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{stats.activeAnnouncementCount}</p>
          <span className="text-[10px] text-ink/40 font-mono">Active Ticker Items</span>
        </div>
      </div>

      {/* Database Utility bar */}
      {products.length === 0 && (
        <div className="mt-6 flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <div className="flex items-center gap-2">
            <Database size={16} />
            <span>Supabase is connected but products database table is empty. Populate it using static files?</span>
          </div>
          <button
            onClick={() => handleSeedDatabase(false)}
            className="flex items-center gap-1 rounded-xl bg-amber-600 px-4 py-2 font-mono text-xs uppercase tracking-wide text-white hover:bg-amber-700"
          >
            <Database size={12} /> Seed Products
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex border-b border-ink/10 font-display text-sm uppercase tracking-wide overflow-x-auto whitespace-nowrap">
        {(["orders", "products", "offers", "announcements"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`border-b-2 px-6 py-3 font-semibold transition-colors ${
              activeTab === t ? "border-hazard text-hazard" : "border-transparent text-ink/40 hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("referrals")}
          className={`border-b-2 px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "referrals" ? "border-hazard text-hazard" : "border-transparent text-ink/40 hover:text-ink"
          }`}
        >
          <Gift size={14} /> Referrals
          {affiliateStats && affiliateStats.activeAffiliates > 0 && (
            <span className="rounded-full bg-hazard px-1.5 py-0.5 font-mono text-[9px] text-white leading-none">
              {affiliateStats.activeAffiliates}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("partners")}
          className={`border-b-2 px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "partners" ? "border-hazard text-hazard" : "border-transparent text-ink/40 hover:text-ink"
          }`}
        >
          <Handshake size={14} /> Partners
          {partners.filter((p) => p.status === "pending").length > 0 && (
            <span className="rounded-full bg-hazard px-1.5 py-0.5 font-mono text-[9px] text-white leading-none">
              {partners.filter((p) => p.status === "pending").length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={`border-b-2 px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === "reports" ? "border-hazard text-hazard" : "border-transparent text-ink/40 hover:text-ink"
          }`}
        >
          <Activity size={14} /> Reports
        </button>
      </div>

      {/* Active Tab View */}
      <div className="mt-6">
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filter and Search */}
            <div className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-3 bg-white max-w-md">
              <Search size={18} className="text-ink/30" />
              <input
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Search orders by number, customer, phone..."
                className="w-full text-sm outline-none"
              />
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-stone-50 font-mono text-xs uppercase text-ink/50">
                    <th className="px-6 py-4">Order Details</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ink/40 font-mono">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-ink">{order.orderNumber}</div>
                          <div className="text-[11px] text-ink/40 font-mono">
                            {new Date(order.createdAt).toLocaleDateString("en-KE", {
                              dateStyle: "medium",
                            })}{" "}
                            at{" "}
                            {new Date(order.createdAt).toLocaleTimeString("en-KE", {
                              timeStyle: "short",
                            })}
                          </div>
                          {order.transactionReference && (
                            <div className="mt-1 text-[10px] text-hazard font-mono">
                              Ref: {order.transactionReference}
                            </div>
                          )}
                          {order.mpesaReceipt && (
                            <div className="mt-0.5 text-[10px] text-green-600 font-mono">
                              Receipt: {order.mpesaReceipt}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium">{order.delivery.fullName}</div>
                          <div className="text-xs text-ink/60 font-mono">{order.delivery.phone}</div>
                          <div className="text-[10px] text-ink/40">
                            {order.delivery.town}, {order.delivery.county}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono">{formatKES(order.total)}</div>
                          <div className="text-[10px] text-ink/40">
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(order.status)}`}>
                            {statusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setOrderStatus(order.status);
                              setOrderNote("");
                            }}
                            className="rounded-full bg-ink px-4 py-2 font-mono text-[10px] uppercase tracking-wider text-white hover:bg-ink/80"
                          >
                            Manage Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Header / Add Product Button / Seed DB */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 rounded-2xl border border-ink/10 px-4 py-2.5 bg-white w-full max-w-md">
                <Search size={18} className="text-ink/30" />
                <input
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="Search catalog by name, brand, colorway..."
                  className="w-full text-sm outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSeedDatabase(true)}
                  className="flex items-center gap-1.5 rounded-full border border-ink/15 px-4 py-2.5 font-mono text-xs uppercase hover:bg-stone-100"
                >
                  <RefreshCw size={12} /> Force Reset Seed
                </button>
                <button
                  onClick={openAddProduct}
                  className="flex items-center gap-1 rounded-full bg-hazard px-4 py-2.5 font-mono text-xs uppercase tracking-wide text-white hover:bg-hazard/90"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-stone-50 font-mono text-xs uppercase text-ink/50">
                    <th className="px-6 py-4">Product Info</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-ink/40 font-mono">
                        No products in database.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-stone-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-ink/5">
                              {p.images[0] && (
                                <img
                                  src={p.images[0]}
                                  alt={p.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-ink">{p.name}</div>
                              <div className="text-xs text-ink/40 font-mono uppercase">
                                {p.brand} · {p.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-ink/75 max-w-xs truncate">
                          <div className="font-medium text-ink">{p.colorway}</div>
                          <div className="text-ink/50 truncate">{p.description}</div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <div>{formatKES(p.price)}</div>
                          {p.compareAtPrice && (
                            <div className="text-[10px] text-ink/40 line-through">
                              {formatKES(p.compareAtPrice)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono">
                          {p.sizes.map((s) => (
                            <span
                              key={s.size}
                              className={`mr-1 inline-block rounded px-1 py-0.5 text-[10px] ${
                                s.stock > 0 ? "bg-stone-100 text-ink/70" : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {s.size}:{s.stock}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="rounded-full p-2 border border-ink/10 hover:bg-stone-100 text-ink/65"
                              title="Edit Product"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="rounded-full p-2 border border-rose-100 hover:bg-rose-50 text-rose-600"
                              title="Delete Product"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Create Offer Form */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 h-fit">
              <h2 className="font-display text-lg uppercase tracking-tight mb-4">
                Create Discount Offer
              </h2>
              <form onSubmit={handleAddOffer} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Offer Title
                  </label>
                  <input
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="E.g. RESTOCK FRIDAY 10% OFF"
                    className="input py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Promo Code (Optional)
                  </label>
                  <input
                    value={offerCode}
                    onChange={(e) => setOfferCode(e.target.value.toUpperCase())}
                    placeholder="E.g. FRIDAY10"
                    className="input py-2 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="input py-2 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-3 font-display text-xs uppercase tracking-wide text-white hover:bg-ink/90"
                >
                  <Plus size={14} /> Add Offer
                </button>
              </form>
            </div>

            {/* Offers List */}
            <div className="md:col-span-2 space-y-3">
              <h2 className="font-display text-lg uppercase tracking-tight">Active Campaigns</h2>
              {offers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/15 py-12 text-center text-ink/40 font-mono text-sm">
                  No promotional offers created yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {offers.map((off) => (
                    <div
                      key={off.id}
                      className={`ticket-notch rounded-2xl border p-5 flex flex-col justify-between ${
                        off.active ? "bg-stone-50 border-ink/15" : "bg-stone-100 border-ink/5 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className="font-display text-base uppercase tracking-tight text-ink">
                            {off.title}
                          </h3>
                          <span className="font-mono text-xs font-semibold text-hazard">
                            -{off.discount_percent}%
                          </span>
                        </div>
                        {off.code && (
                          <div className="mt-1 font-mono text-xs bg-ink/5 px-2 py-0.5 rounded w-fit text-ink/70">
                            Code: {off.code}
                          </div>
                        )}
                        {off.description && (
                          <p className="mt-2 text-xs text-ink/50">{off.description}</p>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-ink/5 pt-3">
                        <button
                          onClick={() => handleToggleOffer(off)}
                          className={`font-mono text-[10px] uppercase tracking-wide px-3 py-1 rounded-full border ${
                            off.active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-stone-200 text-stone-700 border-stone-300"
                          }`}
                        >
                          {off.active ? "Active" : "Paused"}
                        </button>

                        <button
                          onClick={() => handleDeleteOffer(off.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "announcements" && (
          <div className="grid gap-6 md:grid-cols-3">
            {/* Create Announcement Form */}
            <div className="rounded-2xl border border-ink/10 bg-white p-6 h-fit">
              <h2 className="font-display text-lg uppercase tracking-tight mb-4">
                Add Announcement Message
              </h2>
              <form onSubmit={handleAddAnnouncement} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Announcement Message
                  </label>
                  <textarea
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="E.g. FREE DELIVERY IN NAIROBI & KIAMBU ON ORDERS OVER KES 15,000"
                    className="input py-2 text-sm min-h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Priority (Higher values appear first)
                  </label>
                  <input
                    type="number"
                    value={announcementPriority}
                    onChange={(e) => setAnnouncementPriority(Number(e.target.value))}
                    className="input py-2 text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-3 font-display text-xs uppercase tracking-wide text-white hover:bg-ink/90"
                >
                  <Plus size={14} /> Add Ticker
                </button>
              </form>
            </div>

            {/* Announcements List */}
            <div className="md:col-span-2 space-y-3">
              <h2 className="font-display text-lg uppercase tracking-tight">Active Marquee Items</h2>
              {announcements.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ink/15 py-12 text-center text-ink/40 font-mono text-sm">
                  No custom announcements. Currently falling back to site hardcoded ticker.
                </div>
              ) : (
                <div className="space-y-2">
                  {announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className={`rounded-2xl border p-4 flex items-center justify-between ${
                        ann.active ? "bg-stone-50 border-ink/15" : "bg-stone-100 border-ink/5 opacity-60"
                      }`}
                    >
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium">{ann.message}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-ink/40 font-mono">
                          <span>Priority: {ann.priority}</span>
                          <span>•</span>
                          <span>
                            Created {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleAnnouncement(ann)}
                          className={`font-mono text-[10px] uppercase tracking-wide px-3 py-1 rounded-full border ${
                            ann.active
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-stone-200 text-stone-700 border-stone-300"
                          }`}
                        >
                          {ann.active ? "Active" : "Hidden"}
                        </button>
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "referrals" && (
          <div className="space-y-8">
            {/* Referral Stats Grid */}
            {affiliateStats && (
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
                  <div className="flex items-center justify-between text-ink/40">
                    <span className="font-mono text-xs uppercase tracking-wider">Total Affiliates</span>
                    <Users size={18} className="text-hazard" />
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{affiliateStats.totalAffiliates}</p>
                  <span className="text-[10px] text-ink/40 font-mono">Registered numbers</span>
                </div>

                <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
                  <div className="flex items-center justify-between text-ink/40">
                    <span className="font-mono text-xs uppercase tracking-wider">Total Referrals</span>
                    <Activity size={18} className="text-hazard" />
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">{affiliateStats.totalReferrals}</p>
                  <span className="text-[10px] text-ink/40 font-mono">Orders referred</span>
                </div>

                <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
                  <div className="flex items-center justify-between text-ink/40">
                    <span className="font-mono text-xs uppercase tracking-wider">Total Credit Paid</span>
                    <DollarSign size={18} className="text-hazard" />
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">KES {affiliateStats.totalCreditIssued.toLocaleString()}</p>
                  <span className="text-[10px] text-ink/40 font-mono">Total cash rewards</span>
                </div>

                <div className="rounded-2xl border border-ink/5 bg-stone-100 p-5">
                  <div className="flex items-center justify-between text-ink/40">
                    <span className="font-mono text-xs uppercase tracking-wider">Pending Credit</span>
                    <Gift size={18} className="text-hazard" />
                  </div>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">KES {affiliateStats.pendingCredit.toLocaleString()}</p>
                  <span className="text-[10px] text-ink/40 font-mono">Unpaid credits</span>
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Affiliates List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl uppercase tracking-tight">Affiliates Directory</h2>
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-1.5 bg-white text-xs w-60">
                    <Search size={14} className="text-ink/30" />
                    <input
                      value={affiliateQuery}
                      onChange={(e) => setAffiliateQuery(e.target.value)}
                      placeholder="Search name, phone, code..."
                      className="w-full outline-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-ink/10 bg-stone-50 font-mono text-[10px] uppercase text-ink/50">
                        <th className="px-4 py-3">Affiliate Details</th>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3 text-right">Referrals</th>
                        <th className="px-4 py-3 text-right">Total Credit</th>
                        <th className="px-4 py-3 text-right">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {affiliates.filter(a => 
                        a.display_name.toLowerCase().includes(affiliateQuery.toLowerCase()) ||
                        a.phone.includes(affiliateQuery) ||
                        a.referral_code.toLowerCase().includes(affiliateQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-ink/40 font-mono text-xs">
                            No affiliates found.
                          </td>
                        </tr>
                      ) : (
                        affiliates.filter(a => 
                          a.display_name.toLowerCase().includes(affiliateQuery.toLowerCase()) ||
                          a.phone.includes(affiliateQuery) ||
                          a.referral_code.toLowerCase().includes(affiliateQuery.toLowerCase())
                        ).map((aff) => (
                          <tr key={aff.id} className="hover:bg-stone-50/50 text-xs">
                            <td className="px-4 py-3">
                              <div className="font-semibold text-ink">{aff.display_name || "No Name"}</div>
                              <div className="text-[10px] text-ink/40 font-mono">{aff.phone}</div>
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-hazard">
                              {aff.referral_code}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${RANK_COLOR[aff.rank] || RANK_COLOR.none}`}>
                                {RANK_ICON[aff.rank] || RANK_ICON.none}
                                {aff.rank === "none" ? "None" : aff.rank}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-semibold">
                              {aff.referral_count}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              KES {aff.total_credit_kes.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-amber-600 font-semibold">
                              KES {aff.pending_credit_kes.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Recent Referral Events */}
              <div className="space-y-4">
                <h2 className="font-display text-xl uppercase tracking-tight">Recent Referral Events</h2>
                <div className="rounded-2xl border border-ink/10 bg-white p-4 space-y-3 h-[450px] overflow-y-auto">
                  {referralEvents.length === 0 ? (
                    <div className="py-12 text-center text-ink/40 font-mono text-xs">
                      No referral events logged yet.
                    </div>
                  ) : (
                    referralEvents.map((evt) => {
                      const parentAff = affiliates.find(a => a.id === evt.affiliate_id);
                      return (
                        <div key={evt.id} className="border-b border-ink/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-xs text-ink">
                                Order {evt.order_number}
                              </div>
                              <div className="text-[9px] text-ink/40 font-mono">
                                Referred by {parentAff ? `${parentAff.display_name} (${parentAff.referral_code})` : "Unknown"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-xs font-semibold text-green-600">
                                +KES {evt.credit_awarded}
                              </div>
                              <div className="text-[9px] text-ink/40 font-mono">
                                Value: KES {evt.order_total_kes.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "partners" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl uppercase tracking-tight">Partner Applications</h2>
                <p className="text-xs text-ink/50 mt-0.5">Manage and review applications submitted via the partner portal.</p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Bar */}
                <div className="flex items-center gap-2 rounded-xl border border-ink/10 px-3 py-1.5 bg-white text-xs w-60">
                  <Search size={14} className="text-ink/30" />
                  <input
                    value={partnerQuery}
                    onChange={(e) => setPartnerQuery(e.target.value)}
                    placeholder="Search name, email, brand..."
                    className="w-full outline-none bg-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={partnerStatusFilter}
                  onChange={(e) => setPartnerStatusFilter(e.target.value)}
                  className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>

                {/* Type Filter */}
                <select
                  value={partnerTypeFilter}
                  onChange={(e) => setPartnerTypeFilter(e.target.value)}
                  className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="creator">Creator</option>
                  <option value="brand">Brand</option>
                  <option value="consignment">Consignment</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="overflow-x-auto rounded-2xl border border-ink/10 bg-white">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-ink/10 bg-stone-50 font-mono text-xs uppercase text-ink/50">
                    <th className="px-4 py-4">Applicant</th>
                    <th className="px-4 py-4">Type</th>
                    <th className="px-4 py-4">Proposal</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-ink/40 font-mono">
                        No applications found.
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((part) => (
                      <tr key={part.id} className="hover:bg-stone-50/50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-ink">{part.name}</div>
                          <div className="text-[10px] text-ink/50">{part.email}</div>
                          <div className="text-[10px] text-ink/40 font-mono">{part.phone}</div>
                          {part.company && <div className="text-[10px] text-ink/60 font-semibold mt-0.5">{part.company}</div>}
                          {part.website && (
                            <a
                              href={part.website.startsWith("http") ? part.website : `https://${part.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-0.5 text-[9px] text-cobalt hover:underline mt-0.5"
                            >
                              <ExternalLink size={8} /> {part.website}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 uppercase font-mono font-medium tracking-wider text-ink/75">
                          {part.partnership_type.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 max-w-[250px] whitespace-pre-wrap text-ink/70 leading-relaxed font-body">
                          {part.message}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
                            part.status === "accepted" ? "bg-green-100 text-green-800" :
                            part.status === "rejected" ? "bg-red-100 text-red-800" :
                            part.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                            "bg-amber-100 text-amber-800"
                          }`}>
                            {part.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-ink/40">
                          {new Date(part.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1.5">
                            {part.status !== "reviewed" && part.status !== "accepted" && part.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(part.id, "reviewed")}
                                className="rounded bg-stone-100 hover:bg-stone-200 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-stone-700"
                              >
                                Review
                              </button>
                            )}
                            {part.status !== "accepted" && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(part.id, "accepted")}
                                className="rounded bg-green-600 hover:bg-green-700 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-white"
                              >
                                Accept
                              </button>
                            )}
                            {part.status !== "rejected" && (
                              <button
                                onClick={() => handleUpdatePartnerStatus(part.id, "rejected")}
                                className="rounded bg-red-600 hover:bg-red-700 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-white"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <ReportsTab orders={orders} products={products} affiliates={affiliates} />
        )}
      </div>

      {/* Product Add/Edit Modal Form */}
      <AnimatePresence>
        {productFormOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductFormOpen(false)}
            />
            <motion.div
              className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white p-6 shadow-xl overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-4">
                <h2 className="font-display text-2xl uppercase tracking-tight">
                  {selectedProduct ? "Edit Product" : "Add Product"}
                </h2>
                <button
                  onClick={() => setProductFormOpen(false)}
                  className="rounded-full p-2 hover:bg-stone-100"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Product Name
                    </label>
                    <input
                      value={pForm.name}
                      onChange={(e) => setPForm({ ...pForm, name: e.target.value })}
                      placeholder="E.g. Cortez Flux"
                      className="input py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Brand
                    </label>
                    <input
                      value={pForm.brand}
                      onChange={(e) => setPForm({ ...pForm, brand: e.target.value })}
                      placeholder="E.g. Nike"
                      className="input py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Category
                    </label>
                    <select
                      value={pForm.category}
                      onChange={(e) => setPForm({ ...pForm, category: e.target.value })}
                      className="input py-2 text-sm"
                    >
                      <option value="sneakers">Sneakers (Kicks)</option>
                      <option value="apparel">Apparel</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Price (KES)
                    </label>
                    <input
                      type="number"
                      value={pForm.price}
                      onChange={(e) => setPForm({ ...pForm, price: e.target.value })}
                      placeholder="7200"
                      className="input py-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Compare Price (KES, Optional)
                    </label>
                    <input
                      type="number"
                      value={pForm.compareAtPrice}
                      onChange={(e) => setPForm({ ...pForm, compareAtPrice: e.target.value })}
                      placeholder="9500"
                      className="input py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Colorway
                    </label>
                    <input
                      value={pForm.colorway}
                      onChange={(e) => setPForm({ ...pForm, colorway: e.target.value })}
                      placeholder="Black / Hazard Red"
                      className="input py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pForm.isNewDrop}
                        onChange={(e) => setPForm({ ...pForm, isNewDrop: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-hazard focus:ring-hazard"
                      />
                      <span className="font-mono text-xs uppercase tracking-wide text-ink/75">
                        New Drop
                      </span>
                    </label>
                    {pForm.isNewDrop && (
                      <input
                        value={pForm.dropNumber}
                        onChange={(e) => setPForm({ ...pForm, dropNumber: e.target.value })}
                        placeholder="DROP 015"
                        className="input py-1.5 px-3 text-xs font-mono max-w-[120px]"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Description
                  </label>
                  <textarea
                    value={pForm.description}
                    onChange={(e) => setPForm({ ...pForm, description: e.target.value })}
                    placeholder="Short description of the product..."
                    className="input py-2 text-sm min-h-16"
                  />
                </div>

                <div>
                  <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Sizes Run (Comma-separated Size:Stock)
                  </label>
                  <input
                    value={pForm.sizesInput}
                    onChange={(e) => setPForm({ ...pForm, sizesInput: e.target.value })}
                    placeholder="38:5, 39:5, 40:8, 41:10, 42:8, 43:5, 44:2"
                    className="input py-2 text-sm font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                    Images (One URL per line, first is primary)
                  </label>
                  <textarea
                    value={pForm.imagesInput}
                    onChange={(e) => setPForm({ ...pForm, imagesInput: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="input py-2 text-sm font-mono min-h-24"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Details (One detail per line)
                    </label>
                    <textarea
                      value={pForm.detailsInput}
                      onChange={(e) => setPForm({ ...pForm, detailsInput: e.target.value })}
                      placeholder="Mesh and synthetic upper&#10;Foam midsole&#10;Reinforced toe cap"
                      className="input py-2 text-sm min-h-20"
                    />
                  </div>
                  <div>
                    <label className="label block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1">
                      Tags (Comma-separated)
                    </label>
                    <input
                      value={pForm.tagsInput}
                      onChange={(e) => setPForm({ ...pForm, tagsInput: e.target.value })}
                      placeholder="low-top, running, leather"
                      className="input py-2 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-hazard py-4 font-display text-sm uppercase tracking-wide text-white hover:bg-hazard/90 transition-transform active:scale-[1.01]"
                >
                  {selectedProduct ? "Update Product" : "Create Product"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Status Management Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              className="fixed inset-0 z-50 m-auto h-fit w-full max-w-lg rounded-3xl border border-ink/10 bg-white p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                <h2 className="font-display text-lg uppercase tracking-tight">
                  Manage Order Status
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-1 hover:bg-stone-100"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleUpdateOrderStatus} className="mt-4 space-y-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wide text-ink/40 mb-1">
                    Order Details
                  </div>
                  <div className="font-semibold">{selectedOrder.orderNumber}</div>
                  <div className="text-xs text-ink/60">
                    Customer: {selectedOrder.delivery.fullName} ({selectedOrder.delivery.phone})
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                    className="input py-2 text-sm"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wide text-ink/50 mb-1.5">
                    Timeline Update Note (Optional, sent to customer)
                  </label>
                  <textarea
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    placeholder="E.g. Package dispatched via Wells Fargo. Tracking: WF-92738-KE"
                    className="input py-2 text-sm min-h-20"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink py-3 font-display text-xs uppercase tracking-wide text-white hover:bg-ink/90"
                >
                  Update Order
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
