{/*
  ErrorDisplay.jsx
  ----------------
  This component is responsible for displaying conversion error messages in a user-friendly way.
  It receives an array of error messages as props and renders each error on its own line.
*/}

import React from 'react';
import PropTypes from 'prop-types';

const ErrorDisplay = ({ errors }) => {
  if (!errors || errors.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-red-800 text-red-300 rounded">
      <p className="font-bold mb-2">Error:</p>
      <div className="ml-6">
        {errors.map((err, idx) => (
          <div key={idx}>{err}</div>
        ))}
      </div>
    </div>
  );
};

ErrorDisplay.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ErrorDisplay;
