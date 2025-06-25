import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function Page() {
	return (
		<div>
			<div className="mx-auto flex justify-center mb-5">
				<Link href={"/"} className={buttonVariants({ variant: "default" })}>
					<MoveLeft strokeWidth={1.5} size={16}  className="mr-2"/>
					Return to home page
				</Link>
			</div>

			<SignIn path="/sign-in"/>
		</div>
	);
}
