'use client';
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

interface Props {}

const Tabmenu: FC<Props> = ({}) => {
	const pathname = usePathname();

	return (
		<div className="border-b-[1px] p-5 py-4 flex items-center gap-5 md:gap-10 lg:gap-16">
			<Link
				href="/dashboard/settings"
				className={cn(
					"flex items-center py-2 text-muted-foreground/70 transition-all hover:text-primary text-[16px]",
					pathname === "/dashboard/settings" &&
						"text-primary text-black font-[500] border-b-primary border-b-[2px]"
				)}
			>
				General
			</Link>
			<Link
				href="/dashboard/settings/users"
				className={cn(
					"flex items-center py-2 text-muted-foreground/70 transition-all hover:text-primary text-[16px]",
					pathname === "/dashboard/settings/users" &&
						"text-primary text-black font-[500] border-b-primary border-b-[2px]"
				)}
			>
				Users
			</Link>

			<Link
				href="/dashboard/settings/billing"
				className={cn(
					"flex items-center py-2 text-muted-foreground/70 transition-all hover:text-primary text-[16px]",
					pathname === "/dashboard/settings/billing" &&
						"text-primary text-black font-[500] border-b-primary border-b-[2px]"
				)}
			>
				Billing
			</Link>
			<Link
				href="/dashboard/settings/refer"
				className={cn(
					"flex items-center py-2 text-muted-foreground/70 transition-all hover:text-primary text-[16px]",
					pathname === "/dashboard/settings/refer" &&
						"text-primary text-black font-[500] border-b-primary border-b-[2px]"
				)}
			>
				Refer
			</Link>
		</div>
	);
};




export default Tabmenu