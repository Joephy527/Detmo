'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { VideoIcon } from '@radix-ui/react-icons'

interface ScrollButtonProps {
	targetId: string
	label: string
}

const ScrollButton: React.FC<ScrollButtonProps> = ({ targetId, label }) => {
	const scrollToTarget = () => {
		const element = document.getElementById(targetId)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' })
		}
	}

	return (
		<>
			<Button size='lg' variant='outline' onClick={scrollToTarget}>
				<VideoIcon className='w-5 h-5 mr-3' />
				{label}
			</Button>
		</>
	)
}

export default ScrollButton
