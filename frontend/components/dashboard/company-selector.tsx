"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

// Default company template - moved outside component to prevent recreation
const DEFAULT_COMPANY: CompanyDetailsType = {
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
  const [company, setCompany] = useState<CompanyDetailsType | null>(null);
  const [companies, setCompanies] = useState<CompanyDetailsType[]>([]);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const { user, isLoaded: isUserLoaded } = useUser();

  // Get user email once when loaded
  const userEmail = useMemo(() => {
    return user?.emailAddresses[0]?.emailAddress || "default@gmail.com";
  }, [user]);

  // Fetch all data in a single useEffect
  const fetchData = useCallback(async () => {
    if (!isUserLoaded) return;

    setIsLoading(true);
    try {
      // Fetch data in parallel
      const [allCompanies, userCompany] = await Promise.all([
        getCompanyDetails(),
        getUserCompanyDetails(),
      ]);

      // Set current company
      if (userCompany) {
        setCompany(userCompany);
      }

      // Filter companies by email domain
      if (allCompanies) {
        const matchingCompanies = getMatchingCompaniesByEmailDomain(
          { Email: userEmail },
          allCompanies,
        );
        setCompanies(matchingCompanies);
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Failed to load company data");
    } finally {
      setIsLoading(false);
    }
  }, [isUserLoaded, userEmail]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize the create company handler
  const handleCreateCompany = useCallback(async () => {
    if (!newCompanyName.trim()) return;

    setIsCreating(true);
    try {
      const newCompany = await createCompanyDetails({
        ...DEFAULT_COMPANY,
        DisplayName: newCompanyName,
        Email: userEmail,
      });

      if (newCompany?.data) {
        setIsDialogOpen(false);
        toast.success("Company created successfully");
        window.location.reload();
      } else {
        toast.error("Failed to create company");
        fetchData();
      }
    } catch (error) {
      console.error("Failed to create company:", error);
      toast.error("Something went wrong while creating the company");
    } finally {
      setIsCreating(false);
      setNewCompanyName("");
    }
  }, [newCompanyName, userEmail, fetchData]);

  // Memoize the update company handler
  const handleUpdateUserCompany = useCallback(
    async (companyId?: string) => {
      if (!companyId) return;

      setIsSwitching(true);
      try {
        const res = await updateUserCompany(companyId);

        if (res?.success) {
          toast.success("Company updated successfully");

          await user?.reload();
          console.log(user);

          // Update local state instead of reloading
          const newActiveCompany = companies.find(
            (c) => c.CompanyDetailsID === companyId,
          );
          if (newActiveCompany) {
            setCompany(newActiveCompany);
          } else {
            // Refetch if we can't find the company locally
            fetchData();
          }
        } else {
          toast.error("Failed to update company");
        }
      } catch (error) {
        console.error("Error switching company:", error);
        toast.error("Something went wrong");
      } finally {
        setIsSwitching(false);
      }
    },
    [companies, fetchData],
  );

  // Reset dialog state when closed
  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewCompanyName("");
    }
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="px-4 mb-4">
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

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
