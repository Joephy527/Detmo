import {
    Box,
    Button,
    Flex,
    Heading,
    HStack,
    Icon,
    Link,
    Stack,
    StackProps,
    Text,
} from '@chakra-ui/react';
import { CheckIcon } from '../icons/Icons';
import { useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Import Clerk's useUser hook
import { createPayment, updatePayment } from '@/actions/payment';

export const ListItem = (props: StackProps) => {
    const { children, ...rest } = props;
    return (
        <HStack as="li" spacing="5" {...rest} align="flex-start">
            <Icon as={CheckIcon} w="22px" h="22px" flexShrink={0} />
            <Text textAlign="left">{children}</Text>
        </HStack>
    );
};

export function Pricing() {
    const [loading, setLoading] = useState(false);
    const { user } = useUser(); // Get user info from Clerk

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Step 1: Create an order via backend API
            const response = await createPayment();

            const { order, billing_id } = response!;

            // Step 2: Check if Razorpay script is loaded
            if (typeof window !== 'undefined' && (window as any).Razorpay) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
                    amount: order.amount, // Amount in paise from Razorpay order
                    currency: order.currency,
                    name: 'detmo',
                    description: 'Full-access Subscription',
                    image: '/logo.svg',
                    order_id: order.id, // This is the order ID returned from Razorpay
                    handler: async function (response: any) {
                        alert(
                            `Payment successful! Payment ID: ${response.razorpay_payment_id}`
                        );

                        // Step 3: Update payment status in the backend using PUT
                        const updateResponse = await updatePayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (updateResponse?.success) {
                            alert(
                                'Payment verified and status updated successfully!'
                            );
                        } else {
                            console.error('Failed to verify payment.');
                        }
                    },
                    prefill: {
                        name: user?.fullName || '', // Dynamically fill user name from Clerk
                        email: user?.primaryEmailAddress?.emailAddress || '', // Dynamically fill user email from Clerk
                        contact: user?.phoneNumbers || '9999999999', // Dynamically fill user phone number from Clerk
                    },
                    notes: {
                        address: 'Corporate Office',
                    },
                    theme: {
                        color: '#3399cc',
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                alert('Razorpay script failed to load.');
            }
        } catch (error) {
            console.error('Error creating order:', error);
        }

        setLoading(false);
    };

    return (
        <Box mx="6" as="section">
            <Box
                maxW="994px"
                margin="auto"
                mt="-40"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)"
                textAlign="center"
            >
                <Flex direction={['column', 'column', 'row']}>
                    <Box bg="#F0EAFB" p={['28px', '60px', '60px']}>
                        <Text fontSize="xl" fontWeight="extrabold">
                            Full-access
                        </Text>
                        <Heading
                            as="h3"
                            fontSize={['5xl', '5xl', '6xl']}
                            mt="4"
                        >
                            $39 or ₹3199
                        </Heading>
                        <Text
                            color="gray.900"
                            fontSize="lg"
                            fontWeight="medium"
                            mt="2"
                        >
                            per user per month
                        </Text>
                        <Button
                            colorScheme="purple"
                            size="lg"
                            w={['auto', '282px', '282px']}
                            mt="6"
                            onClick={handlePayment}
                            isLoading={loading}
                        >
                            Get Started
                        </Button>
                        <Link href="/">
                            <Button
                                colorScheme="grey"
                                size="lg"
                                w={['auto', '282px', '282px']}
                                mt="0"
                                textColor={'black'}
                            >
                                Back to home
                            </Button>
                        </Link>
                    </Box>

                    <Box p={['32px', '32px', '60px']} fontSize="lg" bg="white">
                        <Text textAlign="left">
                            Access these features when you get this pricing
                            package for your business.
                        </Text>
                        <Stack as="ul" spacing="5" pt="6">
                            <ListItem>Spend analysis and dashboard</ListItem>
                            <ListItem>
                                Sourcing Project Management with Kanban view
                            </ListItem>
                            <ListItem>Supplier Evaluation tool</ListItem>
                            <ListItem>Supplier database available</ListItem>
                            <ListItem>International platform API</ListItem>
                        </Stack>
                    </Box>
                </Flex>
            </Box>
        </Box>
    );
}
