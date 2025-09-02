"use client";
import React, { use, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DatePickerComponent from "@/components/ui/date-picker";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProject } from "@/actions/projects";
import toast from "react-hot-toast";
import { ProjectType } from "@/lib/types";
import {
  searchParamOption,
  searchParamsProject,
} from "../spend-analysis-comp/search-params";
import { useQueryStates } from "nuqs";

export default function Createprojectform({
  project_id,
  project_promise,
}: {
  project_id: string;
  project_promise: Promise<{ items: ProjectType[]; total: number } | null>;
}) {
  const [{ startDate, endDate }, setParams] = useQueryStates(
    searchParamsProject,
    searchParamOption,
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const project = use(project_promise)?.items[0];

  React.useEffect(() => {
    if (project?.StartDate) {
      setParams((prev) => ({
        ...prev,
        startDate: project.StartDate,
      }));
    }

    if (project?.EndDate) {
      setParams((prev) => ({
        ...prev,
        endDate: project.EndDate,
      }));
    }
  }, [project, setParams]);

  const router = useRouter();
  const [sourcingTeam, setSourcingTeam] = useState(false);
  const formSchema = z.object({
    Name: z.string().min(1, {
      message: "Project name must be at least 1 character.",
    }),
    Objective: z.string().min(1, {
      message: "Project objective must be at least 1 character.",
    }),
    ProjectType: z.string().min(1, {
      message: "Project type is required.",
    }),
    Saving: z.coerce.number().min(0),
    StartDate: z.string(),
    EndDate: z.string(),
    Phase: z.string().min(1, {
      message: "Phase is required.",
    }),
    Status: z.string().min(1, {
      message: "Status is required.",
    }),
    SourcingPmEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    ScmManagerEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    SelectedSupplierPmEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    BuyerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
    ProjectSponserEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    FinancePocEmail: z
      .string()
      .email("Invalid email")
      .optional()
      .or(z.literal("")),
    ProjectInterval: z.string(),
    CommodityName: z.string(),
    CommodityAffectedProduct: z.string(),
    CommodityPartNumber: z.string(),
    CommodityPartDescription: z.string(),
    Currency: z.string().default("USD"),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...project,
      CommodityAffectedProduct: project?.Commodity.AffectedProduct,
      CommodityPartNumber: project?.Commodity.PartNumber,
      CommodityPartDescription: project?.Commodity.PartDescription,
      CommodityName: project?.Commodity.CommodityName,
      StartDate: project?.StartDate,
      EndDate: project?.EndDate,
      Currency: project?.Currency,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    const toastId = toast.loading("Submitting...");

    const res = await updateProject(project_id, values);

    if (res?.success) {
      toast.success("Project updated successfully", { duration: 10000 });
    } else {
      toast.error("Something went wrong", { duration: 10000 });
    }

    setIsSubmitting(false);
    toast.dismiss(toastId);
    router.push(
      `/dashboard/projects/evaluate-suppliers?project_id=${project_id}`,
    );
  };

  if (!project) {
    router.push(`/dashboard/projects`);
  }
  return (
    <div>
      <div className="bg-white rounded-[20px] px-4 md:px-10 lg:px-[80px] py-[35px] mb-12 max-w-[1400px] mx-auto">
        <div>
          <div className="flex items-center gap-4">
            <span className="bg-[#8CDD58] h-[30px] rounded-t-[8px] rounded-b-[8px]  w-[13px]"></span>
            <h1 className="text-black text-[22px] md:text-[24px] font-[700]">
              Project information
            </h1>
          </div>
          <div className="mt-[27px]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Project name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your project name"
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Objective"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Project objective
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter your project objective"
                          className="bg-[#F6F6F6] rounded-[8px] h-[110px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="Saving"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Projected savings
                      </FormLabel>
                      <div className="relative h-[55px] w-full bg-white md:w-1/2">
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            placeholder="Savings"
                            className="bg-white rounded-[8px] h-full"
                          />
                        </FormControl>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <FormField
                            control={form.control}
                            name="Currency"
                            render={({ field: currencyField }) => (
                              <Select
                                onValueChange={currencyField.onChange}
                                defaultValue={currencyField.value}
                              >
                                <SelectTrigger className="w-[180px] h-[40px] bg-[#F6F6F6]">
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="USD">USD</SelectItem>
                                  <SelectItem value="EURO">EURO</SelectItem>
                                  <SelectItem value="INR">INR</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ProjectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Project type
                      </FormLabel>
                      <FormDescription className="text-[#8A8A8A]/90">
                        Only support for Diversify supplier at the moment.
                      </FormDescription>
                      <FormControl>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
                          <Button
                            type="button"
                            variant={"outline"}
                            className={`text-[#6D4EC2] border-[1px] border-[#6D4EC2] bg-[#F3EFFE] py-7 ${
                              field.value === "Diversify Supplier"
                                ? "ring-2 ring-[#6D4EC2]"
                                : ""
                            }`}
                            onClick={() => field.onChange("Diversify Supplier")}
                          >
                            Diversify Supplier
                          </Button>
                          <Button
                            type="button"
                            variant={"secondary"}
                            className="text-[#BFBFBF] py-7 bg-[hsl(0,0%,96%)]"
                            onClick={() => field.onChange("Dual Sourcing")}
                          >
                            Dual Sourcing
                          </Button>
                          <Button
                            type="button"
                            variant={"secondary"}
                            className="text-[#BFBFBF] py-7 bg-[hsl(0,0%,96%)]"
                            onClick={() =>
                              field.onChange("New Product Introduction")
                            }
                          >
                            New Product Introduction
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col sm:flex-row gap-3 md:gap-8">
                  <FormField
                    control={form.control}
                    name="StartDate"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                          Start date
                        </FormLabel>
                        <FormControl>
                          <DatePickerComponent
                            dateValue={startDate}
                            dateName="startDate"
                            onDateChange={(date) =>
                              field.onChange(date?.toISOString().split("T")[0])
                            }
                            placeholder="dd/mm/yyyy"
                            style="w-full h-[45px]"
                            isProject
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="EndDate"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                          End date
                        </FormLabel>
                        <FormControl>
                          <DatePickerComponent
                            dateValue={endDate}
                            dateName="endDate"
                            onDateChange={(date) =>
                              field.onChange(date?.toISOString().split("T")[0])
                            }
                            placeholder="dd/mm/yyyy"
                            style="w-full h-[45px]"
                            isProject
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-8">
                  <FormField
                    control={form.control}
                    name="Phase"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                          Phase
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                              <SelectValue placeholder="Choose a phase" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="Initiation">
                                Initiation
                              </SelectItem>
                              <SelectItem value="Planning">Planning</SelectItem>
                              <SelectItem value="Execution">
                                Execution
                              </SelectItem>
                              <SelectItem value="Control">Control</SelectItem>
                              <SelectItem value="Closure">Closure</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="Status"
                    render={({ field }) => (
                      <FormItem className="w-full sm:w-1/2">
                        <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                          Status
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-[45px] bg-[#F6F6F6]">
                              <SelectValue placeholder="Choose a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="yellow">Yellow</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <hr />

                <div className="flex items-center gap-4 mt-10">
                  <span className="bg-[#F26184] h-[30px] rounded-t-[8px] rounded-b-[8px]  w-[13px]"></span>
                  <h1 className="text-black text-[22px] md:text-[24px] font-[700]">
                    Part Details
                  </h1>
                </div>

                <FormField
                  control={form.control}
                  name="CommodityName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Commodity name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter commodity name"
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="CommodityAffectedProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Affected products
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter affected products"
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="CommodityPartNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Part no.
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter the part number"
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="CommodityPartDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                        Part description
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter part description"
                          className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <hr />

                <div className="flex items-center gap-4 mt-10">
                  <span className="bg-[#61CCF2] h-[30px] rounded-t-[8px] rounded-b-[8px]  w-[13px]"></span>
                  <h1 className="text-black text-[22px] md:text-[24px] font-[700]">
                    Sourcing Team
                  </h1>
                </div>

                {sourcingTeam && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-8">
                      <FormField
                        control={form.control}
                        name="SourcingPmEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              Sourcing PM
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ScmManagerEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              SCM manager
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-8">
                      <FormField
                        control={form.control}
                        name="SelectedSupplierPmEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              Selected supplier PM
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="BuyerEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              Buyer
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-8">
                      <FormField
                        control={form.control}
                        name="ProjectSponserEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              Project Sponsor
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="FinancePocEmail"
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-1/2">
                            <FormLabel className="text-[15px] sm:text-[16px] md:text-[17px] font-[700]">
                              Finance POC
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter email"
                                className="bg-[#F6F6F6] rounded-[8px] h-[45px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}

                {!sourcingTeam && (
                  <Button
                    variant={"secondary"}
                    size={"lg"}
                    className="text-[14px] font-[600] text-[#121212] h-[44px] bg-[#EBEBEB]"
                    onClick={() => setSourcingTeam(true)}
                  >
                    <span className="mr-2 border-[2px] rounded-[6px] p-0.5 border-black">
                      <Plus size={12} />
                    </span>
                    Add sourcing team
                  </Button>
                )}
                <div className="bg-white py-[25px] flex items-center flex-wrap justify-end gap-5 px-4 md:pr-6">
                  <Button
                    variant={"secondary"}
                    className="h-[38px] text-[14px] font-[500] px-10"
                    asChild
                  >
                    <Link href={"/dashboard/spend-analysis"}>Cancel</Link>
                  </Button>
                  <Button
                    variant={"outline"}
                    className="h-[38px] border-primary text-[14px] text-primary font-[500]"
                    disabled={isSubmitting}
                  >
                    Save as draft
                  </Button>
                  <Button
                    variant={"default"}
                    type="submit"
                    className="h-[38px] text-[14px] font-[500]"
                    disabled={isSubmitting}
                    // disabled
                  >
                    Evaluate Suppliers
                  </Button>
                  {/* <Link
                                        href={
                                            '/dashboard/projects/evaluate-suppliers'
                                        }
                                    >
                                    </Link> */}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
