'use client'
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from '@/components/ui/sheet'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import Image from 'next/image'
import { FC } from 'react'
import { auth } from '@clerk/nextjs/server'
import { Button } from '../ui/button'
import Link from 'next/link'
import { Menu, Package, SettingsIcon, Headset, Gem } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
	userId?: string | null
}

const Sidebar: FC<SidebarProps> = ({ userId }) => {
	const pathname = usePathname()
	return (
		<>
			<Sheet>
				<SheetTrigger asChild>
					<Button variant={'outline'} size={'icon'}>
						<DotsHorizontalIcon />
					</Button>
				</SheetTrigger>
				<SheetContent side={'left'}>
					<div
						className={cn(	
							'border-r w-[280px] overflow-hidden left-0'
						)}
					>
						<div className='flex h-full max-h-screen flex-col gap-2'>
							<SheetHeader>
								<SheetTitle>
									<Image src='/logo.svg' alt='logo' width={170} height={100} />
								</SheetTitle>
								<div className='flex-1'>
									<nav className='grid items-start px-2 text-sm font-medium lg:px-4'>
										<Link
											href={userId ? '/dashboard/spend-analysis' : '/sign-in'}
											className={cn(
												'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
												pathname.includes('/dashboard/spend-analysis') && 'bg-muted text-primary'
											)}
										>
											<Package className='h-4 w-4' />
											<Button variant={'ghost'} size={'lg'} className='px-4'>
												Product
											</Button>
										</Link>
										<Link
											href={userId ? 'https://detmo.in/#talk-to-us' : 'https://detmo.in/#talk-to-us'}
											className={cn(
												'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
												pathname.includes('https://detmo.in/#talk-to-us') && 'bg-muted text-primary'
											)}
										>
											<Headset className='h-4 w-4' />
											<Button variant={'ghost'} size={'lg'} className='px-4'>
												Contact Us
											</Button>
										</Link>
										<Link
											href='/pricing'
											className={cn(
												'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
												pathname.includes('/pricing') && 'bg-muted text-primary'
											)}>
											<Gem className='h-4 w-4' />
											<Button variant={'ghost'} size={'lg'} className='px-4'>
												Pricing
											</Button>
										</Link>
									</nav>
								</div>
							</SheetHeader>
						</div>
					</div>
				</SheetContent>
			</Sheet>
		</>
	)
}

export default Sidebar
