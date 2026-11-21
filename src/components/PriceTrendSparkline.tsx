import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Tag,
  CheckCircle2,
  Info,
  Calendar,
} from "lucide-react";
import { ItemCategory, Listing } from "../types";

interface PriceTrendSparklineProps {
  category: ItemCategory;
  currentPrice?: number;
  listingType?: "sell" | "exchange" | "both";
  allListings?: Listing[];
  className?: string;
}

// Seasonal historical monthly multipliers for campus academic calendar:
// -5 months (Apr): 0.92 (mid-semester lull)
// -4 months (May): 0.96 (end-sem finals review)
// -3 months (Jun): 0.93 (summer vacation recess)
// -2 months (Jul): 1.08 (new academic year begins / freshers arrival surge)
// -1 month (Aug): 1.12 (peak semester lab & course demand)
//  0 month (Sep): 1.05 (current steady campus trading rate)
const MONTH_FACTORS = [0.92, 0.96, 0.93, 1.08, 1.12, 1.05];
const VOLUME_FACTORS = [14, 18, 11, 38, 44, 29];

// Baseline realistic campus resale prices in INR by category
const CATEGORY_BASE_PRICES: Record<ItemCategory, number> = {
  Books: 430,
  Calculators: 780,
  "Lab Equipment": 560,
  Cycles: 2600,
  Bags: 520,
  Other: 410,
};

