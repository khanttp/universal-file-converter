import React from 'react';

function Footer() {
  return (
    <footer className="bg-[#16191A] shadow mt-8 w-full py-4 text-center">
      <p className="text-[#938E86]">
        &copy; {new Date().getFullYear()} FileConverter. All rights reserved.
      </p>
      <div className="mt-2 text-blue-500">
        <a href="/privacy" className="mx-2 hover:text-blue-600">
          Privacy Policy
        </a>
        <a href="/terms" className="mx-2 hover:text-blue-600">
          Terms
        </a>
        <a
          href="https://github.com/yourusername/uniconvert"
          className="mx-2 hover:text-blue-500"
        >
          GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
