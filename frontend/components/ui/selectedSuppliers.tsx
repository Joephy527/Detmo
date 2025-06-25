import React from 'react'

interface Customer {
	id: string
	name: string
	email: string
}

interface SelectedCustomerProps {
	customer: Customer | null
}

const SelectedCustomer: React.FC<SelectedCustomerProps> = ({ customer }) => {
	if (!customer) {
		return <div>Выберите заказчика из таблицы</div>
	}

	return (
		<div>
			<h2>Информация о заказчике</h2>
			<p>
				<strong>ID:</strong> {customer.id}
			</p>
			<p>
				<strong>Имя:</strong> {customer.name}
			</p>
		</div>
	)
}

export default SelectedCustomer
