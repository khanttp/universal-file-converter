import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation(); // Get current page for active link highlighting

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      if (isOpen && !e.target.closest("#mobile-menu") && !e.target.closest("#menu-button")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [isOpen]);

  return (
    <nav className="bg-white shadow-md fixed w-full z-50">
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <Link to="/" className="text-2xl font-bold text-blue-500">
            FileConverter
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-6">
            {["Home", "Features", "Pricing", "About", "Help"].map((item) => {
              const path = item.toLowerCase();
              return (
                <Link
                  key={item}
                  to={`/${path === "home" ? "" : path}`}
                  className={`text-gray-700 hover:text-blue-500 transition ${
                    location.pathname === `/${path === "home" ? "" : path}` ? "border-b-2 border-blue-500" : ""
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          {/* Login/Signup button */}
          <div className="hidden md:block">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg shadow transition">
              Login / Signup
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            id="menu-button"
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`absolute top-16 left-0 w-full bg-white shadow-lg rounded-b-xl transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 max-h-96 py-4" : "opacity-0 max-h-0 overflow-hidden"
        }`}
      >
        <div className="px-6 space-y-3">
          {["Home", "Features", "Pricing", "About", "Help"].map((item) => {
            const path = item.toLowerCase();
            return (
              <Link
                key={item}
                to={`/${path === "home" ? "" : path}`}
                className="block text-gray-700 hover:text-blue-500 transition text-lg"
                onClick={() => setIsOpen(false)}
              >
                {item}
              </Link>
            );
          })}
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-lg mt-3 transition">
            Login / Signup
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
