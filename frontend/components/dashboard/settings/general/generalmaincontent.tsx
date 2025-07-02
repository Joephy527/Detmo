"use client";
import { FC, use } from "react";

import { CompanyDetailsType, UserType } from "@/lib/types";
import EditField from "./edit-field";
import DeleteCompany from "./delete-company";
import { useUser } from "@clerk/nextjs";

interface Props {
  company_details_promise: Promise<CompanyDetailsType | null>;
}

const GeneralSettings: FC<Props> = ({ company_details_promise }) => {
  const { user } = useUser();

  const role = user?.publicMetadata.role as string;
  const userRole = role.includes("user") ? "user" : "admin";

  const company_details = use(company_details_promise);
  if (!company_details) return;

  return (
    <div className="p-4 lg:p-7 lg:lg:px-10 xl:px-20  max-w-[1000px]">
      <div className="mb-10">
        <h1 className="my-4 mb-7 text-[23px] font-[700]">Contact Info</h1>

        <EditField
          role={userRole ?? "user"}
          label="Company display name"
          fieldName="DisplayName"
          value={company_details.DisplayName}
          company_details={company_details}
          dialogTitle="Edit company display name"
          fieldLabel="Name"
          placeholder="Enter company display name"
          minLength={2}
          minLengthMessage="Name must be at least 2 characters"
        />
        <EditField
          role={userRole ?? "user"}
          label="Phone number"
          fieldName="PhoneNumber"
          value={company_details.PhoneNumber}
          company_details={company_details}
          dialogTitle="Edit phone number"
          fieldLabel="Phone number"
          placeholder="Enter phone number"
        />
        <EditField
          role={userRole ?? "user"}
          label="Email"
          fieldName="Email"
          value={company_details.Email}
          company_details={company_details}
          dialogTitle="Edit email"
          fieldLabel="Email"
          placeholder="Enter email"
          fieldType="email"
        />

        <EditField
          role={userRole ?? "user"}
          label="Currency"
          fieldName="Currency"
          value={company_details.Currency.Currency}
          company_details={company_details}
          dialogTitle="Edit currency"
          fieldLabel="Currency"
          placeholder="Enter currency"
        />
      </div>
      <div className="mb-10">
        <h1 className="my-4 mb-7 text-[23px] font-[700]">Registration Info</h1>
        <EditField
          role={userRole ?? "user"}
          label="Legal name"
          fieldName="LegalName"
          value={company_details.LegalName}
          company_details={company_details}
          dialogTitle="Edit legal name"
          fieldLabel="Legal name"
          placeholder="Enter legal name"
        />
        <EditField
          role={userRole ?? "user"}
          label="Registration number"
          fieldName="RegistrationNumber"
          value={company_details.RegistrationNumber}
          company_details={company_details}
          dialogTitle="Edit registration number"
          fieldLabel="Registration number"
          placeholder="Enter registration number"
        />
        <EditField
          role={userRole ?? "user"}
          label="VAT number"
          fieldName="VatNumber"
          value={company_details.VatNumber}
          company_details={company_details}
          dialogTitle="Edit VAT number"
          fieldLabel="VAT number"
          placeholder="Enter VAT number"
        />
      </div>

      <div className="mb-10">
        <h1 className="my-4 mb-7 text-[23px] font-[700]">Official Address</h1>
        <EditField
          role={userRole ?? "user"}
          label="Address"
          fieldName="Address"
          value={company_details.Address}
          company_details={company_details}
          dialogTitle="Edit address"
          fieldLabel="Address"
          placeholder="Enter address"
        />
        <EditField
          role={userRole ?? "user"}
          label="State"
          fieldName="City"
          value={company_details.City}
          company_details={company_details}
          dialogTitle="Edit state"
          fieldLabel="State"
          placeholder="Enter state"
        />
        <EditField
          role={userRole ?? "user"}
          label="City"
          fieldName="City"
          value={company_details.City}
          company_details={company_details}
          dialogTitle="Edit city"
          fieldLabel="City"
          placeholder="Enter city"
        />
        <EditField
          role={userRole ?? "user"}
          label="Country"
          fieldName="Country"
          value={company_details.Country}
          company_details={company_details}
          dialogTitle="Edit country"
          fieldLabel="Country"
          placeholder="Enter country"
        />
        <EditField
          role={userRole ?? "user"}
          label="Zip"
          fieldName="Zip"
          value={company_details.Zip}
          company_details={company_details}
          dialogTitle="Edit zip"
          fieldLabel="Zip"
          placeholder="Enter zip"
        />
      </div>
      {userRole?.toLowerCase().includes("admin") && (
        <DeleteCompany company_id={company_details.CompanyDetailsID ?? ""} />
      )}
    </div>
  );
};

export default GeneralSettings;
