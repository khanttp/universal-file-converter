{/*
  ConvertedFilesSection.jsx
  -------------------------
  This component displays the list of converted files, splitting them into
  "Recently Converted" and "Conversion History". It provides controls for downloading
  individual files, deleting them, and downloading all files as a ZIP archive.
  It also allows users to toggle whether previously downloaded files are included.
  Additionally, it includes a "Clear History" button that removes the conversion
  history from localForage and calls an optional callback to update the parent state.
*/}
import React from 'react';
import PropTypes from 'prop-types';
import localforage from 'localforage';
import ConvertedFileItem from './ConvertedFileItem';

const ConvertedFilesSection = ({
  recentFiles,
  historyFiles,
  onDownload,
  onDelete,
  onDownloadAll,
  includeDownloaded,
  setIncludeDownloaded,
  onClearHistory,
}) => {
  const handleClearHistory = async () => {
    try {
      await localforage.removeItem('convertedFiles');
      if (typeof onClearHistory === 'function') {
        onClearHistory();
      }
    } catch (error) {
      console.error('Error clearing conversion history:', error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-4 text-white">Converted Files</h3>
      {recentFiles.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-2 text-white">Recently Converted</h4>
          <ul>
            {recentFiles.map((file) => (
              <ConvertedFileItem key={file.id} file={file} onDownload={onDownload} onDelete={onDelete} />
            ))}
          </ul>
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={onDownloadAll}
              className="bg-[#165DFB] hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Download All {recentFiles.some(f => !f.downloaded) && !includeDownloaded && ' (New Files)'}
            </button>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeDownloaded"
                checked={includeDownloaded}
                onChange={(e) => setIncludeDownloaded(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="includeDownloaded" className="text-[#938E86]">
                Include Previously Downloaded
              </label>
            </div>
          </div>
        </div>
      )}
      <div className="mt-4">
        <details>
          <summary className="text-lg font-semibold cursor-pointer mb-2 text-white">Conversion History</summary>
          {historyFiles.length > 0 ? (
            <ul>
              {historyFiles.map((file) => (
                <ConvertedFileItem key={file.id} file={file} onDownload={onDownload} onDelete={onDelete} />
              ))}
            </ul>
          ) : (
            <p className="text-[#938E86]">No history available.</p>
          )}
          {historyFiles.length > 0 && (
            <div className="mt-4 text-center">
              <button
                onClick={handleClearHistory}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Clear History
              </button>
            </div>
          )}
        </details>
      </div>
    </div>
  );
};

ConvertedFilesSection.propTypes = {
  recentFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  historyFiles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onDownload: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDownloadAll: PropTypes.func.isRequired,
  includeDownloaded: PropTypes.bool.isRequired,
  setIncludeDownloaded: PropTypes.func.isRequired,
  onClearHistory: PropTypes.func,
};

export default ConvertedFilesSection;
