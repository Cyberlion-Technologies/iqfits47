import React, { useState, useMemo } from "react";
import { formatKES } from "@/lib/utils";
import { Order, Product } from "@/lib/types";
import {
  Download,
  Calendar,
  Filter,
  Users,
  ShoppingBag,
  TrendingUp,
  MapPin,
  Tag,
  Award,
  ChevronDown,
  Printer,
  Info,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

interface ReportsTabProps {
  orders: Order[];
  products: Product[];
  affiliates: any[];
}

type DatePreset = "7d" | "30d" | "90d" | "all" | "custom";
type MetricType = "sales" | "orders";

export default function ReportsTab({ orders, products, affiliates }: ReportsTabProps) {
  // Filters state
  const [datePreset, setDatePreset] = useState<DatePreset>("30d");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [selectedCounty, setSelectedCounty] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("successful"); // successful (paid/delivered/etc), completed (delivered), all
  const [metricTab, setMetricTab] = useState<MetricType>("sales");

  // Insight table page tabs
  const [detailTab, setDetailTab] = useState<"customers" | "products" | "categories">("customers");

  // Hover state for custom SVG line chart tooltip
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // List of all unique counties in orders for filter dropdown
  const counties = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.delivery?.county) {
        set.add(o.delivery.county.trim());
      }
    });
    return Array.from(set).sort();
  }, [orders]);

  // Filter orders based on status, date, and county
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter === "successful") {
        // Successful: Paid, processing, dispatched, out_for_delivery, delivered (exclude pending & cancelled)
        if (order.status === "payment_pending" || order.status === "cancelled") {
          return false;
        }
      } else if (statusFilter === "completed") {
        // Completed: Delivered only
        if (order.status !== "delivered") {
          return false;
        }
      }

      // 2. County Filter
      if (selectedCounty !== "all") {
        if (order.delivery?.county?.trim() !== selectedCounty) {
          return false;
        }
      }

      // 3. Date Filter
      const orderDate = new Date(order.createdAt);
      const now = new Date();

      if (datePreset === "7d") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        return orderDate >= sevenDaysAgo;
      } else if (datePreset === "30d") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        return orderDate >= thirtyDaysAgo;
      } else if (datePreset === "90d") {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(now.getDate() - 90);
        return orderDate >= ninetyDaysAgo;
      } else if (datePreset === "custom") {
        if (startDateStr) {
          const sDate = new Date(startDateStr);
          sDate.setHours(0, 0, 0, 0);
          if (orderDate < sDate) return false;
        }
        if (endDateStr) {
          const eDate = new Date(endDateStr);
          eDate.setHours(23, 59, 59, 999);
          if (orderDate > eDate) return false;
        }
      }

      return true;
    });
  }, [orders, datePreset, startDateStr, endDateStr, selectedCounty, statusFilter]);

  // Aggregate customer metrics based on filtered orders
  const customerInsights = useMemo(() => {
    const customerMap = new Map<string, {
      fullName: string;
      phone: string;
      totalSpent: number;
      orderCount: number;
      county: string;
      town: string;
      lastOrderDate: string;
    }>();

    filteredOrders.forEach((order) => {
      const phone = order.delivery?.phone || "Unknown Phone";
      const name = order.delivery?.fullName || "Anonymous";
      const county = order.delivery?.county || "Unknown";
      const town = order.delivery?.town || "";
      const spent = order.total || 0;

      const existing = customerMap.get(phone);
      if (existing) {
        existing.totalSpent += spent;
        existing.orderCount += 1;
        if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(phone, {
          fullName: name,
          phone,
          totalSpent: spent,
          orderCount: 1,
          county,
          town,
          lastOrderDate: order.createdAt,
        });
      }
    });

    const customerList = Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
    
    // Cohorts: Repeat customers (2+ orders) vs Single order
    const repeatCustomers = customerList.filter((c) => c.orderCount > 1);
    const oneTimeCustomers = customerList.filter((c) => c.orderCount === 1);

    const totalCustomersCount = customerList.length;
    const repeatRate = totalCustomersCount > 0 ? (repeatCustomers.length / totalCustomersCount) * 100 : 0;

    const repeatSpend = repeatCustomers.reduce((acc, c) => acc + c.totalSpent, 0);
    const oneTimeSpend = oneTimeCustomers.reduce((acc, c) => acc + c.totalSpent, 0);

    return {
      customerList,
      totalCustomersCount,
      repeatCount: repeatCustomers.length,
      oneTimeCount: oneTimeCustomers.length,
      repeatRate,
      repeatSpend,
      oneTimeSpend,
    };
  }, [filteredOrders]);

  // Aggregate product metrics based on filtered orders
  const productInsights = useMemo(() => {
    const productMap = new Map<string, {
      productId: string;
      name: string;
      brand: string;
      quantitySold: number;
      revenue: number;
      category: string;
    }>();

    const categoryMap = new Map<string, { name: string; quantitySold: number; revenue: number }>();
    const sizeMap = new Map<string, number>();

    filteredOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const prodId = item.productId || "unknown";
        const name = item.name || "Unknown Product";
        const brand = item.brand || "Unknown Brand";
        const qty = item.quantity || 1;
        const revenue = (item.price || 0) * qty;

        // Fetch category from product master if matches, else default
        const prodDetails = products.find((p) => p.id === prodId || p.slug === prodId);
        const category = prodDetails?.category || "sneakers";

        // 1. Product insights
        const existing = productMap.get(prodId);
        if (existing) {
          existing.quantitySold += qty;
          existing.revenue += revenue;
        } else {
          productMap.set(prodId, {
            productId: prodId,
            name,
            brand,
            quantitySold: qty,
            revenue,
            category,
          });
        }

        // 2. Category insights
        const existingCat = categoryMap.get(category);
        if (existingCat) {
          existingCat.quantitySold += qty;
          existingCat.revenue += revenue;
        } else {
          categoryMap.set(category, { name: category, quantitySold: qty, revenue });
        }

        // 3. Size insights
        if (item.size) {
          sizeMap.set(item.size, (sizeMap.get(item.size) || 0) + qty);
        }
      });
    });

    const productList = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
    const categoryList = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue);
    const sizeList = Array.from(sizeMap.entries()).sort((a, b) => b[1] - a[1]);

    return {
      productList,
      categoryList,
      sizeList,
    };
  }, [filteredOrders, products]);

  // Aggregate geographical sales based on filtered orders
  const countyInsights = useMemo(() => {
    const countyMap = new Map<string, { county: string; revenue: number; orderCount: number }>();
    filteredOrders.forEach((order) => {
      const county = order.delivery?.county || "Unknown";
      const spent = order.total || 0;

      const existing = countyMap.get(county);
      if (existing) {
        existing.revenue += spent;
        existing.orderCount += 1;
      } else {
        countyMap.set(county, { county, revenue: spent, orderCount: 1 });
      }
    });

    return Array.from(countyMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Core metrics totals
  const summaryMetrics = useMemo(() => {
    const totalSales = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const orderCount = filteredOrders.length;
    const aov = orderCount > 0 ? totalSales / orderCount : 0;
    
    // Average customer lifetime value (CLV)
    const clv = customerInsights.totalCustomersCount > 0 ? totalSales / customerInsights.totalCustomersCount : 0;

    // Delivery stats
    const totalDeliveryFees = filteredOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);

    return {
      totalSales,
      orderCount,
      aov,
      clv,
      totalDeliveryFees,
    };
  }, [filteredOrders, customerInsights]);

  // Time-based aggregation for the SVG Line Chart
  const timeSeriesData = useMemo(() => {
    // Determine date grouping format:
    // If timeframe <= 7 days: group by Day (e.g. "Mon", "Tue")
    // If timeframe <= 30 days: group by Day (e.g. "Jul 05")
    // If timeframe > 30 days: group by Week or Month
    
    const groups: { [key: string]: { dateStr: string; label: string; sales: number; count: number; timeValue: number } } = {};

    filteredOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      let groupKey = "";
      let label = "";

      if (datePreset === "7d") {
        // Group by day of week
        groupKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
        label = d.toLocaleDateString("en-KE", { weekday: "short" });
      } else if (datePreset === "30d") {
        // Group by date
        groupKey = d.toISOString().split("T")[0];
        label = d.toLocaleDateString("en-KE", { month: "short", day: "numeric" });
      } else if (datePreset === "90d") {
        // Group by week of the year
        const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
        const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        groupKey = `${d.getFullYear()}-W${weekNum}`;
        label = `Wk ${weekNum}, ${d.getFullYear().toString().slice(-2)}`;
      } else {
        // Group by month
        groupKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
        label = d.toLocaleDateString("en-KE", { month: "short", year: "2-digit" });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = {
          dateStr: groupKey,
          label,
          sales: 0,
          count: 0,
          timeValue: d.getTime(),
        };
      }

      groups[groupKey].sales += order.total || 0;
      groups[groupKey].count += 1;
    });

    // Sort chronologically
    return Object.values(groups).sort((a, b) => a.timeValue - b.timeValue);
  }, [filteredOrders, datePreset]);

  // Generate SVG path coordinate points
  const chartCoordinates = useMemo(() => {
    if (timeSeriesData.length === 0) {
      return {
        path: "",
        fillPath: "",
        points: [],
        chartHeight: 0,
        chartWidth: 0,
        paddingTop: 0,
        paddingLeft: 0,
        maxVal: 0,
      };
    }

    const width = 600;
    const height = 220;
    const paddingLeft = 60;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Find max value depending on chosen metric
    const maxVal = Math.max(
      ...timeSeriesData.map((d) => (metricTab === "sales" ? d.sales : d.count)),
      1 // Avoid divide by zero
    );

    const points = timeSeriesData.map((d, index) => {
      const val = metricTab === "sales" ? d.sales : d.count;
      const x =
        timeSeriesData.length === 1
          ? paddingLeft + chartWidth / 2
          : paddingLeft + (index / (timeSeriesData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;

      return { x, y, value: val, label: d.label, dateStr: d.dateStr };
    });

    let path = "";
    if (points.length > 0) {
      path = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        // Curve construction using cubic bezier interpolation or straight lines
        path += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // Gradient fill path
    let fillPath = "";
    if (points.length > 0) {
      fillPath = `${path} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
        paddingTop + chartHeight
      } Z`;
    }

    return { path, fillPath, points, chartHeight, chartWidth, paddingTop, paddingLeft, maxVal };
  }, [timeSeriesData, metricTab]);

  // Download CSV functions
  function handleDownloadCSV() {
    let csvContent = "";
    let fileName = "";

    if (detailTab === "customers") {
      fileName = `customer_insights_${datePreset}_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "Rank,Full Name,Phone Number,Total Spent (KES),Total Orders,Average Order Value (KES),County,Town,Last Order Date\n";
      
      customerInsights.customerList.forEach((c, index) => {
        const name = `"${c.fullName.replace(/"/g, '""')}"`;
        const county = `"${c.county.replace(/"/g, '""')}"`;
        const town = `"${c.town.replace(/"/g, '""')}"`;
        const aov = c.orderCount > 0 ? Math.round(c.totalSpent / c.orderCount) : 0;
        csvContent += `${index + 1},${name},${c.phone},${c.totalSpent},${c.orderCount},${aov},${county},${town},${c.lastOrderDate}\n`;
      });
    } else if (detailTab === "products") {
      fileName = `product_velocity_${datePreset}_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "Rank,Product Name,Brand,Category,Units Sold,Revenue (KES)\n";
      
      productInsights.productList.forEach((p, index) => {
        const name = `"${p.name.replace(/"/g, '""')}"`;
        const brand = `"${p.brand.replace(/"/g, '""')}"`;
        csvContent += `${index + 1},${name},${brand},${p.category},${p.quantitySold},${p.revenue}\n`;
      });
    } else {
      fileName = `category_shares_${datePreset}_${new Date().toISOString().split("T")[0]}.csv`;
      csvContent = "Category,Units Sold,Revenue (KES)\n";
      productInsights.categoryList.forEach((c) => {
        csvContent += `${c.name},${c.quantitySold},${c.revenue}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Actionable Calculated Business Insights
  const businessInsights = useMemo(() => {
    const list: string[] = [];

    if (summaryMetrics.orderCount === 0) {
      return ["No order data available for the selected filters. Change timeframe or parameters."];
    }

    // 1. Regional dominance
    if (countyInsights.length > 0) {
      const topCounty = countyInsights[0];
      const pct = Math.round((topCounty.revenue / summaryMetrics.totalSales) * 100);
      list.push(
        `County Concentration: ${topCounty.county} is your highest revenue driver, accounting for ${pct}% of sales (${formatKES(
          topCounty.revenue
        )}). Consider targeting ads or offering special delivery terms to this region.`
      );
    }

    // 2. Loyalty impact
    if (customerInsights.totalCustomersCount > 0) {
      const repeatPct = Math.round(customerInsights.repeatRate);
      const repeatRevPct = Math.round(
        (customerInsights.repeatSpend / summaryMetrics.totalSales) * 100
      );
      
      if (repeatPct > 0) {
        list.push(
          `Loyalty Contribution: Repeat buyers represent ${repeatPct}% of your customer base but generate ${repeatRevPct}% of your total revenue. Launching a loyalty or early-access drop program could amplify this cohort's lifetime value.`
        );
      } else {
        list.push(
          "Customer Retention: 100% of your buyers this period are one-time purchasers. Launch post-purchase retention incentives, such as next-buy coupons or email drop updates, to spark repeat visits."
        );
      }
    }

    // 3. Product inventory & brand champions
    if (productInsights.productList.length > 0) {
      const topProd = productInsights.productList[0];
      list.push(
        `Top Product: "${topProd.name}" (${topProd.brand}) is the best performing product this period, contributing ${formatKES(
          topProd.revenue
        )} across ${topProd.quantitySold} units. Monitor size stock levels closely before the next drop.`
      );
    }

    // 4. Basket size & size distribution
    if (productInsights.sizeList.length > 0) {
      const topSize = productInsights.sizeList[0];
      list.push(
        `Size Demand: Size ${topSize[0]} is the most ordered shoe size (${topSize[1]} items sold). Ensure size ratios on future sneaker drops align with this size demand curve.`
      );
    }

    // 5. Basket value recommendation
    const averageItemsPerOrder = filteredOrders.reduce((acc, o) => acc + (o.items?.reduce((s, i) => s + i.quantity, 0) || 0), 0) / filteredOrders.length;
    if (averageItemsPerOrder < 1.3) {
      list.push(
        `Cross-Selling: Customers average ${averageItemsPerOrder.toFixed(1)} items per order. Try bundling sneaker care accessories (wipes, socks) or apparel drops at checkout to increase basket size.`
      );
    } else {
      list.push(
        `Basket Volume: Strong cross-selling performance! Customers buy an average of ${averageItemsPerOrder.toFixed(1)} items per order.`
      );
    }

    return list;
  }, [summaryMetrics, customerInsights, productInsights, countyInsights, filteredOrders]);

  // Print function
  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6 print:p-8 print:bg-white print:text-black">
      {/* Print-only CSS style injection */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control / Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-ink/10 bg-white p-5 no-print">
        <div className="flex flex-wrap items-center gap-2">
          {/* Preset Buttons */}
          {(["7d", "30d", "90d", "all"] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => setDatePreset(preset)}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all border ${
                datePreset === preset
                  ? "bg-ink border-ink text-white"
                  : "bg-stone-50 border-ink/5 text-ink/60 hover:bg-stone-100"
              }`}
            >
              {preset === "7d" ? "7 Days" : preset === "30d" ? "30 Days" : preset === "90d" ? "90 Days" : "All Time"}
            </button>
          ))}
          <button
            onClick={() => setDatePreset("custom")}
            className={`rounded-xl px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-all border flex items-center gap-1.5 ${
              datePreset === "custom"
                ? "bg-ink border-ink text-white"
                : "bg-stone-50 border-ink/5 text-ink/60 hover:bg-stone-100"
            }`}
          >
            <Calendar size={12} /> Custom
          </button>
        </div>

        {/* Dynamic Custom Date Inputs */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 border border-ink/5 p-2 animate-ticket-pop">
            <input
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="bg-transparent text-xs font-mono text-ink outline-none"
            />
            <span className="text-[10px] text-ink/40 font-mono">to</span>
            <input
              type="date"
              value={endDateStr}
              onChange={(e) => setEndDateStr(e.target.value)}
              className="bg-transparent text-xs font-mono text-ink outline-none"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {/* County Filter */}
          <div className="flex items-center gap-1 bg-stone-50 border border-ink/5 rounded-xl px-3 py-1.5 text-xs text-ink/70">
            <MapPin size={12} className="text-ink/40" />
            <select
              value={selectedCounty}
              onChange={(e) => setSelectedCounty(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 font-mono uppercase tracking-wider text-[10px] font-semibold"
            >
              <option value="all">All Counties</option>
              {counties.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-stone-50 border border-ink/5 rounded-xl px-3 py-1.5 text-xs text-ink/70">
            <Filter size={12} className="text-ink/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 font-mono uppercase tracking-wider text-[10px] font-semibold"
            >
              <option value="successful">Paid & Successful</option>
              <option value="completed">Delivered Only</option>
              <option value="all">All Orders (incl. Pending/Cancelled)</option>
            </select>
          </div>

          {/* Actions */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 rounded-xl bg-stone-100 hover:bg-stone-200 border border-ink/5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-ink/75"
          >
            <Printer size={12} /> Print
          </button>
        </div>
      </div>

      {/* Main Print Container Wrapper */}
      <div id="print-area" className="space-y-6">
        {/* Print Only Header */}
        <div className="hidden print:block border-b border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold uppercase tracking-tight text-black">IQFIT47 Admin Insights Report</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">
            Generated: {new Date().toLocaleDateString()} | Preset: {datePreset.toUpperCase()} | County: {selectedCounty.toUpperCase()}
          </p>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
            <div className="flex items-center justify-between text-ink/40 print:text-black">
              <span className="font-mono text-[10px] uppercase tracking-wider">Gross Sales</span>
              <TrendingUp size={16} className="text-hazard print:text-black" />
            </div>
            <p className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight text-ink print:text-black">
              {formatKES(summaryMetrics.totalSales)}
            </p>
            <span className="text-[9px] text-ink/40 font-mono print:text-black mt-1 block">
              {summaryMetrics.orderCount} Filtered Orders
            </span>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
            <div className="flex items-center justify-between text-ink/40 print:text-black">
              <span className="font-mono text-[10px] uppercase tracking-wider">Unique Customers</span>
              <Users size={16} className="text-cobalt print:text-black" />
            </div>
            <p className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight text-ink print:text-black">
              {customerInsights.totalCustomersCount}
            </p>
            <span className="text-[9px] text-ink/40 font-mono print:text-black mt-1 block">
              Repeat Rate: {customerInsights.repeatRate.toFixed(1)}%
            </span>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
            <div className="flex items-center justify-between text-ink/40 print:text-black">
              <span className="font-mono text-[10px] uppercase tracking-wider">Avg Order Value (AOV)</span>
              <ShoppingBag size={16} className="text-lime-600 print:text-black" />
            </div>
            <p className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight text-ink print:text-black">
              {formatKES(summaryMetrics.aov)}
            </p>
            <span className="text-[9px] text-ink/40 font-mono print:text-black mt-1 block">
              Basket average revenue
            </span>
          </div>

          <div className="rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
            <div className="flex items-center justify-between text-ink/40 print:text-black">
              <span className="font-mono text-[10px] uppercase tracking-wider">Customer Lifetime Value (CLV)</span>
              <Award size={16} className="text-purple-600 print:text-black" />
            </div>
            <p className="mt-2 text-2xl lg:text-3xl font-semibold tracking-tight text-ink print:text-black">
              {formatKES(summaryMetrics.clv)}
            </p>
            <span className="text-[9px] text-ink/40 font-mono print:text-black mt-1 block">
              Cumulative spend per buyer
            </span>
          </div>
        </div>

        {/* Visualizations Section */}
        {summaryMetrics.orderCount > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Sales Trend SVG Line Chart */}
            <div className="lg:col-span-2 rounded-2xl border border-ink/10 bg-white p-5 flex flex-col justify-between print:border-black">
              <div className="flex items-center justify-between no-print">
                <h3 className="font-display text-sm uppercase font-semibold tracking-wide text-ink">
                  {metricTab === "sales" ? "Sales Revenue Trend" : "Order Volume Trend"}
                </h3>
                <div className="flex rounded-lg border border-ink/10 p-0.5 bg-stone-50 text-[10px] font-mono uppercase tracking-wider">
                  <button
                    onClick={() => setMetricTab("sales")}
                    className={`rounded-md px-2 py-1 transition-all ${
                      metricTab === "sales" ? "bg-white text-ink shadow-sm font-semibold" : "text-ink/50"
                    }`}
                  >
                    KES Sales
                  </button>
                  <button
                    onClick={() => setMetricTab("orders")}
                    className={`rounded-md px-2 py-1 transition-all ${
                      metricTab === "orders" ? "bg-white text-ink shadow-sm font-semibold" : "text-ink/50"
                    }`}
                  >
                    Orders
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              {timeSeriesData.length > 0 ? (
                <div className="relative mt-4 h-[240px] w-full">
                  <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FF5A1F" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#FF5A1F" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y =
                        chartCoordinates.paddingTop +
                        ratio * (240 - chartCoordinates.paddingTop - 40);
                      const displayVal = chartCoordinates.maxVal * (1 - ratio);
                      return (
                        <g key={i} className="opacity-30 print:opacity-10">
                          <line
                            x1={chartCoordinates.paddingLeft}
                            y1={y}
                            x2="580"
                            y2={y}
                            stroke="#15151A"
                            strokeWidth="0.5"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={chartCoordinates.paddingLeft - 8}
                            y={y + 4}
                            textAnchor="end"
                            fill="#15151A"
                            className="font-mono text-[9px] text-ink/40"
                          >
                            {metricTab === "sales"
                              ? displayVal >= 1000
                                ? `${(displayVal / 1000).toFixed(0)}k`
                                : displayVal
                              : displayVal.toFixed(0)}
                          </text>
                        </g>
                      );
                    })}

                    {/* X Axis Labels */}
                    {chartCoordinates.points.map((pt, i) => {
                      // Skip some labels if there are too many to avoid overlapping
                      const skip =
                        chartCoordinates.points.length > 15 && i % Math.ceil(chartCoordinates.points.length / 8) !== 0;
                      if (skip) return null;

                      return (
                        <text
                          key={i}
                          x={pt.x}
                          y="225"
                          textAnchor="middle"
                          fill="#15151A"
                          className="font-mono text-[9px] opacity-40 fill-ink"
                        >
                          {pt.label}
                        </text>
                      );
                    })}

                    {/* Line path filled area */}
                    {chartCoordinates.fillPath && (
                      <path d={chartCoordinates.fillPath} fill="url(#chartGradient)" />
                    )}

                    {/* Main stroke line */}
                    {chartCoordinates.path && (
                      <path
                        d={chartCoordinates.path}
                        fill="none"
                        stroke="#FF5A1F"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Interactive dots */}
                    {chartCoordinates.points.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.y}
                        r={hoveredDataIndex === i ? 6 : 3.5}
                        fill={hoveredDataIndex === i ? "#FF5A1F" : "#white"}
                        stroke="#FF5A1F"
                        strokeWidth="2.5"
                        className="cursor-pointer transition-all duration-150 no-print"
                        onMouseEnter={() => setHoveredDataIndex(i)}
                        onMouseLeave={() => setHoveredDataIndex(null)}
                      />
                    ))}
                  </svg>

                  {/* Interactive Tooltip Overlay */}
                  {hoveredDataIndex !== null && chartCoordinates.points[hoveredDataIndex] && (
                    <div
                      className="absolute z-10 rounded-xl bg-ink p-2 text-white shadow-xl text-[10px] font-mono pointer-events-none animate-ticket-pop"
                      style={{
                        left: `${(chartCoordinates.points[hoveredDataIndex].x / 600) * 100}%`,
                        top: `${(chartCoordinates.points[hoveredDataIndex].y / 240) * 100 - 15}%`,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="font-semibold text-white">
                        {chartCoordinates.points[hoveredDataIndex].label}
                      </div>
                      <div className="text-[#D4FF3D] font-bold mt-0.5">
                        {metricTab === "sales"
                          ? formatKES(chartCoordinates.points[hoveredDataIndex].value)
                          : `${chartCoordinates.points[hoveredDataIndex].value} Orders`}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-[200px] items-center justify-center text-xs text-ink/30 font-mono">
                  Insufficient data to render chart.
                </div>
              )}
            </div>

            {/* Loyalty Cohort SVG Donut Chart */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5 flex flex-col justify-between print:border-black">
              <div>
                <h3 className="font-display text-sm uppercase font-semibold tracking-wide text-ink">
                  New vs Repeat Cohorts
                </h3>
                <p className="text-[10px] text-ink/40 font-mono mt-0.5">
                  Order counts by customer retention
                </p>
              </div>

              {customerInsights.totalCustomersCount > 0 ? (
                <div className="flex flex-col items-center justify-center my-4">
                  {/* SVG Donut Circle */}
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Gray track */}
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ECE9E1" strokeWidth="3" />
                      {/* Repeat slice */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#FF5A1F"
                        strokeWidth="3"
                        strokeDasharray={`${customerInsights.repeatRate} ${100 - customerInsights.repeatRate}`}
                        strokeDashoffset="0"
                      />
                    </svg>
                    {/* Donut inner text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent">
                      <span className="text-xl font-bold tracking-tight text-ink">
                        {customerInsights.repeatRate.toFixed(0)}%
                      </span>
                      <span className="text-[8px] font-mono uppercase tracking-wider text-ink/40">
                        Repeat Rate
                      </span>
                    </div>
                  </div>

                  {/* Legends */}
                  <div className="mt-4 w-full grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
                      <span className="text-ink/60">Repeat:</span>
                      <span className="font-semibold text-ink">{customerInsights.repeatCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                      <span className="text-ink/60">One-Time:</span>
                      <span className="font-semibold text-ink">{customerInsights.oneTimeCount}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[150px] items-center justify-center text-xs text-ink/30 font-mono">
                  No cohort data.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-ink/20 py-16 text-center text-ink/40 font-mono">
            <AlertCircle className="mx-auto text-ink/30 mb-2" size={32} />
            No data matched filters for chart generation.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Detailed Data Tables (Customers / Products / Categories) */}
          <div className="lg:col-span-2 rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-ink/5">
              {/* Table Tab Selector */}
              <div className="flex gap-4 font-display text-xs uppercase tracking-wider font-semibold no-print">
                {(["customers", "products", "categories"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`pb-1 border-b-2 transition-all ${
                      detailTab === tab ? "border-hazard text-hazard" : "border-transparent text-ink/40 hover:text-ink"
                    }`}
                  >
                    {tab === "customers"
                      ? "Top Spenders"
                      : tab === "products"
                      ? "Product Demand"
                      : "Categories"}
                  </button>
                ))}
              </div>
              <div className="hidden print:block font-display text-sm uppercase font-semibold text-black">
                {detailTab === "customers"
                  ? "Top Customer Spenders Directory"
                  : detailTab === "products"
                  ? "Product Sales Velocity"
                  : "Category Performance"}
              </div>

              {/* CSV Export Button */}
              <button
                onClick={handleDownloadCSV}
                className="mt-2 sm:mt-0 flex items-center gap-1.5 rounded-xl border border-ink/10 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-ink/70 no-print"
              >
                <Download size={11} /> Export CSV
              </button>
            </div>

            {/* Tables Wrapper */}
            <div className="overflow-x-auto mt-4 max-h-[400px] overflow-y-auto">
              {detailTab === "customers" && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink/10 font-mono text-[9px] uppercase tracking-wider text-ink/40 bg-stone-50/50 print:bg-transparent">
                      <th className="px-4 py-2 text-center">Rank</th>
                      <th className="px-4 py-2">Customer Details</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2 text-right">Orders</th>
                      <th className="px-4 py-2 text-right">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {customerInsights.customerList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ink/30 font-mono">
                          No customer insights available.
                        </td>
                      </tr>
                    ) : (
                      customerInsights.customerList.map((c, index) => (
                        <tr key={c.phone} className="hover:bg-stone-50/30">
                          <td className="px-4 py-3 text-center font-mono font-bold text-ink/40">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-ink">{c.fullName}</div>
                            <div className="font-mono text-[10px] text-ink/50">{c.phone}</div>
                          </td>
                          <td className="px-4 py-3 text-ink/75 font-body">
                            <div>{c.county}</div>
                            <div className="text-[10px] text-ink/50">{c.town}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-ink/80">{c.orderCount}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                            {formatKES(c.totalSpent)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {detailTab === "products" && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink/10 font-mono text-[9px] uppercase tracking-wider text-ink/40 bg-stone-50/50 print:bg-transparent">
                      <th className="px-4 py-2 text-center">Rank</th>
                      <th className="px-4 py-2">Product Name</th>
                      <th className="px-4 py-2">Brand/Category</th>
                      <th className="px-4 py-2 text-right">Units Sold</th>
                      <th className="px-4 py-2 text-right">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {productInsights.productList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ink/30 font-mono">
                          No product analytics.
                        </td>
                      </tr>
                    ) : (
                      productInsights.productList.map((p, index) => (
                        <tr key={p.productId} className="hover:bg-stone-50/30">
                          <td className="px-4 py-3 text-center font-mono font-bold text-ink/40">#{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-ink">{p.name}</td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-ink/65">{p.brand}</div>
                            <div className="font-mono text-[10px] uppercase text-ink/40">{p.category}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-ink/80">{p.quantitySold}</td>
                          <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                            {formatKES(p.revenue)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {detailTab === "categories" && (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-ink/10 font-mono text-[9px] uppercase tracking-wider text-ink/40 bg-stone-50/50 print:bg-transparent">
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2 text-right">Units Sold</th>
                      <th className="px-4 py-2 text-right">Total Revenue</th>
                      <th className="px-4 py-2 text-right">Market Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {productInsights.categoryList.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-ink/30 font-mono">
                          No categories recorded.
                        </td>
                      </tr>
                    ) : (
                      productInsights.categoryList.map((c) => {
                        const share =
                          summaryMetrics.totalSales > 0 ? (c.revenue / summaryMetrics.totalSales) * 100 : 0;
                        return (
                          <tr key={c.name} className="hover:bg-stone-50/30">
                            <td className="px-4 py-3 font-semibold uppercase font-mono tracking-wider text-ink">
                              {c.name}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-ink/80">{c.quantitySold}</td>
                            <td className="px-4 py-3 text-right font-mono font-semibold text-ink">
                              {formatKES(c.revenue)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-hazard font-semibold">
                              {share.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Regional Sales Demand & Calculated Business Insights Panel */}
          <div className="space-y-6">
            {/* Top Counties */}
            <div className="rounded-2xl border border-ink/10 bg-white p-5 print:border-black">
              <h3 className="font-display text-sm uppercase font-semibold tracking-wide text-ink pb-3 border-b border-ink/5">
                Regional Demand Hubs
              </h3>
              <div className="mt-4 space-y-3">
                {countyInsights.length === 0 ? (
                  <p className="text-xs text-ink/30 font-mono text-center py-6">
                    No county statistics available.
                  </p>
                ) : (
                  countyInsights.slice(0, 5).map((ci, i) => {
                    const ratio =
                      summaryMetrics.totalSales > 0 ? (ci.revenue / summaryMetrics.totalSales) * 100 : 0;
                    return (
                      <div key={ci.county} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-ink">{ci.county}</span>
                          <span className="font-mono text-ink/65 text-[10px]">
                            {formatKES(ci.revenue)} ({ratio.toFixed(0)}%)
                          </span>
                        </div>
                        {/* Horizontal Bar Chart */}
                        <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                          <div
                            className="h-full bg-hazard rounded-full transition-all duration-500"
                            style={{ width: `${ratio}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Calculated AI Insights */}
            <div className="rounded-2xl border border-ink/10 bg-[#15151A] text-white p-5 print:border-black print:bg-white print:text-black">
              <div className="flex items-center gap-1.5 pb-3 border-b border-white/10 print:border-black">
                <Info size={16} className="text-[#D4FF3D] print:text-black" />
                <h3 className="font-display text-sm uppercase font-semibold tracking-wide text-[#D4FF3D] print:text-black">
                  AI-Assisted Customer Insights
                </h3>
              </div>
              <div className="mt-4 space-y-3.5 text-xs text-stone-300 leading-relaxed font-body print:text-black">
                {businessInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <span className="text-[#D4FF3D] font-bold select-none print:text-black">•</span>
                    <p>{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
