"use client";

import { FC } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import Sidebar from "./sidebar";
import { UserButton } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

interface NavbarProps {}

const Navbar: FC<NavbarProps> = ({}) => {
  const { user } = useUser();
  const userId = user?.id;

  return (
    <div
      className=" flex justify-start items-center w-full md:p-4 p-2 min-h-20 bg-background 
    text-foreground fixed top-0 shadow-sm shadow-muted"
    >
      <Image src="/logo.svg" alt="logo" width={170} height={100} />
      <nav
        className="hidden  md:flex gap-x-6 justify-end items-center ml-auto bg-muted
       text-card-foreground rounded-md p-1"
      >
        <Link href={userId ? "/dashboard/spend-analysis" : "/sign-in"}>
          <Button variant={"ghost"} size={"sm"} className="px-4">
            Product
          </Button>
        </Link>
        {/* <Link href={userId ? 'https://detmo.in/#talk-to-us' : 'https://detmo.in/#talk-to-us'}>
					<Button variant={'ghost'} size={'sm'} className='px-4'>
						Contact Us
					</Button>
				</Link> */}
        <Link href="/pricing">
          <Button variant={"ghost"} size={"sm"} className="px-4">
            Pricing
          </Button>
        </Link>
        {!userId ? (
          <Link href="/sign-in">
            <Button variant={"ghost"} size={"sm"} className="px-4">
              Login
            </Button>
          </Link>
        ) : (
          <UserButton />
        )}
        {!userId ? (
          <Link href="/sign-up">
            <Button size="lg"> Start Free Trial</Button>
          </Link>
        ) : (
          <Link href="/dashboard/spend-analysis">
            <Button size="lg"> Dashboard</Button>
          </Link>
        )}
      </nav>
      <nav
        className="flex md:hidden gap-x-6 justify-end items-center ml-auto bg-muted
       text-card-foreground rounded-md p-1"
      >
        {!userId ? (
          <Link href="/sign-in">
            <Button variant={"ghost"} size={"sm"} className="px-4">
              Log in
            </Button>
          </Link>
        ) : (
          <UserButton />
        )}
        <Sidebar userId={userId} />
      </nav>
    </div>
  );
};

export default Navbar;
