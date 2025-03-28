import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle
} from 'react';
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

const FILE_UPLOAD_LIMIT = 10;
const HISTORY_EXPIRATION = 20 * 60 * 1000; // 20 minutes

const FileConverter = forwardRef((props, ref) => {
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
  const [abortController, setAbortController] = useState(null);

  const fileInputRef = useRef(null);
  const { createDownloadLink, revokeDownloadLink } = useDownloadLinkManager();

  // Expose a method to open the file dialog so the parent can trigger it.
  useImperativeHandle(ref, () => ({
    openFileDialog: () => {
      if (fileInputRef.current) fileInputRef.current.click();
    },
  }));

  // Periodic cleanup of conversion history every minute
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        let files = await localforage.getItem('convertedFiles');
        if (files) {
          const now = Date.now();
          const filtered = files.filter(record => now - record.timestamp <= HISTORY_EXPIRATION);
          if (filtered.length !== files.length) {
            await localforage.setItem('convertedFiles', filtered);
            const updated = filtered.map(record => ({
              ...record,
              downloadLink: createDownloadLink(record.blob),
            }));
            setConvertedFiles(updated);
          }
        }
      } catch (error) {
        console.error('Error cleaning up expired conversion history:', error);
      }
    }, 60000); // Run every minute

    return () => clearInterval(interval);
  }, [createDownloadLink]);

  // Persist converted files (excluding downloadLink) whenever they change.
  useEffect(() => {
    const persistFiles = async () => {
      try {
        const toStore = convertedFiles.map(({ downloadLink, ...rest }) => ({
          timestamp: rest.timestamp || Date.now(),
          ...rest
        }));
        await localforage.setItem('convertedFiles', toStore);
      } catch (error) {
        console.error('Error persisting converted files:', error);
      }
    };
    persistFiles();
  }, [convertedFiles]);

  // Conversion options based on file type/extension.
  const getConversionOptions = useCallback((file) => {
    if (!file) return [];
    const fileName = file.name.toLowerCase();
    const fileType = file.type;

    // Advanced conversions
    if (fileName.endsWith('.svg')) return ['png', 'jpg', 'webp'];
    if (fileName.endsWith('.heic')) return ['png', 'jpg', 'webp'];
    if (fileName.endsWith('.tif') || fileName.endsWith('.tiff')) return ['png', 'jpg', 'webp'];

    // Document conversions
    if (fileName.endsWith('.pdf')) return [];
    if (fileName.endsWith('.docx')) return [];

    // Audio and Video conversions
    if (fileType.startsWith('audio/')) return [];
    if (fileType.startsWith('video/')) return [];

    // Standard image conversions as fallback
    if (fileType.startsWith('image/')) return ['png', 'jpg', 'webp'];

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

  // File selection handler: Limit total files to FILE_UPLOAD_LIMIT.
  const handleFileSelect = useCallback((e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    setSelectedFiles((prev) => {
      const total = prev.length + filesArray.length;
      if (total > FILE_UPLOAD_LIMIT) {
        setErrorMessages([`File limit exceeded: Maximum of ${FILE_UPLOAD_LIMIT} files allowed per conversion.`]);
      }
      setErrorMessages([]); // Clear previous errors if under limit
      return [...prev, ...filesArray];
    });
  }, []);

  // Drop handler: Limit total files to FILE_UPLOAD_LIMIT.
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const filesArray = Array.from(e.dataTransfer.files);
    if (filesArray.length === 0) return;

    setSelectedFiles((prev) => {
      const total = prev.length + filesArray.length;
      if (total > FILE_UPLOAD_LIMIT) {
        setErrorMessages([`File limit exceeded: Maximum of ${FILE_UPLOAD_LIMIT} files allowed per conversion.`]);
        const allowedCount = FILE_UPLOAD_LIMIT - prev.length;
        const limitedFiles = filesArray.slice(0, allowedCount);
        return [...prev, ...limitedFiles];
      }
      setErrorMessages([]);
      return [...prev, ...filesArray];
    });
    e.dataTransfer.clearData();
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
    if (fileInputRef.current) fileInputRef.current.click();
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
      if (fileToRemove) revokeDownloadLink(fileToRemove.downloadLink);
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
    filesToDownload.forEach((file) => zip.file(file.fileName, file.blob));
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'converted_files.zip');
      filesToDownload.forEach((file) => handleMarkDownloaded(file.id));
    } catch (error) {
      console.error('Error generating zip:', error);
    }
  }, [convertedFiles, handleMarkDownloaded]);

  const handleCancelConversion = useCallback(() => {
    if (abortController) {
      console.log('🧹 Cancel button clicked. Aborting conversion and cleaning up...');
      abortController.abort();
      setAbortController(null);
      setConversionState('idle');
      setSelectedFiles([]);
      setTargetFormat('');
      setProgress(0);
      setCurrentFileName('');
      setFilesConvertedSoFar(0);
      setConvertedFiles(prev => prev.filter(file => !file.recent));
    }
  }, [abortController]);

  const progressHandler = useCallback((completed, total, fileName) => {
    requestAnimationFrame(() => {
      setFilesConvertedSoFar(completed);
      setProgress(Math.floor((completed / total) * 100));
      setCurrentFileName(fileName);
    });
  }, []);

  // Conversion handler: Also prevents conversion if more than FILE_UPLOAD_LIMIT files.
  const handleConversion = useCallback(async () => {
    if (selectedFiles.length > FILE_UPLOAD_LIMIT) {
      setErrorMessages([`File limit exceeded: Maximum of ${FILE_UPLOAD_LIMIT} files allowed per conversion.`]);
      return;
    }
    if (selectedFiles.length === 0 || !targetFormat) return;

    const controller = new AbortController();
    setAbortController(controller);

    setConversionState('converting');
    setErrorMessages([]);
    setProgress(0);
    setFilesConvertedSoFar(0);
    setCurrentFileName('');
    setConvertedFiles(prev =>
      prev.map(file => ({ ...file, recent: false }))
    );

    try {
      const { successes, failures } = await converter(
        selectedFiles,
        targetFormat,
        progressHandler,
        controller.signal
      );

      if (controller.signal.aborted) return;

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
          timestamp: Date.now(),
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

      setAbortController(null);
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error('Batch conversion error:', error);
      setConversionState('error');
      setErrorMessages([error.message]);
      setAbortController(null);
    }
  }, [selectedFiles, targetFormat, createDownloadLink, progressHandler]);

  return (
    <div className="w-4/5 mx-auto p-6 bg-white shadow rounded">
      {/* Hidden file input */}
      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />

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

          {selectedFiles.length > FILE_UPLOAD_LIMIT && (
            <p className="text-red-500 mb-2">
              File limit exceeded: Maximum of {FILE_UPLOAD_LIMIT} files allowed per conversion.
            </p>
          )}

          <button
            className={`w-full py-2 px-4 rounded ${targetFormat && selectedFiles.length <= FILE_UPLOAD_LIMIT
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-700 cursor-not-allowed'
              }`}
            onClick={handleConversion}
            disabled={!targetFormat || selectedFiles.length > FILE_UPLOAD_LIMIT}
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
              <>
                <ConversionProgress
                  currentFileName={currentFileName}
                  progress={progress}
                  filesDone={filesConvertedSoFar}
                  totalFiles={selectedFiles.length}
                />
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mt-4"
                  onClick={handleCancelConversion}
                >
                  Cancel Conversion
                </button>
              </>
            )}
            {conversionState === 'completed' && (
              <p className="mb-2 text-green-600 font-semibold">Conversion Complete!</p>
            )}
            {errorMessages.length > 0 && <ErrorDisplay errors={errorMessages} />}
            {conversionState !== 'idle' && conversionState !== 'converting' && (
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
});

export default FileConverter;
