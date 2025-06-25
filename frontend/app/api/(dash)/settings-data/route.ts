import { NextResponse } from "next/server";

import {
  usersTabData,
  billingTabData,
  generalTabData,
  referTabData,
} from "@/data/setting";

export async function GET() {
  return NextResponse.json({
    generalTabData,
    usersTabData,
    billingTabData,
    referTabData,
  });
}
