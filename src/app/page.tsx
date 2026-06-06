import AboutSection from "@/components/home/AboutSection";
import CTASection from "@/components/home/CTASection";
import HeroSection from "@/components/home/HeroSection";
import PowerfulFeature from "@/components/home/PowerfulFeature";
import RolesSection from "@/components/home/RolesSection";
import SafetySection from "@/components/home/SafetySection";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <HeroSection />
      <PowerfulFeature />
      <RolesSection />
      <CTASection />
      <AboutSection />
      <SafetySection />

      <div>
        <Image
          src='/join-pool.png'
          alt='hero-bg'
          width={0}
          height={0}
          sizes='100vw'
          style={{ width: "100%", height: "auto" }}
        />
      </div>
    </>
  );
}
