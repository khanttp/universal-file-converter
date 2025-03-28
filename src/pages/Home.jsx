import React, { useRef } from 'react';
import FileConverter from '../components/convertFiles/Convert';
import ErrorBoundary from '../components/ErrorBoundary';

const Home = () => {
  const converterRef = useRef(null);

  const handleConvertNowClick = () => {
    if (converterRef.current && converterRef.current.openFileDialog) {
      converterRef.current.openFileDialog();
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-5xl mx-auto px-4 pt-24">
        <section className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            Convert Any File—Quickly &amp; Privately
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Secure, browser-based conversions without uploads or sign-ups.
          </p>
          <button
            onClick={handleConvertNowClick}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Convert File Now
          </button>
        </section>
        <section id="converter" className="flex justify-center">
          <ErrorBoundary>
            <FileConverter ref={converterRef} />
          </ErrorBoundary>
        </section>
      </div>
    </div>
  );
};

export default Home;
