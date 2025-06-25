export type projectType = {

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
};
export type supplierEvaluationType = {
	id: string;
	name: string;
	location: string;
	company_size: string;
	critical_parts: string;
	non_critical_parts: string;
	revenue: string;
	on_time_delivery: string;
	supplier_health: string;
	order_fulfillment_rate: string;
	average_annual_rd: string;

};

export const suplierEvaluation: supplierEvaluationType[] = [
	{
		average_annual_rd: "1",
		company_size: "3",
		critical_parts: "2",
		id: "1",
		location: "1",
		name: "Supplier name",
		non_critical_parts: "3",
		on_time_delivery: "1",
		order_fulfillment_rate: "1",
		revenue: "2",
		supplier_health: "1",
	},
	{
		average_annual_rd: "1",
		company_size: "3",
		critical_parts: "2",
		id: "2",
		location: "1",
		name: "Supplier name",
		non_critical_parts: "2",
		on_time_delivery: "4",
		order_fulfillment_rate: "1",
		revenue: "2",
		supplier_health: "2",
	},
	{
		average_annual_rd: "1",
		company_size: "5",
		critical_parts: "2",
		id: "3",
		location: "1",
		name: "Supplier name",
		non_critical_parts: "3",
		on_time_delivery: "4",
		order_fulfillment_rate: "1",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "1",
		company_size: "2",
		critical_parts: "2",
		id: "4",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "2",
		on_time_delivery: "4",
		order_fulfillment_rate: "3",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "1",
		company_size: "2",
		critical_parts: "2",
		id: "5",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "2",
		on_time_delivery: "4",
		order_fulfillment_rate: "3",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "1",
		company_size: "2",
		critical_parts: "4",
		id: "6",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "5",
		on_time_delivery: "2",
		order_fulfillment_rate: "3",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "1",
		company_size: "2",
		critical_parts: "2",
		id: "7",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "5",
		on_time_delivery: "2",
		order_fulfillment_rate: "5",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "1",
		company_size: "2",
		critical_parts: "2",
		id: "8",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "2",
		on_time_delivery: "3",
		order_fulfillment_rate: "5",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "4",
		company_size: "3",
		critical_parts: "2",
		id: "9",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "1",
		on_time_delivery: "2",
		order_fulfillment_rate: "5",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "4",
		company_size: "3",
		critical_parts: "2",
		id: "10",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "1",
		on_time_delivery: "2",
		order_fulfillment_rate: "5",
		revenue: "2",
		supplier_health: "4",
	},
	{
		average_annual_rd: "4",
		company_size: "3",
		critical_parts: "2",
		id: "11",
		location: "2",
		name: "Supplier name",
		non_critical_parts: "1",
		on_time_delivery: "2",
		order_fulfillment_rate: "5",
		revenue: "2",
		supplier_health: "4",
	},


];
