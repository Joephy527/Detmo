import Footer from "@/components/landing-components/footer";
import Navbar from "@/components/landing-components/navbar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <main className=" min-h-screen justify-center items-center flex ">
        {children}
      </main>
    </>
  );
}
