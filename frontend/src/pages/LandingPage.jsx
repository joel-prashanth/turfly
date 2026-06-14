import FeaturedTurfsSection from "../components/sections/FeaturedTurfsSection";
import HeroSection from "../components/sections/HeroSection";
import SportsCategoriesSection from "../components/sections/SportsCategoriesSection";
import WhyChooseSection from "../components/sections/WhyChooseSection";

function LandingPage() {
  return (
    <main>
      <HeroSection />
      <SportsCategoriesSection />
      <FeaturedTurfsSection />
      <WhyChooseSection />
    </main>
  );
}

export default LandingPage;