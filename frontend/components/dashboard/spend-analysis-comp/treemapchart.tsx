"use client";

import { ApexOptions } from "apexcharts";
import { FC, use, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { SpendingByCommodityType } from "@/lib/types";
import { props } from "./barchat";
import { useSpendingByCommodity } from "./react-query-fetchs";
import { Button } from "@/components/ui/button";
import { EmptyStateFallback } from "./EmptyFallback";

// Dynamically import ReactApexCharts with SSR disabled
const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const TreeMap: FC<props> = ({ startDate, endDate }) => {
  const {
    data: spending_by_commodity,
    isError,
    refetch,
  } = useSpendingByCommodity({
    startDate,
    endDate,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  if (!isMounted) return null;

  if (!spending_by_commodity || spending_by_commodity?.length === 0) {
    return (
      <EmptyStateFallback message="spending by commodity" className="mt-4" />
    );
  }

  const options: ApexOptions = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    colors: ["#8861F3"],
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "15px",
      },
      formatter: (text, op): any => {
        return [text, `${op.value}%`];
      },
    },
  };
  const series = [
    {
      data: spending_by_commodity.map((item) => ({
        x: item.CommodityName,
        y: item["Percentage of Total Spending"],
      })),
    },
  ];

  return (
    <div className="h-[350px] mx-2">
      <ReactApexCharts
        options={options}
        series={series}
        type="treemap"
        width="100%"
        height="100%"
      />
    </div>
  );
};

export default TreeMap;
