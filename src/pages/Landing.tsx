import React from 'react';
import Header from '../components/landing/Header';
import HeroSection from '../components/landing/HeroSection';
import SocialProofSection from '../components/landing/SocialProofSection';
import ProblemSection from '../components/landing/ProblemSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import MockReportSection from '../components/landing/MockReportSection';
import FaqSection from '../components/landing/FaqSection';
import BottomCtaSection from '../components/landing/BottomCtaSection';
import FooterSection from '../components/landing/FooterSection';

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-black text-white font-body overflow-x-hidden selection:bg-white selection:text-black" data-mode="connect">
      {/* Fixed Background Video Logic */}
      <div className="fixed inset-0 w-full h-full z-0">
        <video 
          autoPlay 
          className="absolute w-full h-full object-cover" 
          loop 
          muted 
          playsInline
        >
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260217_030345_246c0224-10a4-422c-b324-070b7c0eceda.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 w-full">
        <Header />
        <HeroSection />
        <SocialProofSection />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorksSection />
        <MockReportSection />
        <FaqSection />
        <BottomCtaSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default Landing;
