import Footer from "@/components/landing-components/footer";
import Navbar from "@/components/landing-components/navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <Navbar />
      <main className=" md:mx-auto pt-20">{children}</main>
      <Footer />
    </>
  );
}
