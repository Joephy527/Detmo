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
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { user, isLoaded: isUserLoaded } = useUser();

  const userEmail =
    user?.emailAddresses[0]?.emailAddress || "default@gmail.com";

  const fetchCompanyData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const currentUserEmail =
        user?.emailAddresses[0]?.emailAddress || "default@gmail.com";

      // Fetch all companies first
      const allCompanies = await getCompanyDetails().catch(() => {
        setFetchError("Failed to load companies list");
        return null;
      });

      // Then fetch user's specific company (but don't fail completely if this fails)
      let userCompany = null;
      try {
        userCompany = await getUserCompanyDetails();
      } catch (error) {
        setFetchError("Failed to load user company");
        // Continue with just the matching companies
      }

      if (allCompanies === null || userCompany === null) {
        throw new Error();
      }

      const matchingCompanies = getMatchingCompaniesByEmailDomain(
        { Email: currentUserEmail },
        allCompanies,
      );

      setCompanies(matchingCompanies);
      setCompany(userCompany);
    } catch (error) {
      console.error("Fetch error:", error);

      if (!fetchError) {
        setFetchError("Failed to load company data");
      }
      // Auto-retry logic (max 3 times)
      if (retryCount < 3) {
        setTimeout(() => setRetryCount((prev) => prev + 1), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, retryCount]);

  useEffect(() => {
    if (!isUserLoaded) return;
    fetchCompanyData();
  }, [isUserLoaded, fetchCompanyData]);

  /* useEffect(() => {
    if (!isUserLoaded || !user) {
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Get fresh email each time to avoid stale closures
        const currentUserEmail =
          user.emailAddresses[0]?.emailAddress || "default@gmail.com";

        // Sequential fetching for better error tracking
        const allCompanies = await getCompanyDetails();
        if (!allCompanies) {
          throw new Error("Failed to fetch companies list");
        }

        const userCompany = await getUserCompanyDetails();
        // User company might be null for new users - that's acceptable

        // Process data
        const matchingCompanies = getMatchingCompaniesByEmailDomain(
          { Email: currentUserEmail },
          allCompanies,
        );

        // Batch state updates
        setCompanies(matchingCompanies);
        if (userCompany) {
          setCompany(userCompany);
        } else if (matchingCompanies.length > 0) {
          // Auto-select first matching company if user has none
          setCompany(matchingCompanies[0]);
        }
      } catch (error) {
        console.error("Data fetching error:", error);
        toast.error("Failed to load company data");
        // Reset to empty state on error
        setCompanies([]);
        setCompany(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a timeout fallback
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 10000);

    fetchData();

    return () => clearTimeout(timeout);
  }, [isUserLoaded, user]); // Only depend on Clerk states */

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
        // window.location.reload();
      } else {
        toast.error("Failed to create company");
        // fetchData();
      }
    } catch (error) {
      console.error("Failed to create company:", error);
      toast.error("Something went wrong while creating the company");
    } finally {
      setIsCreating(false);
      setNewCompanyName("");
    }
  }, [newCompanyName, userEmail]);

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

          // window.location.reload();

          // Update local state instead of reloading
          const newActiveCompany = companies.find(
            (c) => c.CompanyDetailsID === companyId,
          );
          if (newActiveCompany) {
            setCompany(newActiveCompany);
          } else {
            // Refetch if we can't find the company locally
            // fetchData();
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
    [companies],
  );

  // Reset dialog state when closed
  const handleDialogChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNewCompanyName("");
    }
  }, []);

  if (fetchError && retryCount >= 3) {
    return (
      <div className="px-4 mb-4">
        <div className="border rounded-md px-3 py-2 text-center">
          <p className="text-red-500">{fetchError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRetryCount(0);
              setFetchError(null);
              fetchCompanyData();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

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
