'use client'

import { LandingHeader } from '@/components/landing-header'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works'
import { ShowcaseSection } from '@/components/landing/showcase-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { CtaSection } from '@/components/landing/cta-section'
import { SiteFooter } from '@/components/landing/site-footer'

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <LandingHeader />
            <main className="grow">
                <HeroSection />
                <FeaturesSection />
                <HowItWorksSection />
                <ShowcaseSection />
                <PricingSection />
                <CtaSection />
            </main>
            <SiteFooter />
        </div>
    )
}
