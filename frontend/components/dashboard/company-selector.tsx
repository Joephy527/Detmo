"use client";

import { useCallback, useEffect, useState } from "react";
import { Building, ChevronDown, Plus } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCompanyDetails,
  getCompanyDetails,
  getUserCompanyDetails,
  updateUserCompany,
} from "@/actions/settings";
import type { CompanyDetailsType } from "@/lib/types";
import { getMatchingCompaniesByEmailDomain } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCompanyDetails,
  useCreateCompany,
  useUpdateUserCompany,
  useUserCompanyDetails,
} from "./react-query-fetchs";

// Default company template - moved outside component to prevent recreation
export const DEFAULT_COMPANY: CompanyDetailsType = {
  DisplayName: "Detmo",
  PhoneNumber: "+1234567890",
  Email: "defaut@test.com",
  LegalName: "Detmo",
  RegistrationNumber: "123456789",
  VatNumber: "9876543210",
  Address: "3092S Abc Xyz",
  City: "New York",
  Country: "USA",
  Zip: "10001",
  Currency: {
    CurrencyID: "USD",
    Currency: "USD",
  },
};

export default function CompanySelector() {
  const { data: allCompanies } = useCompanyDetails();
  const { data: company } = useUserCompanyDetails();

  const { mutate: createCompany, isPending: isCreating } = useCreateCompany();
  const { mutate: updateCompany, isPending: isSwitching } =
    useUpdateUserCompany();

  // const [company, setCompany] = useState<CompanyDetailsType | null>(null);
  const [companies, setCompanies] = useState<CompanyDetailsType[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [isSwitching, setIsSwitching] = useState(false);
  // const [fetchError, setFetchError] = useState<string | null>(null);

  const { user, isLoaded: isUserLoaded } = useUser();

  const userEmail =
    user?.emailAddresses[0]?.emailAddress || "default@gmail.com";

  const fetchCompanyData = useCallback(async () => {
    const matchingCompanies = getMatchingCompaniesByEmailDomain(
      { Email: userEmail },
      allCompanies,
    );

    setCompanies(matchingCompanies);
  }, [user, allCompanies]);

  useEffect(() => {
    if (isUserLoaded) {
      fetchCompanyData();
    }
  }, [isUserLoaded, fetchCompanyData, allCompanies, company]);

  // Memoize the create company handler
  const handleCreateCompany = useCallback(async () => {
    if (!newCompanyName.trim()) return;

    createCompany(
      {
        ...DEFAULT_COMPANY,
        DisplayName: newCompanyName,
        Email: userEmail,
      },
      {
        onSuccess: (data: any) => {
          toast.success("Company created successfully");
          setNewCompanyName("");

          window?.location?.reload();
        },
        onError: () => {
          toast.error("Something went wrong while creating the company");
        },
      },
    );
  }, [newCompanyName, userEmail, createCompany, toast]);

  // Memoize the update company handler
  const handleUpdateUserCompany = useCallback(
    async (companyId?: string) => {
      if (!companyId || !isUserLoaded) return;

      updateCompany(companyId, {
        onSuccess: (res) => {
          toast.success("Company updated successfully");

          window?.location?.reload();
        },
        onError: (error) => {
          console.error("Error switching company:", error);
          toast.error("Something went wrong");
        },
      });
    },
    [updateCompany, toast],
  );

  // Reset dialog state when closed
  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewCompanyName("");
    }
  }, []);

  /* if (fetchError) {
    return (
      <div className="px-4 mb-4">
        <div className="border rounded-md px-3 py-2 text-center">
          <p className="text-red-500 text-xs">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setFetchError(null);
              fetchCompanyData();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  } */

  // Show loading state
  /* if (isLoading) {
    return (
      <div className="px-4 mb-4">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  } */

  return (
    <div className="px-4 mb-4">
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between"
              disabled={isSwitching}
            >
              <div className="flex items-center gap-2 truncate">
                <Building className="h-4 w-4" />
                <span className="truncate">
                  {isSwitching
                    ? "Switching..."
                    : company?.DisplayName || "Select Company"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[240px]">
            {companies.length > 0 ? (
              companies.map((item) => (
                <DropdownMenuItem
                  key={item.CompanyDetailsID}
                  onClick={() => handleUpdateUserCompany(item.CompanyDetailsID)}
                  disabled={
                    isSwitching ||
                    company?.CompanyDetailsID === item.CompanyDetailsID
                  }
                  className={
                    company?.CompanyDetailsID === item.CompanyDetailsID
                      ? "bg-muted"
                      : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    <span>{item.DisplayName}</span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled className="text-muted-foreground">
                No companies found
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <div className="flex items-center gap-2 text-primary">
                  <Plus className="h-4 w-4" />
                  <span>Create New Company</span>
                </div>
              </DropdownMenuItem>
            </DialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>
              Enter the details for your new company. This will become your
              active company.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                placeholder="Enter company name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateCompany}
              disabled={!newCompanyName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
