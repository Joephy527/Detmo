// /api/spend-analysis
import {
  cardData,
  searchProjects,
  spendingByCommodity,
  spendingByMonth,
  topSuppliersSpends,
  spendingByLocation,
  spendingBySuppliers,
} from "@/data/spend-analysis";
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    cardData,
    searchProjects,
    spendingByCommodity,
    spendingByMonth,
    topSuppliersSpends,
    spendingByLocation,
    spendingBySuppliers,
  });
}
