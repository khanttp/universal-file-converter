
import React, { useState, useRef, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { converter } from '../../utils/fileConverter';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import sanitizeFileName from '../../utils/sanitizeFileName';
import useDownloadLinkManager from "../../hooks/useDownloadLinkManager";

import FileDropZone from './FileDropZone';
import SelectedFilesList from './SelectedFilesList';
import FormatSelector from './FormatSelector';
import ConversionProgress from './ConversionProgress';
import ErrorDisplay from './ErrorDisplay';
import ConvertedFilesSection from './ConvertedFilesSection';

const FileConverter = () => {
  // Main container state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('');
  const [conversionState, setConversionState] = useState('idle'); // 'idle', 'converting', 'completed', 'error'
  const [errorMessages, setErrorMessages] = useState([]);
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [includeDownloaded, setIncludeDownloaded] = useState(false);

  // Progress tracking state
  const [progress, setProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [filesConvertedSoFar, setFilesConvertedSoFar] = useState(0);

  const fileInputRef = useRef(null);
  const { createDownloadLink, revokeDownloadLink } = useDownloadLinkManager();

  // Load converted files from localForage on mount.
  useEffect(() => {
    const loadConvertedFiles = async () => {
      try {
        const files = await localforage.getItem('convertedFiles');
        if (files) {
          const updated = files.map((record) => ({
            ...record,
            downloadLink: createDownloadLink(record.blob),
          }));
          setConvertedFiles(updated);
        }
      } catch (error) {
        console.error('Error loading converted files:', error);
      }
    };
    loadConvertedFiles();
  }, [createDownloadLink]);

  // Persist converted files (excluding downloadLink) whenever they change.
  useEffect(() => {
    const persistFiles = async () => {
      try {
        const toStore = convertedFiles.map(({ downloadLink, ...rest }) => rest);
        await localforage.setItem('convertedFiles', toStore);
      } catch (error) {
        console.error('Error persisting converted files:', error);
      }
    };
    persistFiles();
  }, [convertedFiles]);

  // In your FileConverter component (frontend)
  const getConversionOptions = useCallback((file) => {
    if (!file) return [];
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Advanced conversion based on file extension.
    if (fileName.endsWith('.svg')) {
      return ['png', 'jpg', 'webp'];
    }
    if (fileName.endsWith('.heic')) {
      return ['png', 'jpg', 'webp'];
    }
    if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) {
      return ['png', 'jpg', 'webp'];
    }

    // Document conversion options.
    if (fileName.endsWith('.pdf')) {
      return [];
    }
    if (fileName.endsWith('.docx')) {
      return [];
    }

    // Audio conversion options.
    if (fileType.startsWith('audio/')) {
      return [];
    }

    // Video conversion options.
    if (fileType.startsWith('video/')) {
      return [];
    }

    // Fallback: standard conversions for images.
    if (fileType.startsWith('image/')) {
      return ['png', 'jpg', 'webp'];
    }

    // For unknown types, offer a simulated conversion (e.g., to text).
    return [];
  }, []);


  // Reset state for new conversion cycle.
  const resetState = useCallback(() => {
    setSelectedFiles([]);
    setTargetFormat('');
    setConversionState('idle');
    setErrorMessages([]);
    setProgress(0);
    setCurrentFileName('');
    setFilesConvertedSoFar(0);
  }, []);

  // File selection handler.
  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  }, []);

  // Drop handler.
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);
      e.dataTransfer.clearData();
    }
  }, []);

  // Remove file from selected list.
  const removeSelectedFile = useCallback((index) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  // Handler to trigger the hidden file input for "Add More Files".
  const handleAddMoreFiles = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Mark a converted file as downloaded.
  const handleMarkDownloaded = useCallback((id) => {
    setConvertedFiles((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, downloaded: true } : item
      )
    );
  }, []);

  // Remove a converted file.
  const handleRemoveConvertedFile = useCallback((id) => {
    setConvertedFiles((prev) => {
      const fileToRemove = prev.find((item) => item.id === id);
      if (fileToRemove) {
        revokeDownloadLink(fileToRemove.downloadLink);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, [revokeDownloadLink]);

  // Download all files as a ZIP archive.
  const downloadAll = useCallback(async (includeFlag) => {
    const filesToDownload = convertedFiles.filter(
      (file) => includeFlag || (file.recent && !file.downloaded)
    );
    if (filesToDownload.length === 0) return;
    const zip = new JSZip();
    filesToDownload.forEach((file) => {
      zip.file(file.fileName, file.blob);
    });
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'converted_files.zip');
      filesToDownload.forEach((file) => handleMarkDownloaded(file.id));
    } catch (error) {
      console.error('Error generating zip:', error);
    }
  }, [convertedFiles, handleMarkDownloaded]);

  // New Conversion handler: Pass all files at once to the backend.
  const handleConversion = useCallback(async () => {
    if (selectedFiles.length === 0 || !targetFormat) return;

    setConversionState('converting');
    setErrorMessages([]);
    setProgress(0);
    setFilesConvertedSoFar(0);
    setCurrentFileName('');

    // Mark previously converted files as not recent.
    setConvertedFiles((prev) =>
      prev.map((file) => ({ ...file, recent: false }))
    );

    try {
      const { successes, failures } = await converter(
        selectedFiles,
        targetFormat,
        (completed, total, fileName) => {
          setFilesConvertedSoFar(completed);
          setProgress(Math.floor((completed / total) * 100));
          // Set the most recently converted file's name.
          setCurrentFileName(fileName);
        }
      );

      // Process successful conversions.
      const successfulConversions = successes.map(({ file, result }) => {
        const safeFileName = sanitizeFileName(
          file.name.replace(/\.[^/.]+$/, '') + '.' + targetFormat
        );
        return {
          id: Date.now() + Math.random(),
          fileName: safeFileName,
          blob: result.file,
          downloaded: false,
          recent: true,
        };
      });

      if (successfulConversions.length > 0) {
        const withURL = successfulConversions.map((record) => ({
          ...record,
          downloadLink: createDownloadLink(record.blob),
        }));
        setConvertedFiles((prev) => [...prev, ...withURL]);
        setConversionState('completed');
      } else {
        setConversionState('error');
      }
      if (failures.length > 0) {
        setErrorMessages(
          failures.map(({ file, error }) => `${file.name}: ${error.message}`)
        );
      }
    } catch (error) {
      console.error('Batch conversion error:', error);
      setConversionState('error');
      setErrorMessages([error.message]);
    }
  }, [selectedFiles, targetFormat, createDownloadLink]);



  return (
    <div className="w-4/5 mx-auto p-6 bg-white shadow rounded">
      {/* Hidden file input */}
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileSelect}
      />

      {selectedFiles.length === 0 && conversionState === 'idle' && (
        <FileDropZone
          onDropFiles={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        />
      )}

      {selectedFiles.length > 0 && conversionState === 'idle' && (
        <>
          <SelectedFilesList
            files={selectedFiles}
            onRemoveFile={removeSelectedFile}
            onAddMoreFiles={handleAddMoreFiles}
          />
          <FormatSelector
            selectedFormat={targetFormat}
            onChangeFormat={setTargetFormat}
            options={getConversionOptions(selectedFiles[0])}
          />
          <button
            className={`w-full py-2 px-4 rounded ${targetFormat
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
              }`}
            onClick={handleConversion}
            disabled={!targetFormat}
          >
            Convert Now
          </button>
        </>
      )}

      {(conversionState === 'converting' ||
        conversionState === 'completed' ||
        conversionState === 'error' ||
        errorMessages.length > 0) && (
          <div className="mt-4 text-center">
            {conversionState === 'converting' && (
              <ConversionProgress
                currentFileName={currentFileName}
                progress={progress}
                filesDone={filesConvertedSoFar}
                totalFiles={selectedFiles.length}
              />
            )}

            {conversionState === 'completed' && (
              <p className="mb-2 text-green-600 font-semibold">Conversion Complete!</p>
            )}

            {errorMessages.length > 0 && <ErrorDisplay errors={errorMessages} />}

            {conversionState !== 'idle' && (
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={resetState}
              >
                Convert Another File
              </button>
            )}
          </div>
        )}

      {convertedFiles.length > 0 && (
        <ConvertedFilesSection
          recentFiles={convertedFiles.filter((file) => file.recent)}
          historyFiles={convertedFiles.filter((file) => !file.recent)}
          onDownload={handleMarkDownloaded}
          onDelete={handleRemoveConvertedFile}
          onDownloadAll={() => downloadAll(includeDownloaded)}
          includeDownloaded={includeDownloaded}
          setIncludeDownloaded={setIncludeDownloaded}
          onClearHistory={() => setConvertedFiles([])}
        />
      )}
    </div>
  );
};

export default FileConverter;