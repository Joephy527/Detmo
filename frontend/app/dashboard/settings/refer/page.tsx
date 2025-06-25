"use client";
import Tabmenu from "@/components/dashboard/settings/tabmenu";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

import { FC } from "react";

interface ReferProps {}

const Refer: FC<ReferProps> = ({}) => {
	const link = "https://detmo.co/ba3989723";

	const onCopy = async () => {
		await navigator.clipboard.writeText(link);
		toast.success("link copied");
	};

	return (
		<div className="bg-[#F6F6F6] p-4 lg:gap-6 lg:p-6 min-h-screen w-full">
			<Breadcrumb>
				<BreadcrumbList>
					<BreadcrumbItem>
						<BreadcrumbLink href="/" className="text-muted-foreground/70">
							Home
						</BreadcrumbLink>
					</BreadcrumbItem>
					<BreadcrumbSeparator />
					<BreadcrumbItem>
						<BreadcrumbPage className="text-muted-foreground/70">
							Settings
						</BreadcrumbPage>
						<BreadcrumbSeparator />
					</BreadcrumbItem>
					<BreadcrumbItem>
						<BreadcrumbPage className="text-[16px] font-[400]">
							Refer
						</BreadcrumbPage>
					</BreadcrumbItem>
				</BreadcrumbList>
			</Breadcrumb>

			<h1 className="mt-4 mb-7 text-[32px] font-[700]">Refer</h1>

			<main className="bg-white w-full h-full rounded-t-[12px] rounded-b-[12px]">
				<Tabmenu />

				<div className="flex justify-center pt-14 md:pt-0 md:items-center h-[550px]">
					<div className="">
						<Image
							src="/discount coupons.png"
							width={100}
							height={100}
							alt="discount"
							className="mx-auto"
						/>
						<p className="text-[14px] text-center text-[#8A8A8A]/90 font-[500] my-7">
							Refer your associates your below link
						</p>
						<div className="relative h-[45px]">
							<Input
								className="bg-[#F6F6F6] w-full sm:w-[400px] h-full"
								value={link}
							/>
							<Copy
								size={16}
								strokeWidth={1}
								className="text-primary absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
								onClick={onCopy}
							/>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default Refer;
