import React, { useState } from "react";
import toast from "react-hot-toast";
import { Spinner } from "@chakra-ui/react";

import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogTrigger,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteCompanyDetails } from "@/actions/settings";

export default function DeleteCompany({ company_id }: { company_id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAction = async () => {
    setIsDeleting(true);
    const response = await deleteCompanyDetails(company_id);
    setIsDeleting(false);
    if (response?.success) {
      toast.success("Company deleted successfully", { duration: 10000 });
      window.location.reload();
    } else {
      toast.error(`Something went wrong - Please try again later`, {
        duration: 10000,
      });
    }
  };
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant={"destructive"} className="outline-0">
            Delete Company
          </Button>
        </DialogTrigger>

        <DialogContent className="w-full sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-[500]">Delete company</DialogTitle>
            <DialogDescription className="font-[500]">
              Are you sure you want to delete the company?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center sm:justify-end gap-5 mt-4">
            <DialogClose asChild>
              <Button
                variant={"secondary"}
                className="font-[400] px-10"
                disabled={isDeleting}
              >
                Cancel
              </Button>
            </DialogClose>

            <Button
              className="font-[400] px-14"
              variant={"destructive"}
              disabled={isDeleting}
              onClick={deleteAction}
            >
              {isDeleting ? <Spinner /> : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
