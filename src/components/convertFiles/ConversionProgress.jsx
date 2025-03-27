
{/*
  ConversionProgress.jsx
  ----------------------
  This component displays a real-time progress bar during file conversion.
  It shows the name of the file currently being converted and indicates the number of
  files processed out of the total.
*/}


import React from 'react';
import PropTypes from 'prop-types';

const ConversionProgress = ({ currentFileName, progress, filesDone, totalFiles }) => {
  return (
    <div className="mt-4 text-center">
      <p className="mb-2 text-gray-700">
        Converted: <strong>{currentFileName}</strong>
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
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