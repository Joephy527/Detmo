"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PencilLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CompanyDetailsType } from "@/lib/types";
import { updateCompanyDetails } from "@/actions/settings";
import { getChangedValues } from "@/lib/utils";

interface EditFieldProps {
  label: string;
  fieldName: keyof CompanyDetailsType;
  value: string;
  company_details: CompanyDetailsType;
  role: string;
  dialogTitle?: string;
  fieldLabel?: string;
  placeholder?: string;
  minLength?: number;
  minLengthMessage?: string;
  fieldType?: string;
}

const EditField = ({
  label,
  fieldName,
  value,
  company_details,
  dialogTitle,
  fieldLabel,
  role,
  placeholder,
  minLength = 2,
  minLengthMessage,
  fieldType = "text",
}: EditFieldProps) => {
  const [isOpen, setOpen] = useState(false);

  // Dynamically create schema based on props
  const formSchema = z.object({
    [fieldName]: z.string().min(minLength, {
      message:
        minLengthMessage ||
        `${fieldLabel || label} must be at least ${minLength} characters`,
    }),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      [fieldName]: value,
    } as any,
  });

  const onSubmit = async (data: FormValues) => {
    const changed = getChangedValues(company_details, data);
    if (Object.keys(changed).length === 0) {
      setOpen(false);
      return;
    }

    const res = await updateCompanyDetails({
      ...company_details,
      ...data,
    });

    if (res?.success) {
      toast.success(`${label} updated successfully`);
      setOpen(false);
      return;
    }

    toast.error("Something went wrong");
  };

  return (
    <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap mb-7">
      <h1 className="text-[15px] font-[500] text-[#8A8A8A]/80 sm:w-1/2">
        {label}
      </h1>
      <div className="flex items-center justify-between w-full flex-wrap sm:w-1/2">
        <p className="font-[500] text-[15px] text-left">{value}</p>

        {role.toLowerCase() === "admin" && (
          <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <button className="outline-none">
                <PencilLine className="text-primary" strokeWidth={"1"} />
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-[500]">
                  {dialogTitle || `Edit ${label.toLowerCase()}`}
                </DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  className="grid gap-4 py-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="mb-3">
                    <FormItem>
                      <FormLabel className="text-[14px] sm:text-[16px] font-[500]">
                        {fieldLabel || label}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...form.register(fieldName as string)}
                          placeholder={
                            placeholder || `Enter ${label.toLowerCase()}`
                          }
                          type={fieldType}
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  </div>
                  <div className="flex justify-end gap-5">
                    <DialogClose asChild>
                      <Button
                        variant={"secondary"}
                        className="font-[400] px-10"
                      >
                        Cancel
                      </Button>
                    </DialogClose>

                    <Button className="font-[400] px-14" type="submit">
                      Save
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default EditField;
