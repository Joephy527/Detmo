'use server'

export const createPayment = async (): Promise<{ order: any, billing_id: string } | null> => {
    try {
        const response = await fetch(
            `${process.env.API_URL?.split('v1')[0]}create_order/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: 3199, // Amount in INR (Razorpay will convert it to paise)
                    currency: 'INR',
                    receipt: 'order_rcptid_11',
                    description: 'Full-access Subscription',
                    payment_plan: 'Monthly',
                    payment_method: 'Razorpay',
                }),
            }
        );

        const { order, billing_id } = await response.json();
        if (order && billing_id) {
            return { order, billing_id }
        }
        else throw new Error(response.statusText)
    } catch (error) {
        console.error(error);
    }
    return null
}

export const updatePayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
}: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}): Promise<{ success: boolean } | null> => {
    try {
        const updateResponse = await fetch(`${process.env.API_URL?.split('v1')[0]}/verify_payment/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                razorpay_order_id: razorpay_order_id,
                razorpay_payment_id: razorpay_payment_id,
                razorpay_signature: razorpay_signature,
            }),
        });

        if (updateResponse.ok) {
            return { success: true };
        } else {
            throw new Error(updateResponse.statusText)
        }
    } catch (error) {
        console.error(error);
    }
    return null
}