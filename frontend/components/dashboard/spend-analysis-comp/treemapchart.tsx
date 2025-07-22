"use client";

import { ApexOptions } from "apexcharts";
import { FC, use, useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { SpendingByCommodityType } from "@/lib/types";
import { props } from "./barchat";
import { useSpendingByCommodity } from "./react-query-fetchs";

// Dynamically import ReactApexCharts with SSR disabled
const ReactApexCharts = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const TreeMap: FC<props> = ({ startDate, endDate }) => {
  const { data: spending_by_commodity } = useSpendingByCommodity({
    startDate,
    endDate,
  });

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!spending_by_commodity || !isMounted) return null;

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
    <div className="h-[350px] m-5 mr-0 mb-8 mt-2">
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
