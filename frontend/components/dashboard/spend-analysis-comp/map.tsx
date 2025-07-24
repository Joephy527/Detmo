"use client";
import { ResponsiveChoropleth } from "@nivo/geo";
import countriesfeatures from "./worldcountries.json";
import { FC, use } from "react";
import { SpendingByLocationType } from "@/lib/types";
import { getCountryCode } from "@/lib/utils";
import { props } from "./barchat";
import { useSpendingByLocation } from "./react-query-fetchs";
import { Button } from "@/components/ui/button";
import { EmptyStateFallback } from "./EmptyFallback";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const GeoMap: FC<props> = ({ startDate, endDate }) => {
  const {
    data: spending_by_location,
    isError,
    refetch,
  } = useSpendingByLocation({
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

  if (!spending_by_location || spending_by_location.length === 0) {
    return <EmptyStateFallback message="spending by location" />;
  }

  const data = spending_by_location.map((data) => {
    return {
      id: getCountryCode(data.Country),
      value: data["Total Spend"],
    };
  });

  // Define your custom color scheme
  /* const colorScheme = [
    "#FFD8A8", // Light orange
    "#FFB347", // Orange
    "#FF8C42", // Darker orange
    "#FF6B35", // Orange-red
    "#FF3A20", // Red-orange
    "#E71D36", // Bright red
  ]; */
  const colorScheme = [
    "#FFF4E5", // Very light orange (almost white with orange tint)
    "#FFE0B2", // Light peach
    "#FFCC80", // Soft orange
    "#FFB74D", // Medium orange
    "#FFA726", // Vibrant orange
    "#FF9100", // Dark orange
    "#FF6D00", // Orange-red
    "#F4511E", // Red-orange
    "#D84315", // Deep red
  ];

  return (
    <div className="h-[350px] w-full bg-white rounded-[12px] relative pb-4">
      <ResponsiveChoropleth
        data={data}
        features={countriesfeatures.features}
        // features={countriesfeatures.features?.map((i) => ({ ...i, id: i?.properties.name }))}
        margin={{ top: 20, bottom: 30, right: 90, left: 15 }}
        colors={colorScheme}
        // colors="greys"
        domain={[0, 1000000]}
        unknownColor="#d3c5c5"
        label="properties.name"
        valueFormat=".2s"
        projectionTranslation={[0.5, 0.5]}
        projectionRotation={[0, 0, 0]}
        projectionScale={window.innerWidth < 600 ? 80 : 90} // Adjust based on screen size
        // enableGraticule={true}
        graticuleLineWidth={0}
        graticuleLineColor="#dddddd"
        borderWidth={1}
        // Responsive adjustments
        theme={{
          tooltip: {
            container: {
              background: "#ffffff",
              color: "#333333",
              fontSize: "12px",
              borderRadius: "4px",
              boxShadow: "0 3px 9px rgba(0, 0, 0, 0.15)",
            },
          },
        }}
        legends={[
          {
            anchor: "bottom-left",
            direction: "column",
            justify: true,
            translateX: 10,
            translateY: -20,
            itemsSpacing: 0,
            itemWidth: 94,
            itemHeight: 18,
            itemDirection: "left-to-right",
            itemTextColor: "#444444",
            itemOpacity: 0.85,
            symbolSize: 18,
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000000",
                  itemOpacity: 1,
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default GeoMap;
