import React from 'react';
import Navbar from '../components/Landing/Navbar';
import HeroSection from '../components/Landing/HeroSection';
import Features from '../components/Landing/Features';
import CollaborationSection from '../components/Landing/CollaborationSection';
import FAQ from '../components/Landing/FAQ';
import Footer from '../components/Landing/Footer';

const LandingPage = ({ onLoginClick }) => {
  return (
    <div>
      {/* Pass the onLoginClick prop to Navbar */}
      <Navbar onLoginClick={onLoginClick} />
      <HeroSection />
      <Features />
      <CollaborationSection />
      <FAQ />
      <Footer />
    </div>
  );
};

export default LandingPage;
