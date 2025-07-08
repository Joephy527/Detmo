"use client";

import { DownloadIcon } from "lucide-react";
import { FC, useState } from "react";

import { Button } from "@/components/ui/button";
import DatePickerComponent from "@/components/ui/date-picker";
import UploadCSVDialog from "./upload-csv-dialog";
import { downloadCSV } from "@/actions/spend-analysis";
import { Spinner } from "@chakra-ui/react";
import { format, subDays } from "date-fns";

const SpendActions = () => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    const data = await downloadCSV();
    setIsDownloading(false);
    const url = data.dataUrl;

    // const url = window.URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv"); // Set the file name

    // Append to the document, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release the URL object
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className=" flex md:flex-row flex-col justify-between items-center gap-4 py-4 mb-2.5">
      <h1 className=" md:text-3xl sm:text-2xl text-xl font-medium">
        Spend Analysis{" "}
      </h1>
      <div className="flex gap-6 md:flex-row flex-col flex-wrap">
        <div className=" flex gap-x-4 justify-center items-center">
          <UploadCSVDialog />

          <Button
            variant={"secondary"}
            size={"sm"}
            className="bg-[#EBEBEB] px-7 h-[35px]"
            onClick={() => handleDownload()}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Spinner className="size-5 mr-2" /> Downloading...
              </>
            ) : (
              <>
                <DownloadIcon className="w-5 h-5 mr-2" />
                Download POs
              </>
            )}
          </Button>
        </div>
        <div className=" flex gap-x-4 justify-center items-center">
          <DatePickerComponent
            dateValue={subDays(new Date(), 1000)}
            dateName="startDate"
            // onDateChange={() => {}}
            icon
            style="bg-[#FFFFFF]"
            placeholder={format(new Date(), "dd-mm-yyyy")}
          />
          <DatePickerComponent
            dateValue={new Date()}
            dateName="endDate"
            // onDateChange={() => {}}
            icon
            style="bg-[#FFFFFF]"
            placeholder={format(new Date(), "dd-mm-yyyy")}
          />
        </div>
      </div>
    </div>
  );
};

export default SpendActions;
