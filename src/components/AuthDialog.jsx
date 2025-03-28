import React from "react";

const AuthDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
      <div className="bg-[#16191A] text-[#938E86] rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-white">Login / Signup</h2>
        <p className="mb-4">
          The Login and Sign Up functionality will be available soon.
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDialog;
