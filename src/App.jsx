import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Help from './pages/Help';

const App = () => (
  <Router>
    <div className="min-h-screen flex flex-col items-center">
      <Navbar />
      <main className="flex-grow w-full px-4 pt-20 pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </main>
      <Footer />
    </div>
  </Router>
);

export default App;
