import CTASection from "@/components/home/CTASection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HeroSection from "@/components/home/HeroSection";
import RolesSection from "@/components/home/RolesSection";

export default function Home() {
  return (
    <>
      <div className='container mx-auto'>
        <HeroSection />
        <RolesSection />
        <FeaturesSection />
      </div>
      <CTASection />
    </>
  );
}
