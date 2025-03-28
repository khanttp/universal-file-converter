import React from 'react';
import PropTypes from 'prop-types';

const ConversionProgress = ({ currentFileName, progress, filesDone, totalFiles }) => {
  return (
    <div className="mt-4 text-center">
      <p className="mb-2 text-[#938E86]">
        Converted: <strong>{currentFileName}</strong>
      </p>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-[#938E86] mt-2">
        {filesDone}/{totalFiles} files done
      </p>
    </div>
  );
};

ConversionProgress.propTypes = {
  currentFileName: PropTypes.string.isRequired,
  progress: PropTypes.number.isRequired,
  filesDone: PropTypes.number.isRequired,
  totalFiles: PropTypes.number.isRequired,
};

export default ConversionProgress;
