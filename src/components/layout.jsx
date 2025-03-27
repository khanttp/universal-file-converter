import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="w-full max-w-screen-xl mx-auto px-4 pt-24 pb-8">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
