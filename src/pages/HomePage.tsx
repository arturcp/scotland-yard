import '../landing.css';
import { SiteNav } from '@/components/landing/site-nav';
import { Hero } from '@/components/landing/hero';
import { QuoteBanner } from '@/components/landing/quote-banner';
import { HowItWorks } from '@/components/landing/how-it-works';
import { ArtOfDeduction } from '@/components/landing/art-of-deduction';
import { TransportSection } from '@/components/landing/transport-section';
import { WhyPlay } from '@/components/landing/why-play';
import { Ambiance } from '@/components/landing/ambiance';
import { CaseStats } from '@/components/landing/case-stats';
import { NewPlayers } from '@/components/landing/new-players';
import { FinalCta } from '@/components/landing/final-cta';
import { SiteFooter } from '@/components/landing/site-footer';

export default function HomePage() {
  return (
    <main className="relative bg-background">
      <SiteNav />
      <Hero />
      <QuoteBanner />
      <HowItWorks />
      <ArtOfDeduction />
      <TransportSection />
      <WhyPlay />
      <Ambiance />
      <CaseStats />
      <NewPlayers />
      <FinalCta />
      <SiteFooter />
    </main>
  );
}
