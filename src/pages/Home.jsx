import React from 'react';
import FileConverter from '../components/convertFiles/Convert';
import ErrorBoundary from '../components/ErrorBoundary'

const Home = () => (
  <div className="flex justify-center w-full">
    <div className="w-full max-w-5xl mx-auto px-4 pt-24">
      <section className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-4">
          Convert Any File—Quickly &amp; Privately
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Secure, browser-based conversions without uploads or sign-ups.
        </p>
        <a

          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Convert File Now
        </a>
      </section>
      <section id="converter" className="flex justify-center">
        <ErrorBoundary>
          <FileConverter />
        </ErrorBoundary>
      </section>
    </div>
  </div>
);

export default Home;
