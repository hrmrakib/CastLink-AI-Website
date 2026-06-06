import AboutSection from "@/components/home/AboutSection";
import CTASection from "@/components/home/CTASection";
import HeroSection from "@/components/home/HeroSection";
import PoolOfCastSection from "@/components/home/PoolOfCastSection";
import PowerfulFeature from "@/components/home/PowerfulFeature";
import RolesSection from "@/components/home/RolesSection";
import SafetySection from "@/components/home/SafetySection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PowerfulFeature />
      <RolesSection />
      <CTASection />
      <AboutSection />
      <SafetySection />
      <PoolOfCastSection />
    </>
  );
}
