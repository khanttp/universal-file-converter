{/*
  FileDropZone.jsx
  ----------------
  This component renders the file upload area, allowing users to click to select files
  or drag and drop files for conversion. It provides visual feedback when files are dragged over.
*/}


import React from 'react';
import PropTypes from 'prop-types';

const FileDropZone = ({ onDropFiles, onClick, isDragging }) => {
  return (
    <div
      onClick={onClick}
      onDrop={onDropFiles}
      onDragOver={(e) => { e.preventDefault(); }}
      className={`border-2 border-dashed p-8 text-center cursor-pointer ${isDragging ? 'border-blue-500' : 'border-gray-300'}`}
    >
      <p className="mb-2 text-gray-600">Drag &amp; drop your files or click to upload</p>
    </div>
  );
};

FileDropZone.propTypes = {
  onDropFiles: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
  isDragging: PropTypes.bool
};

export default FileDropZone;
