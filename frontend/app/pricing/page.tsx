"use client";

import { Header } from "./components/Header";
import { Pricing } from "./components/PricingSub";
import { Features } from "./components/Features";
import Navbar from "@/components/landing-components/navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      <Header />
      <Pricing />
      <Features />
    </div>
  );
}
