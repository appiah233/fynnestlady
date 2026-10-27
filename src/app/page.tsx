import { HeroSection } from "@/components/sections/hero";
import { ConcernGrid } from "@/components/sections/concern-grid";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { BrandExperience } from "@/components/sections/brand-experience";
import { DiscoverySection } from "@/components/sections/discovery";
import { WhyFynnestlady } from "@/components/sections/why-fynnestlady";
import { EducationSection } from "@/components/sections/education";
import { BrandCTA } from "@/components/sections/brand-cta";
import { NewsletterSection } from "@/components/sections/newsletter";

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <ConcernGrid />
      <FeaturedProducts />
      <BrandExperience />
      <DiscoverySection />
      <WhyFynnestlady />
      <EducationSection />
      <BrandCTA />
      <NewsletterSection />
    </div>
  );
}
