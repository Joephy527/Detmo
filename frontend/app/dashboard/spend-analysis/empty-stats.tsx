"use client";

import React, { useEffect } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import UploadCSVDialog from "@/components/dashboard/spend-analysis-comp/upload-csv-dialog";
import { countryNameToISOMap } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const EmptyStats = () => {
  // Convert country map to array and sort alphabetically
  const sortedCountries = Object.entries(countryNameToISOMap).sort(
    ([countryA], [countryB]) => countryA.localeCompare(countryB),
  );

  return (
    <div className="w-full grow bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 ">
      <Breadcrumb className=" ">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Spend Analysis</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mb-4 flex justify-between ">
        <h1 className="mt-4 mb-7 text-[32px] font-[700]">Spend Analysis</h1>
      </div>

      <div className="w-full h-full flex justify-center">
        <div className="pt-14 sm:pt-[80px] flex flex-col items-center">
          <h1 className="text-[15px] font-[400] text-[#3B3C41] text-center mb-8">
            Upload your purchase orders to visualize and understand your
            commodity spends.{" "}
          </h1>
          <UploadCSVDialog text="Upload Purchase Orders" />
          <div className="mt-4 flex gap-4 items-center">
            <a
              href="/sample_purchase_orders.csv"
              download="sample_purchase_orders.csv"
              className="text-blue-500 hover:text-blue-700 text-sm underline"
            >
              Download Sample CSV
            </a>

            <Dialog>
              <DialogTrigger asChild>
                <button className="text-xs px-2 py-1 focus:outline-none h-auto border rounded-md border-primary text-primary">
                  View Country Codes
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                <DialogHeader>
                  <DialogTitle>Country Codes Reference</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {sortedCountries.map(([country, code]) => (
                    <div
                      key={code}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                    >
                      <span className="font-medium min-w-[180px]">
                        {country}
                      </span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                        {code}
                      </span>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <p className="text-xs text-gray-500 text-center max-w-md mt-2">
            Note: Your CSV should include country codes from the list above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyStats;
