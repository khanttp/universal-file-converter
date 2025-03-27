import React from 'react';

function About() {
  return (
    <div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">About UniConvert</h2>
        <p className="text-gray-700 mb-4">
          UniConvert is a privacy-focused, easy-to-use one-stop solution for file conversions.
          All processing is done in your browser, ensuring your files remain private.
        </p>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2">Help &amp; FAQ</h3>
        <ul className="text-gray-700">
          <li>
            <strong>Q:</strong> What file types are supported?{' '}
            <strong>A:</strong> Most common file types.
          </li>
          <li>
            <strong>Q:</strong> Is my file safe?{' '}
            <strong>A:</strong> Yes, all conversions are done locally in your browser.
          </li>
          <li>
            <strong>Q:</strong> What is the file size limit?{' '}
            <strong>A:</strong> Currently, the limit is 50MB.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default About;
