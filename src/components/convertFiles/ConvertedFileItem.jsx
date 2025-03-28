import React from 'react';
import PropTypes from 'prop-types';

const ConvertedFileItem = ({ file, onDownload, onDelete }) => {
  return (
    <li className="flex items-center justify-between border border-gray-700 p-2 mb-2">
      <div>
        <span className="text-white">{file.fileName}</span>
        {file.downloaded && <span className="ml-2 text-green-500">(Downloaded)</span>}
      </div>
      <div className="flex space-x-2">
        <a
          href={file.downloadLink}
          download={file.fileName}
          onClick={() => onDownload(file.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
        >
          Download
        </a>
        <button
          onClick={() => onDelete(file.id)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
        >
          Delete
        </button>
      </div>
    </li>
  );
};

ConvertedFileItem.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.any.isRequired,
    fileName: PropTypes.string.isRequired,
    downloadLink: PropTypes.string.isRequired,
    downloaded: PropTypes.bool,
  }).isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ConvertedFileItem;
