'use client'
import React from 'react'
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { FormItem, FormLabel, Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
interface AddsupplierWithNameProps {
	name: string
}

const AddsupplierWithName: React.FC<AddsupplierWithNameProps> = ({ name }) => {
	const form = useForm()
	return (
		<div>
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant={'secondary'}
						size={'lg'}
						className='text-[14px] font-[600] text-[#121212] h-[44px] bg-[#EBEBEB]'
					>
						<span className='mr-2 border-[2px] rounded-[6px] p-0.5 border-black'>
							<Plus size={12} />
						</span>
						Add Supplier
					</Button>
				</DialogTrigger>

				<DialogContent className='w-full max-w-[700px] h-full overflow-y-scroll md:h-auto lg:overflow-auto'>
					<DialogHeader>
						<DialogTitle className='font-[500]'>Add Supplier</DialogTitle>
						<DialogDescription className='font-[500]'>
							Add a supplier and provide ratings for supplier attributes
						</DialogDescription>
					</DialogHeader>
					<Form {...form}>
						<form className='mt-4'>
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Supplier name
									</FormLabel>
									<Input
										placeholder='Enter your supplier name'
										className='bg-[#F6F6F6] rounded-[8px] h-[45px]'
										value={name}
									/>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Location
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose a location' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - Intercontinental'>
												1 - Intercontinental
											</SelectItem>
											<SelectItem value='2 - International'>
												2 - International
											</SelectItem>
											<SelectItem value='3 - Interstate/province'>
												3 - Interstate/province
											</SelectItem>
											<SelectItem value='4 - Intercounty'>
												4 - Intercounty
											</SelectItem>
											<SelectItem value='5 - Intercity'>
												5 - Intercity
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Company size
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose company size' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 50 - 100'>1 - 50 - 100</SelectItem>
											<SelectItem value='2 - 100 - 200'>
												2 - 100 - 200
											</SelectItem>
											<SelectItem value='3 - 200 - 300'>
												3 - 200 - 300
											</SelectItem>
											<SelectItem value='4 - 300 - 500'>
												4 - 300 - 500
											</SelectItem>
											<SelectItem value='5 - More than 500'>
												5 - More than 500
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Critical parts
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose critical parts' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 50 - 100'>1 - 50 - 100</SelectItem>
											<SelectItem value='2 - 100 - 200'>
												2 - 100 - 200
											</SelectItem>
											<SelectItem value='3 - 200 - 300'>
												3 - 200 - 300
											</SelectItem>
											<SelectItem value='4 - 300 - 500'>
												4 - 300 - 500
											</SelectItem>
											<SelectItem value='5 - More than 500'>
												5 - More than 500
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Non-critical parts
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose non critical parts' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 50 - 100'>1 - 50 - 100</SelectItem>
											<SelectItem value='2 - 100 - 200'>
												2 - 100 - 200
											</SelectItem>
											<SelectItem value='3 - 200 - 300'>
												3 - 200 - 300
											</SelectItem>
											<SelectItem value='4 - 300 - 500'>
												4 - 300 - 500
											</SelectItem>
											<SelectItem value='5 - More than 500'>
												5 - More than 500
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Revenue
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose revenue' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - $0-$1M'>1 - $0 - $1M</SelectItem>
											<SelectItem value='2 - $1M-$100M'>
												2 - $1M - $100M
											</SelectItem>
											<SelectItem value='3 - $100M-$500M'>
												3 - $100M - $500M
											</SelectItem>
											<SelectItem value='4 - $500M-$1B'>
												4 - $500M - $1B
											</SelectItem>
											<SelectItem value='5 - More than $1 billion'>
												5 - More than $1 billion
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										On-time delivery
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose on-time delivery' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 0 - 20%'>1 - 0% - 20%</SelectItem>
											<SelectItem value='2 - 20% - 40%'>
												2 - 20% - 40%
											</SelectItem>
											<SelectItem value='3 - 40% - 60%'>
												3 - 40% - 60%
											</SelectItem>
											<SelectItem value='4 - 60% - 80%'>
												4 - 60% - 80%
											</SelectItem>
											<SelectItem value='5 - 80% - 100%'>
												5 - 80% - 100%
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Part Acceptance rate
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose part acceptance rate' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 0 - 20%'>1 - 0% - 20%</SelectItem>
											<SelectItem value='2 - 20% - 40%'>
												2 - 20% - 40%
											</SelectItem>
											<SelectItem value='3 - 40% - 60%'>
												3 - 40% - 60%
											</SelectItem>
											<SelectItem value='4 - 60% - 80%'>
												4 - 60% - 80%
											</SelectItem>
											<SelectItem value='5 - 80% - 100%'>
												5 - 80% - 100%
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Order Fulfillment rate
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose fulfillment rate' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - 0 - 20%'>1 - 0% - 20%</SelectItem>
											<SelectItem value='2 - 20% - 40%'>
												2 - 20% - 40%
											</SelectItem>
											<SelectItem value='3 - 40% - 60%'>
												3 - 40% - 60%
											</SelectItem>
											<SelectItem value='4 - 60% - 80%'>
												4 - 60% - 80%
											</SelectItem>
											<SelectItem value='5 - 80% - 100%'>
												5 - 80% - 100%
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
								<FormItem>
									<FormLabel className='text-[14px] sm:text-[16px] font-[500]'>
										Average annual R&D spent by supplier
									</FormLabel>
									<Select>
										<SelectTrigger className='w-full h-[45px] bg-[#F6F6F6]'>
											<SelectValue placeholder='Choose average amount' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='1 - No R&D'>1 - No R&D</SelectItem>
											<SelectItem value='2 - 0 - 100k'>2 - 0 - 100k</SelectItem>
											<SelectItem value='3 - $100K - $1M'>
												3 - $100K - $1M
											</SelectItem>
											<SelectItem value='4 - $1M - $10M'>
												4 - $1M - $10M
											</SelectItem>
											<SelectItem value='5 - More than $10M'>
												5 - More than $10M
											</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							</div>
						</form>
					</Form>
					<div className='flex justify-center sm:justify-end gap-5 mt-5 mb-4'>
						{/* <DialogClose asChild>
           
          </DialogClose> */}
						<Button variant={'default'} className='font-[400] px-10'>
							Add supplier
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
export default AddsupplierWithName
