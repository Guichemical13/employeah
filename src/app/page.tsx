import { ContactSection } from "@/components/contactSection";
import { FooterPublic } from "@/components/footerPublic";
import { HeaderPublic } from "@/components/headerPublic";
import { HeroSection } from "@/components/heroSection";
import { RewardsSection } from "@/components/rewardsSection";
import { TestimonialsSection } from "@/components/testimonialsNew";

export default function Home() {
  return (
    <>
      <HeaderPublic />
      <HeroSection />
      <RewardsSection />
      <TestimonialsSection />
      <ContactSection />
      <FooterPublic />
    </>
  );
}
