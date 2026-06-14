import Section from "../ui/Section";
import SectionHeader from "../ui/SectionHeader";
import FeatureCard from "../ui/FeatureCard";

import { FEATURES } from "../../constants/features";

function WhyChooseSection() {
  return (
    <Section>
      <SectionHeader
        title="Built for Players. Designed for Every Game."
        subtitle="Turfly helps you discover, compare, and book premium sports venues with a fast, seamless experience."
      />

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {FEATURES.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Section>
  );
}

export default WhyChooseSection;
