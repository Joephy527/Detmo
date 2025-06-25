import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    projects: [
      {
        name: "Project 1",
        description: "This is project 1",
      },
      {
        name: "Project 2",
        description: "This is project 2",
      },
    ],
  });
}
