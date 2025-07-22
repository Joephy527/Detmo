"use client";

import { Header } from "./components/Header";
import { Pricing } from "./components/PricingSub";
import { Features } from "./components/Features";

export default function Home() {
  return (
    <div>
      <Header />
      <Pricing />
      <Features />
    </div>
  );
}
