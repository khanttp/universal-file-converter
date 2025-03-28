{/*
  FormatSelector.jsx
  ------------------
  This component renders a dropdown menu that allows users to select the target conversion format.
  It displays only valid format options based on the type of the selected file(s)
  and communicates the chosen format back to the parent component.
*/}

import React from 'react';
import PropTypes from 'prop-types';

const FormatSelector = ({ selectedFormat, onChangeFormat, options, disabled }) => {
  return (
    <div className="mt-4">
      <label className="block text-[#938E86] mb-2">Convert to:</label>
      <select
        className={`w-full border border-gray-700 p-2 rounded mb-4 ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#16191A] text-white'}`}
        value={selectedFormat}
        onChange={(e) => onChangeFormat(e.target.value)}
        disabled={disabled}
      >
        <option value="">Select format</option>
        {options.map((format) => (
          <option key={format} value={format}>
            {format.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

FormatSelector.propTypes = {
  selectedFormat: PropTypes.string.isRequired,
  onChangeFormat: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool,
};

export default FormatSelector;
