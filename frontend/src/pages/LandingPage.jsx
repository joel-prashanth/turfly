import HeroSection from "../components/sections/HeroSection";
import SportsCategoriesSection from "../components/sections/SportsCategoriesSection";
import FeaturedTurfsSection from "../components/sections/FeaturedTurfsSection";
import WhyChooseSection from "../components/sections/WhyChooseSection";
import StatisticsSection from "../components/sections/StatisticsSection";
import CTASection from "../components/sections/CTASection";
import Footer from "../components/sections/Footer";

function LandingPage() {
  return (
    <main>
      <HeroSection />
      <SportsCategoriesSection />
      <FeaturedTurfsSection />
      <WhyChooseSection />
      <StatisticsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

export default LandingPage;