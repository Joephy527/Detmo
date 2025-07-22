"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Subscription = ({ data }: { data: any }) => {
  const router = useRouter();

  const { getToken } = useAuth();
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { ClerkID, Email, Subscription } = data;
  const handleCancelClick = () => {
    setIsOpen(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/subscriptions/${Subscription.system_subscription_id}/cancel`,
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

  const isPayer = user?.id === Subscription?.payer?.clerk_id;
  const isCurrentUser = ClerkID === user?.id;

  const getSubscriptionStatus = () => {
    if (!Subscription) {
      return (
        <Link
          href={isCurrentUser ? "/pricing" : `/pricing?user_id=${ClerkID}`}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
        >
          Unpaid
        </Link>
      );
    }

    switch (Subscription.status) {
      case "active":
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
            {isPayer && (
              <button
                onClick={handleCancelClick}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {Subscription.status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">{getSubscriptionStatus()}</div>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}

      {/* ShadCN Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Subscription Cancellation</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this subscription? The user will
              lose access to premium features immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">User: {Email}</p>
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
    </div>
  );
};

export default Subscription;
