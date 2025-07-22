"use client";
import { ResponsiveChoropleth } from "@nivo/geo";
import countriesfeatures from "./worldcountries.json";
import { FC, use } from "react";
import { SpendingByLocationType } from "@/lib/types";
import { getCountryCode } from "@/lib/utils";
import { props } from "./barchat";
import { useSpendingByLocation } from "./react-query-fetchs";

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.
const GeoMap: FC<props> = ({ startDate, endDate }) => {
  const { data: spending_by_location } = useSpendingByLocation({
    startDate,
    endDate,
  });

  if (!spending_by_location) return;

  const data = spending_by_location.map((data) => {
    return {
      id: getCountryCode(data.Country),
      value: data["Total Spend"],
    };
  });

  return (
    <div className="h-[350px] w-full bg-white rounded-[12px]">
      <ResponsiveChoropleth
        data={data}
        features={countriesfeatures.features}
        // features={countriesfeatures.features?.map((i) => ({ ...i, id: i?.properties.name }))}
        margin={{ top: 20, bottom: 30, right: 40, left: 15 }}
        colors="greys"
        domain={[0, 1000000]}
        unknownColor="#d3c5c5"
        label="properties.name"
        valueFormat=".2s"
        projectionTranslation={[0.5, 0.5]}
        projectionRotation={[0, 0, 0]}
        enableGraticule={true}
        graticuleLineWidth={0}
        graticuleLineColor="#dddddd"
        borderWidth={1}
        legends={[
          {
            anchor: "bottom-left",
            direction: "column",
            justify: true,
            translateX: 20,
            translateY: -100,
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
