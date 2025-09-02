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
} from "@chakra-ui/react";
import { CheckIcon } from "../icons/Icons";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

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
  const router = useRouter();
  const searchParams = useSearchParams();

  const userId = searchParams.get("user_id") ?? "";
  const next = searchParams.get("next") ?? "/dashboard/spend-analysis";

  const [loading, setLoading] = useState(false);
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");
  const { getToken } = useAuth();
  const { user, isSignedIn } = useUser();

  const [isFetchingUser, setIsFetchingUser] = useState(false);

  useEffect(() => {
    if (userId) {
      const fetchBeneficiary = async () => {
        setIsFetchingUser(true);
        try {
          const token = await getToken();
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users?user_id=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (response.ok) {
            const data = await response.json();

            if (data.items[0]?.Email) {
              setBeneficiaryEmail(data.items[0].Email);
            } else {
              toast.error("User email not found in response", {
                duration: 10000,
              });
            }
          } else {
            throw new Error("Failed to fetch beneficiary");
          }
        } catch (error) {
          toast.error("Failed to load user details", {
            duration: 10000,
            position: "top-center",
          });
          console.error("Failed to fetch beneficiary:", error);
        } finally {
          setIsFetchingUser(false);
        }
      };
      fetchBeneficiary();
    }
  }, [userId, getToken]);

  const handlePayment = async () => {
    setLoading(true);
    const paymentToast = toast.loading("Processing payment...");

    try {
      const token = await getToken();
      // Create payment via backend API
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            beneficiary_id: userId || user?.id,
            amount: 10.0,
            currency: "INR",
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Payment creation failed");
      }

      const jsonData = await response.json();
      const data = jsonData.subscription;
      toast.success("Redirecting to payment...", {
        id: paymentToast,
        duration: 10000,
      });

      // window.open(jsonData.payment_page_url, "_blank", "noopener,noreferrer");

      // Initialize Razorpay payment
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          // amount: data?.amount || 100,
          currency: jsonData?.currency || "INR",
          name: "Detmo",
          description: "Monthly Subscription",
          image: "/logo.svg",
          subscription_id: data.RazorpaySubscriptionID,
          handler: function (response: any) {
            toast.success(
              `Payment successful. Please wait for 5 minutes for it to take effect. Payment ID: ${response.razorpay_payment_id}`,
              { duration: 10000 },
            );

            router.push(next);
          },
          prefill: {
            name: user?.fullName || "",
            email: user?.primaryEmailAddress?.emailAddress || "",
          },
          notes: {
            beneficiary_id: userId || user?.id,
          },
          modal: {
            ondismiss: () =>
              toast.error("Payment window closed", {
                duration: 10000,
              }),
            escape: false, // Prevent closing by ESC key
          },
          /* theme: {
            color: "#3399cc",
          }, */
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          if (
            response.error.description.includes(
              "Beneficiary already has an active subscription",
            )
          ) {
            toast.success(`Subscription already paid for!`, {
              duration: 10000,
            });
          }
          toast.error(`Payment failed: ${response.error.description}`, {
            duration: 10000,
          });
        });
        rzp.open();
      } else {
        throw new Error("Payment system not available");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed", {
        id: paymentToast,
        duration: 10000,
      });
      console.error("Payment error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box mx="6" as="section">
      {/* Beneficiary notice */}

      <Box
        maxW="994px"
        margin="auto"
        mt="-40"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)"
        textAlign="center"
      >
        <Flex direction={["column", "column", "row"]}>
          <Box bg="#F0EAFB" p={["28px", "60px", "60px"]}>
            {userId && (
              <Text fontSize="xl" fontWeight="medium">
                {isFetchingUser
                  ? "Loading user details..."
                  : beneficiaryEmail
                    ? `Paying for user: ${beneficiaryEmail}`
                    : beneficiaryEmail}
              </Text>
            )}
            <Text fontSize="xl" fontWeight="extrabold">
              Full-access
            </Text>
            <Heading as="h3" fontSize={["5xl", "5xl", "6xl"]} mt="4">
              $39 or ₹3397
            </Heading>
            <Text color="gray.900" fontSize="lg" fontWeight="medium" mt="2">
              per user per month
            </Text>
            <Button
              colorScheme="purple"
              size="lg"
              w={["auto", "282px", "282px"]}
              mt="6"
              onClick={handlePayment}
              isLoading={loading}
              loadingText="Processing..."
              disabled={!isSignedIn}
            >
              Get Started
            </Button>
            <Link href="/">
              <Button
                colorScheme="grey"
                size="lg"
                w={["auto", "282px", "282px"]}
                mt="0"
                textColor={"black"}
              >
                Back to home
              </Button>
            </Link>
          </Box>

          <Box p={["32px", "32px", "60px"]} fontSize="lg" bg="white">
            <Text textAlign="left">
              Access these features when you get this pricing package for your
              business.
            </Text>
            <Stack as="ul" spacing="5" pt="6">
              <ListItem>Spend analysis and dashboard</ListItem>
              <ListItem>Sourcing Project Management with Kanban view</ListItem>
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
