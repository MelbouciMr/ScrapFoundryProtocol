import styles from "./page.module.css";
import LandingHero from "@/components/landing/LandingHero";
import LandingLore from "@/components/landing/LandingLore";
import LandingRobotClasses from "@/components/landing/LandingRobotClasses";
import LandingBounties from "@/components/landing/LandingBounties";
import LandingStats from "@/components/landing/LandingStats";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className={styles.main + " scanlines"}>
      <LandingHero />
      <LandingLore />
      <LandingRobotClasses />
      <LandingBounties />
      <LandingStats />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
