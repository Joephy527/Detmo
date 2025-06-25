"use client";

import Image from "next/image";
import { FC, useState } from "react";
import { Button } from "../ui/button";
import {
  DiscordLogoIcon,
  GitHubLogoIcon,
  InstagramLogoIcon,
  LinkedInLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import Modal from "../landing-components/modal";

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  const [isTermsModalOpen, setTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [isRefundsModalOpen, setRefundsModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);

  const openTermsModal = () => setTermsModalOpen(true);
  const closeTermsModal = () => setTermsModalOpen(false);
  const openPrivacyModal = () => setPrivacyModalOpen(true);
  const closePrivacyModal = () => setPrivacyModalOpen(false);
  const openRefundsModal = () => setRefundsModalOpen(true);
  const closeRefundsModal = () => setRefundsModalOpen(false);
  const openContactModal = () => setContactModalOpen(true);
  const closeContactModal = () => setContactModalOpen(false);

  return (
    <footer className="bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:flex md:items-center md:justify-between">
          <Image src="/logo.svg" alt="logo" width={170} height={100} />

          <div className="flex mt-8 space-x-6 md:mt-0 md:hidden">
            {/* social accounts */}
            <a href="https://www.linkedin.com/company/detmo" target="_blank" rel="noopener noreferrer">
              <Button variant={"ghost"} size={"icon"}>
                <LinkedInLogoIcon className="w-5 h-5" />
              </Button>
            </a>
            <Button variant={"ghost"} size={"icon"}>
              <TwitterLogoIcon className="w-5 h-5" />
            </Button>
            <Button variant={"ghost"} size={"icon"}>
              <InstagramLogoIcon className="w-5 h-5" />
            </Button>
            <Button variant={"ghost"} size={"icon"}>
              <DiscordLogoIcon className="w-5 h-5" />
            </Button>
            <Button variant={"ghost"} size={"icon"}>
              <GitHubLogoIcon className="w-5 h-5" />
            </Button>
          </div>
          <div className="hidden md:flex space-x-6 mt-8 md:mt-0">
            {/* social accounts */}
            <a href="https://www.linkedin.com/company/detmo" target="_blank" rel="noopener noreferrer">
              <Button variant={"ghost"}>LinkedIn</Button>
            </a>
            <Button variant={"ghost"}>Twitter</Button>
            <Button variant={"ghost"}>Instagram</Button>
            <Button variant={"ghost"}>Discord</Button>
            <Button variant={"ghost"}>GitHub</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:flex md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:space-x-6 mt-8 md:mt-0">
            <button onClick={openTermsModal} className="text-base text-muted-foreground">
              Terms and Conditions
            </button>
            <button onClick={openPrivacyModal} className="text-base text-muted-foreground">
             Privacy Policy
            </button>
            <button onClick={openRefundsModal} className="text-base text-muted-foreground">
              Refunds/Cancellations
            </button>
            <button onClick={openContactModal} className="text-base text-muted-foreground">
              Contact Us
            </button>
            <Modal isOpen={isTermsModalOpen} onClose={closeTermsModal}>
              <h2 className="text-xl font-bold mb-2">Terms and Conditions</h2>
              <p className="text-base text-muted-foreground">
                Welcome to detmo! By accessing or using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully.
                <br/><br/>
                1. <strong>Acceptance of Terms</strong>: By using our website or services, you agree to these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
                <br/><br/>
                2. <strong>Use of Services</strong>: You agree to use our services only for lawful purposes and in accordance with these Terms and Conditions. You must not use our services in any way that causes harm to our business, our users, or any third party.
                <br/><br/>
                3. <strong>Intellectual Property</strong>: All content on our website, including text, graphics, logos, and images, is the property of detmo and is protected by intellectual property laws. You may not use any content without our express written permission.
                <br/><br/>
                4. <strong>User Conduct</strong>: You agree not to engage in any activity that interferes with or disrupts our services. You also agree not to attempt to gain unauthorized access to any part of our website or services.
                <br/><br/>
                5. <strong>Limitation of Liability</strong>: detmo will not be liable for any damages arising from the use or inability to use our services. This includes, but is not limited to, direct, indirect, incidental, punitive, and consequential damages.
                <br/><br/>
                6. <strong>Modification of Terms</strong>: We reserve the right to modify these Terms and Conditions at any time. Any changes will be posted on this page, and it is your responsibility to review these terms regularly.
                <br/><br/>
                7. <strong>Governing Law</strong>: These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising under these terms will be subject to the exclusive jurisdiction of the courts in India.
                <br/><br/>
                By using our services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </Modal>
            <Modal isOpen={isPrivacyModalOpen} onClose={closePrivacyModal}>
              <h2 className="text-xl font-bold mb-2">Privacy Policy</h2>
              <p className="text-base text-muted-foreground">
                1. <strong>Data Collection</strong>: We collect personal data such as name, email address, and contact information when you register or interact with our services. We also gather non-personal data like browsing behavior and device information to improve user experience.
                <br/><br/>
                2. <strong>Use of Data</strong>: Your personal data is used to provide and enhance our services, communicate with you, and ensure the security of our platform. We do not sell your personal data to third parties.
                <br/><br/>
                3. <strong>Data Protection</strong>: We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. Regular audits are conducted to ensure the integrity and confidentiality of your data.
                <br/><br/>
                4. <strong>Cookies and Tracking</strong>: detmo uses cookies and similar tracking technologies to monitor user activity and preferences. This helps us personalize your experience and improve our services. You can manage your cookie preferences through your browser settings.
                <br/><br/>
                5. <strong>Third-Party Services</strong>: We may share your data with trusted third-party service providers for purposes such as payment processing and analytics. These providers are obligated to maintain the confidentiality and security of your data.
                <br/><br/>
                6. <strong>User Rights</strong>: You have the right to access, update, or delete your personal data. You can also opt-out of certain data processing activities. To exercise these rights, please contact our support team.
                <br/><br/>
                7. <strong>Policy Updates</strong>: Our privacy policy may be updated periodically. We will notify you of any significant changes and provide the updated policy on our website. Continued use of our services constitutes acceptance of the revised policy.
                <br/><br/>
                8. <strong>Contact Information</strong>: If you have any questions or concerns about our privacy policy, please contact us at shikhar@detmo.in. Our support team is available to assist you with any inquiries.
              </p>
            </Modal>
            <Modal isOpen={isRefundsModalOpen} onClose={closeRefundsModal}>
              <h2 className="text-xl font-bold mb-2">Refunds/Cancellations</h2>
              <p className="text-base text-muted-foreground">
                Our refund and cancellation policy is designed to ensure customer satisfaction. Here are the details:
                <br/><br/>
                1. <strong>Eligibility</strong>: Refunds and cancellations are applicable within 5-7 working days of purchase.
                <br/><br/>
                2. <strong>Request Process</strong>: To request a refund or cancellation, please contact our support team with your order details.
                <br/><br/>
                3. <strong>Approval</strong>: Once your request is received, we will review and process it. Approved refunds will be credited to your original payment method within 5-7 working days.
                <br/><br/>
                4. <strong>Exclusions</strong>: Some products or services may be non-refundable. Please refer to the product/service description for specific terms.
                <br/><br/>
                If you have any questions about our refund and cancellation policy, please contact us at shikhar@detmo.in.
              </p>
            </Modal>
            <Modal isOpen={isContactModalOpen} onClose={closeContactModal}>
              <h2 className="text-xl font-bold mb-2 ">Contact Us</h2>
              <p className="text-base text-muted-foreground">
                If you need to get in touch with us, here are our contact details:
                <br/><br/>
                <strong>Phone</strong>: +91 63929 47410
                <br/>
                <strong>Email</strong>: shikhar@detmo.in
                <br/>
                <strong>Address</strong>: Ground Floor 01, Tower F1, Emaar The Views, sector 105, MOHALI, PUNJAB 140307, India
                <br/><br/>
                Our support team is available from 9 AM to 6 PM IST, Monday to Friday. We strive to respond to all inquiries within 24 hours.
              </p>
            </Modal>
          </div>
         
		  <div className="mt-8, ml-14">
          <p className="text-base text-muted-foreground">
            detmo Copyright © 2024. All rights reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
