import { ContactSection } from "@/components/contactSection";
import { FooterPublic } from "@/components/footerPublic";
import { HeaderPublic } from "@/components/headerPublic";
import { HeroSection } from "@/components/heroSection";
import { RewardsSection } from "@/components/rewardsSection";
import { ServicesSection } from "@/components/servicesSection";
import { TestimonialsSection } from "@/components/testimonialsSection";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeaderPublic />
      <HeroSection />
      <RewardsSection />
      <ServicesSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterPublic />
    </>
  );
}
