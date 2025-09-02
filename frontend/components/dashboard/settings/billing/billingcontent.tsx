"use client";
import { FC, useState } from "react";
import { billingTabData } from "@/data/setting";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/datatable";
import { useSubscriptionDetails } from "./react-query-fetches";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Props {}

type billingTabData = {
  BeneficiaryID: string;
  BeneficiaryEmail?: string;
  CreatedAt: Date;
  EndDate?: Date;
  NextBillingDate?: Date;
  PayerID: string;
  RazorpaySubscriptionID: string;
  StartDate?: Date;
  Status: string;
  SubscriptionID: string;
  UpdatedAt?: string;
  Amount?: number;
  Currency?: string;
};

function formatAmount(amount?: number, currency?: string): string | null {
  if (!amount || !currency) {
    return null;
  }

  const upperCurrency = currency.toUpperCase();

  // Currencies without fractional units
  const noDecimalCurrencies = new Set(["JPY", "KRW", "VND"]);

  let majorAmount: number;

  if (noDecimalCurrencies.has(upperCurrency)) {
    majorAmount = amount; // already in whole units
  } else {
    majorAmount = amount / 100; // convert minor → major
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: upperCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(majorAmount);
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const billingColumn: ColumnDef<billingTabData>[] = [
  {
    accessorKey: "date",
    header: () => {
      return <div className="font-[700] text-[14px] text-[#8A8A8A]">Date</div>;
    },
    cell: ({ row }) => {
      const data = row.original;
      const date =
        typeof data.CreatedAt === "string"
          ? new Date(data.CreatedAt)
          : data.CreatedAt;
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {format(date, "EEE dd MMM, yyyy hh:mm a")}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">
          Beneficiary Email
        </div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;

      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {data.BeneficiaryEmail ?? ""}
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">Amount</div>
      );
    },
    cell: ({ row }) => {
      const data = row.original;
      const amountDisplay = formatAmount(data.Amount, data.Currency);
      return (
        <div className="font-[400] text-[14px] text-[#3B3C41]">
          {`${amountDisplay ?? `₹3,397.95`}`}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => {
      return (
        <div className="font-[700] text-[14px] text-[#8A8A8A]">Status</div>
      );
    },
    cell: ({ row }) => {
      const router = useRouter();
      const { getToken } = useAuth();

      const [isOpen, setIsOpen] = useState(false);
      const [isCancelling, setIsCancelling] = useState(false);
      const [error, setError] = useState<string | null>(null);

      const data = row.original;

      const handleCancelClick = () => {
        setIsOpen(true);
      };

      const handleConfirmCancel = async () => {
        setIsCancelling(true);
        setError(null);

        try {
          const token = await getToken();
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payments/subscriptions/${data.SubscriptionID}/cancel`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error(
              (await response.text()) || "Failed to cancel subscription",
            );
          }

          setIsOpen(false);
          // Refresh the page to update the UI
          router.refresh();
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "An unknown error occurred",
          );
        } finally {
          setIsCancelling(false);
        }
      };

      return (
        <div className="flex gap-4 items-center">
          <div
            className={`font-[400] text-[14px] text-[#3B3C41] ${data.Status === "active" ? "bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium" : ""}`}
          >
            {capitalizeFirstLetter(data.Status)}
          </div>
          {data.Status === "active" && (
            <div>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Subscription Cancellation</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel this subscription? The
                      user will lose access to premium features immediately.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        User: {data.BeneficiaryEmail}
                      </p>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsOpen(false)}
                      disabled={isCancelling}
                    >
                      Back
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmCancel}
                      disabled={isCancelling}
                    >
                      {isCancelling ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Cancelling...
                        </>
                      ) : (
                        "Confirm Cancellation"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <button
                onClick={handleCancelClick}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      );
    },
  },
];

const BillingContent: FC<Props> = ({}) => {
  const { data: billingTableData } = useSubscriptionDetails();

  return (
    <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1400px] lg:pt-[40px]">
      <DataTable columns={billingColumn} data={billingTableData} />
    </div>
  );
};

export default BillingContent;
