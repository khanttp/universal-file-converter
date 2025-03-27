import React from 'react';

function Footer() {
  return (
    <footer className="bg-white shadow mt-8 w-full py-4 text-center text-gray-600">
      <p>&copy; {new Date().getFullYear()} FileConverter. All rights reserved.</p>
      <div className="mt-2">
        <a href="/privacy" className="mx-2 hover:text-blue-500">Privacy Policy</a>
        <a href="/terms" className="mx-2 hover:text-blue-500">Terms</a>
        <a href="https://github.com/yourusername/uniconvert" className="mx-2 hover:text-blue-500">GitHub</a>
      </div>
    </footer>
  );
}

export default Footer;