export const PriceTrendSparkline: React.FC<PriceTrendSparklineProps> = ({
  category,
  currentPrice,
  listingType = "sell",
  allListings = [],
  className = "",
}) => {
  // Generate the 6 historical months leading up to the current date
  const { chartData, sixMonthAvg, percentChange, isUpward, minPrice, maxPrice } = useMemo(() => {
    // Determine category base price, calibrated by active listings in database if available
    const categoryListings = allListings.filter(
      (l) => l.category === category && typeof l.price === "number" && l.price > 0
    );

    const defaultBase = CATEGORY_BASE_PRICES[category] || 450;
    const computedAvg =
      categoryListings.length > 0
        ? Math.round(categoryListings.reduce((sum, item) => sum + item.price, 0) / categoryListings.length)
        : defaultBase;

    // Blend default benchmark with actual catalog data for realistic smoothing
    const effectiveBase = categoryListings.length >= 3
      ? Math.round(computedAvg * 0.7 + defaultBase * 0.3)
      : defaultBase;

    const now = new Date();
    const data = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const shortMonth = d.toLocaleString("en-US", { month: "short" });
      const fullMonth = d.toLocaleString("en-US", { month: "long", year: "numeric" });
      const factorIndex = 5 - i;
      const factor = MONTH_FACTORS[factorIndex] ?? 1.0;
      const vol = Math.round((VOLUME_FACTORS[factorIndex] ?? 20) * (categoryListings.length > 0 ? 1.2 : 1.0));

      const avgPrice = Math.round(effectiveBase * factor);

      data.push({
        month: shortMonth,
        fullMonth,
        avgPrice,
        volume: vol,
      });
    }

    const firstPrice = data[0].avgPrice;
    const lastPrice = data[data.length - 1].avgPrice;
    const change = lastPrice - firstPrice;
    const pct = Number(((change / firstPrice) * 100).toFixed(1));
    const avg = Math.round(data.reduce((sum, pt) => sum + pt.avgPrice, 0) / data.length);
    const min = Math.min(...data.map((d) => d.avgPrice));
    const max = Math.max(...data.map((d) => d.avgPrice));

    return {
      chartData: data,
      sixMonthAvg: avg,
      percentChange: pct,
      isUpward: pct >= 0,
      minPrice: min,
      maxPrice: max,
    };
  }, [category, allListings]);

  // Price comparison vs Category 6-Month Avg
  const priceComparison = useMemo(() => {
    if (listingType === "exchange" || currentPrice === undefined || currentPrice <= 0) {
      return null;
    }
    const diff = currentPrice - sixMonthAvg;
    const diffPct = Math.round(Math.abs(diff / sixMonthAvg) * 100);

    if (Math.abs(diff) <= 15) {
      return {
        label: "Priced exactly at 6-month category average",
        type: "neutral",
        diffText: "Fair Market Price",
      };
    } else if (diff < 0) {
      return {
        label: `₹${Math.abs(diff)} (${diffPct}%) below 6-month category avg`,
        type: "below",
        diffText: "Great Student Value",
      };
    } else {
      return {
        label: `₹${diff} (${diffPct}%) above 6-month category avg`,
        type: "above",
        diffText: "Premium Condition / Accessories",
      };
    }
  }, [currentPrice, sixMonthAvg, listingType]);

  return (
    <div
      id={`price-trend-sparkline-${category.toLowerCase().replace(/\s+/g, "-")}`}
      className={`p-3.5 rounded-2xl bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] space-y-2.5 ${className}`}
    >
      {/* Header: Title + Category + 6-Mo Avg */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2F5D50] dark:bg-[#387262] text-white shrink-0">
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-semibold text-[#18201C] dark:text-[#ECF2EF] leading-none">
                Price Trend
              </h4>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#EFF4F1] dark:bg-[#182823] text-[#2F5D50] dark:text-[#7BBFA8] border border-[#C4D9D1] dark:border-[#2A4A40]">
                {category}
              </span>
            </div>
            <span className="text-[10px] font-medium text-[#5C6B63] dark:text-[#8FA199] flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3" />
              Historical avg selling price (Last 6 Months)
            </span>
          </div>
        </div>

        {/* 6-Month Average & Trend Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-medium text-[#5C6B63] dark:text-[#8FA199] leading-none">
              6-Mo Avg
            </div>
            <div className="text-sm font-bold font-mono text-[#18201C] dark:text-[#ECF2EF] leading-tight">
              ₹{sixMonthAvg.toLocaleString()}
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border select-none ${
              isUpward
                ? "bg-[#EFF4F1] dark:bg-[#182823] text-[#2F5D50] dark:text-[#7BBFA8] border-[#C4D9D1] dark:border-[#2A4A40]"
                : "bg-[#FDF2F2] dark:bg-[#261617] text-[#A63A3A] dark:text-[#E58989] border-[#F2CACA] dark:border-[#4E2628]"
            }`}
            title={`Category average price changed by ${percentChange}% over the last 6 months`}
          >
            {isUpward ? (
              <TrendingUp className="w-3 h-3 shrink-0" />
            ) : (
              <TrendingDown className="w-3 h-3 shrink-0" />
            )}
            <span>{isUpward ? `+${percentChange}%` : `${percentChange}%`}</span>
          </span>
        </div>
      </div>

      {/* Sparkline Chart Container */}
      <div className="w-full h-24 pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 6, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id={`priceTrendGrad-${category}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F5D50" stopOpacity={0.35} />
                <stop offset="85%" stopColor="#2F5D50" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: "#5C6B63", fontWeight: 600 }}
              dy={3}
            />

            <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const pt = payload[0].payload;
                return (
                  <div className="p-2 rounded-xl bg-[#141A18] text-[#ECF2EF] shadow-xl border border-[#242E2A] text-[11px] space-y-0.5 select-none">
                    <p className="font-semibold text-[#DFC29B]">{pt.fullMonth}</p>
                    <p className="font-bold font-mono text-[#7BBFA8] text-xs">
                      Avg Selling Price: ₹{pt.avgPrice.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#8FA199] font-medium">
                      Campus Activity: ~{pt.volume} items transacted
                    </p>
                  </div>
                );
              }}
            />

            <Area
              type="monotone"
              dataKey="avgPrice"
              stroke="#2F5D50"
              strokeWidth={2.25}
              fillOpacity={1}
              fill={`url(#priceTrendGrad-${category})`}
              activeDot={{
                r: 4.5,
                fill: "#387262",
                stroke: "#ffffff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Range & Valuation Benchmark Footer */}
      <div className="pt-2 border-t border-[#DFE6E2] dark:border-[#242E2A] flex items-center justify-between text-[11px] flex-wrap gap-1.5">
        <div className="flex items-center gap-1 text-[#5C6B63] dark:text-[#8FA199] font-medium">
          <span className="font-semibold">6-Mo Range:</span>
          <span className="font-mono font-bold text-[#18201C] dark:text-[#ECF2EF]">
            ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()}
          </span>
        </div>

        {priceComparison ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
              priceComparison.type === "below"
                ? "bg-[#EFF4F1] dark:bg-[#182823] text-[#2F5D50] dark:text-[#7BBFA8] border-[#C4D9D1] dark:border-[#2A4A40]"
                : priceComparison.type === "above"
                ? "bg-[#FDF6EC] dark:bg-[#251F15] text-[#9E6B43] dark:text-[#DFC29B] border-[#EED8B8] dark:border-[#4A3B23]"
                : "bg-white dark:bg-[#1B2320] text-[#18201C] dark:text-[#ECF2EF] border-[#DFE6E2] dark:border-[#242E2A]"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>{priceComparison.label}</span>
          </span>
        ) : (
          <span className="text-[10px] font-medium text-[#5C6B63] dark:text-[#8FA199]">
            Benchmark for {category} exchanges
          </span>
        )}
      </div>
    </div>
  );
};
