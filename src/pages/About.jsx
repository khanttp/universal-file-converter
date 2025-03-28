import React from 'react';

function About() {
  return (
    <div className="p-4 bg-[#16191A] min-h-screen">
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">About FileConverter</h2>
        <p className="text-white mb-4">
          FileConverter is a privacy-focused, easy-to-use one-stop solution for file conversions.
          All processing is done in your browser, ensuring your files remain private.
        </p>
      </section>
      <section>
        <h3 className="text-xl font-semibold mb-2 text-white">Help &amp; FAQ</h3>
        <ul className="text-gray-300 space-y-4">
          <li>
            <p>
              <strong>Q:</strong> What file types are supported?
            </p>
            <p>
              <strong>A:</strong> We currently support common file types such as PNG, JPG, and WEBP for images.
              Support for additional types is coming soon.
            </p>
          </li>
          <li>
            <p>
              <strong>Q:</strong> Is my file safe?
            </p>
            <p>
              <strong>A:</strong> Yes, all conversions are performed locally in your browser, ensuring your files remain private.
            </p>
          </li>
          <li>
            <p>
              <strong>Q:</strong> What is the file size limit?
            </p>
            <p>
              <strong>A:</strong> Currently, the file size limit is 70 MB and 10 files per conversion.
            </p>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default About;
