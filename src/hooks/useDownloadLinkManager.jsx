import {useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage creation and cleanup of download URLs.
 */
const useDownloadLinkManager = () => {
  const urls = useRef(new Set());

  const createDownloadLink = useCallback((blob) => {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    return url;
  }, []);

  const revokeDownloadLink = useCallback((url) => {
    if (urls.current.has(url)) {
      URL.revokeObjectURL(url);
      urls.current.delete(url);
    }
  }, []);

  useEffect(() => {
    // Cleanup on unmount: revoke all created URLs.
    return () => {
      urls.current.forEach((url) => URL.revokeObjectURL(url));
      urls.current.clear();
    };
  }, []);

  return { createDownloadLink, revokeDownloadLink };
};

export default useDownloadLinkManager;
