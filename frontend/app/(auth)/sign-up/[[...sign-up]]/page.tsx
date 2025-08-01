import { buttonVariants } from "@/components/ui/button";
import { SignUp } from "@clerk/nextjs";
import { MoveLeft } from "lucide-react";
import Link from "next/link";

export default function Page({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const refCode = searchParams?.ref;

  return (
    <div>
      <div className="mx-auto flex justify-center mb-5">
        <Link href={"/"} className={buttonVariants({ variant: "default" })}>
          <MoveLeft strokeWidth={1.5} size={16} className="mr-2" />
          Return to home page
        </Link>
      </div>
      <SignUp
        path="/sign-up"
        unsafeMetadata={refCode ? { referralCode: refCode } : undefined}
        forceRedirectUrl="/?status=signed_up"
      />
    </div>
  );
}
