
export type ProjectType = {
    SourcingProjectID: string;
    Name: string;
    Objective: string;
    Saving: number;
    ProjectType: string;
    StartDate: string;
    EndDate: string;
    Phase?: string;
    Status: 'red' | 'yellow' | 'green';
    SourcingPmEmail: string;
    ScmManagerEmail: string;
    SelectedSupplierPmEmail: string;
    BuyerEmail: string;
    ProjectSponserEmail: string;
    FinancePocEmail: string;
    ProjectInterval: string;
    CompanyDetailsID: string;
    Commodity: CommodityType;
    Currency?: string;
};

export type CreateProjectType = {
    Name: string,
    Objective: string,
    ProjectType: string,
    Saving: number,
    StartDate: string,
    EndDate: string,
    Phase: string,
    Status: string,
    SourcingPmEmail: string,
    ScmManagerEmail: string,
    SelectedSupplierPmEmail: string,
    BuyerEmail: string,
    ProjectSponserEmail: string,
    FinancePocEmail: string,
    ProjectInterval: string,
    CommodityName: string,
    CommodityAffectedProduct: string,
    CommodityPartNumber: string,
    CommodityPartDescription: string

}

export type CommodityType = {
    CommodityID: string;
    CommodityName: string;
    AffectedProduct: string;
    PartNumber: string;
    PartDescription: string;
}

export type UserType = {
    ClerkID: string;
    UserName: string;
    Email: string;
    Password: string;
    RoleID: string;
    CompanyDetailsID: string;
    Role?: string;
}

export type CompanyDetailsType = {
    CompanyDetailsID?: string;
    DisplayName: string;
    PhoneNumber: string;
    Email: string;
    LegalName: string;
    RegistrationNumber: string;
    VatNumber: string;
    Address: string;
    City: string;
    Country: string;
    Zip: string;
    Currency: {
        CurrencyID: string,
        Currency: string,
    }
}

export type CommentType = {
    CommentID: string,
    Comment: string,
    CommentDate: string,
    CompanyDetailsID: string,
    SourcingProjectID: string,
    ClerkID: string,
    User: {
        ClerkID: string;
        UserName: string;
    }
}

export type HeaderViewType = {
    company_id: string;
    total_spend: number;
    supplier_count: number;
    commodity_count: number;
    location_count: number;
    po_count: number;
}

export type SpendingBySupplierType = {
    'Company ID': string;
    VendorName: string;
    'Total Spend': number;
}

export type SpendingByMonthType = {
    'Company ID': string;
    'Month Year': string;
    'Total Spend': number;
}

export type SpendingByCommodityType = {
    CommodityName: string;
    CompanyDetailsID: string;
    ['Percentage of Total Spending']: number;
}

export type SpendingByLocationType = {
    'Company ID': string;
    VendorName: string;
    Country: string;
    'Total Spend': number;
}

export type SpendingByTopSupplierType = {
    'Company ID': string;
    CommodityName: string;
    MaterialNumber: string;
    VendorName: string;
    Location: string;
    TotalSpend: number;
}

export type SupplierEvaluationCreateType = {
    SupplierName: string;
    CompanySizeRank: number;
    CriticalPartsRank: number;
    NonCriticalPartsRank: number;
    RevenueRank: number;
    OnTimeDeliveryRank: number;
    SupplierHealthRank: number;
    AvgAnnualRAndDSpentRank: number;
    OrderFulfilmentRateRank: number;
    LocationRank: number;
}

export type SupplierEvaluationResponseType = SupplierEvaluationCreateType & {
    SupplierEvaluationID: string;
    RankingTotalResult: number;
    CompanyDetailsID: string;
    SourcingProjectID: string;
} 