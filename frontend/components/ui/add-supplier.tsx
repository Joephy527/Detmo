import React from 'react'

const AirtableIframe: React.FC = () => {
	return (
		<iframe
			className='airtable-embed'
			src='https://airtable.com/embed/appqI5HIPZV3fnzwh/shrTL04DGDgcMdVnw?viewControls=on'
			frameBorder='0'
			width='100%'
			height='533'
			style={{ background: 'transparent', border: '1px solid #ccc' }}
		></iframe>
	)
}

export default AirtableIframe
