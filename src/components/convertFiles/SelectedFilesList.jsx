{/*
  SelectedFilesList.jsx
  ---------------------
  This component displays the list of files the user has selected for conversion.
  It shows each file’s name along with a Remove button so users can remove files before converting.
  Additionally, it includes an "Add More Files" button that, when clicked, calls a callback
  passed via props (onAddMoreFiles) to allow the user to add more files.
*/}
import React from 'react';
import PropTypes from 'prop-types';

const SelectedFilesList = ({ files, onRemoveFile, onAddMoreFiles }) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2 text-white">Selected Files</h3>
      <div className="max-h-48 overflow-y-auto border border-gray-700 rounded p-2">
        <ul>
          {files.map((file, index) => (
            <li key={index} className="flex items-center justify-between bg-[#16191A] p-2 rounded mb-2">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-[#A8A298] mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 3h10l3 3v12a2 2 0 01-2 2H6a2 2 0 01-2-2V3z"
                  />
                </svg>
                <span className="text-[#938E86]">{file.name}</span>
              </div>
              <button
                className="bg-red-500 text-white px-2 py-1 rounded"
                onClick={() => onRemoveFile(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-2 text-center">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 rounded"
          onClick={onAddMoreFiles}
        >
          Add More Files
        </button>
      </div>
    </div>
  );
};

SelectedFilesList.propTypes = {
  files: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  onAddMoreFiles: PropTypes.func,
};

export default SelectedFilesList;
