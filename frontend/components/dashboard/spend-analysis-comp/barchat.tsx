"use client";
import { SpendingBySupplierType } from "@/lib/types";
import { FC, use } from "react";
import {
  Bar,
  BarChart,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useSpendingBySupplier } from "./react-query-fetchs";
import { Button } from "@/components/ui/button";
import { EmptyStateFallback } from "./EmptyFallback";

export interface props {
  startDate?: string;
  endDate?: string;
}
const Barchat: FC<props> = ({ startDate, endDate }) => {
  const {
    data: spending_by_supplier,
    refetch,
    isError,
  } = useSpendingBySupplier({
    startDate,
    endDate,
  });

  if (isError) {
    return (
      <div className="px-4 mb-4 h-full">
        <div className="border rounded-md px-3 py-2 text-center h-full grid place-items-center">
          <p className="text-red-500 text-xs">Something went wrong</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!spending_by_supplier || spending_by_supplier.length === 0) {
    return <EmptyStateFallback message="supplier spending" />;
  }

  const rangeData = spending_by_supplier.map((data) => {
    return {
      name: data["VendorName"],
      amount: data["Total Spend"],
    };
  });

  const CustomizedAxisTick = (tick: any) => {
    const { x, y, stroke, payload } = tick;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#BFBFBF"
          transform="rotate(-35)"
          fontSize={12}
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <div className="h-[350px] w-full bg-white rounded-[12px]">
      <ResponsiveContainer width={"100%"} height={"100%"}>
        <BarChart
          data={rangeData}
          margin={{ top: 10, bottom: 30, right: 40, left: 15 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={CustomizedAxisTick}
            stroke="#BFBFBF"
            interval={0}
          />
          <YAxis
            dataKey={"amount"}
            tick={{ fill: "#BFBFBF", fontSize: "14px" }}
            tickFormatter={(value) =>
              new Intl.NumberFormat("en-US", {
                notation: "compact",
                compactDisplay: "short",
              }).format(value)
            }
            stroke="#BFBFBF"
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            formatter={(value) => value.toLocaleString()}
          />
          <Bar
            dataKey="amount"
            fill="#8861F3"
            barSize={26}
            radius={[7, 7, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Barchat;
