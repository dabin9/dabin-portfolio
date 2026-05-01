import Hero from "@/components/Hero";
import About from "@/components/About";
import SelectedWork from "@/components/SelectedWork";
import SkillsMarquee from "@/components/SkillsMarquee";
import TistoryBlog from "@/components/TistoryBlog";
import ContactCta from "@/components/ContactCta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <SelectedWork />
      <SkillsMarquee />
      <TistoryBlog />
      <ContactCta />
    </>
  );
}
