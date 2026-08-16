import React, { useState, useEffect } from 'react';
import {
  FiFileText,
  FiExternalLink,
  FiDownload,
  FiAlertTriangle,
  FiImage,
  FiCheckCircle,
  FiX,
  FiAlertCircle,
} from 'react-icons/fi';
import Modal from './Modal';
import Button from './Button';
import Spinner from './Spinner';

/**
 * Supported image extensions
 */
const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.bmp',
  '.jfif',
  '.ico',
  '.tiff',
  '.avif',
];

/**
 * Supported document extensions
 */
const PDF_EXTENSIONS = ['.pdf'];

/**
 * Checks if a given URL, filename, or MIME type corresponds to an image.
 */
export const isImageFile = (urlOrName, mimeType) => {
  if (mimeType && typeof mimeType === 'string') {
    if (mimeType.startsWith('image/')) return true;
    if (mimeType === 'application/pdf') return false;
  }
  if (!urlOrName || typeof urlOrName !== 'string') return false;
  const cleanUrl = urlOrName.split('?')[0].toLowerCase();
  return IMAGE_EXTENSIONS.some((ext) => cleanUrl.endsWith(ext));
};

/**
 * Checks if a given URL, filename, or MIME type is a PDF.
 */
export const isPdfFile = (urlOrName, mimeType) => {
  if (mimeType && mimeType.toLowerCase() === 'application/pdf') return true;
  if (!urlOrName || typeof urlOrName !== 'string') return false;
  const cleanUrl = urlOrName.split('?')[0].toLowerCase();
  return PDF_EXTENSIONS.some((ext) => cleanUrl.endsWith(ext));
};

/**
 * Extracts a clean file name from a URL or path.
 */
export const getFileNameFromUrl = (urlOrPath) => {
  if (!urlOrPath || typeof urlOrPath !== 'string') return 'Document';
  const clean = urlOrPath.split('?')[0];
  return clean.replace(/\\/g, '/').split('/').pop() || 'Document';
};

/**
 * Extracts file extension/type label for badges.
 */
export const getFileExtensionLabel = (urlOrPath, mimeType) => {
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPG';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('webp')) return 'WEBP';
  }
  if (!urlOrPath || typeof urlOrPath !== 'string') return 'FILE';
  const fileName = getFileNameFromUrl(urlOrPath);
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts.pop().toUpperCase();
  }
  return 'DOC';
};

/**
 * DocumentPreviewModal Component
 * Robust preview modal supporting image rendering, PDF/non-image fallback states,
 * and error/404 handling.
 */
const DocumentPreviewModal = ({
  isOpen,
  onClose,
  title = 'Document Inspection',
  subtitle = 'Identity & Compliance Verification Document',
  fileUrl,
  fileName,
  fileType,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const displayName = fileName || getFileNameFromUrl(fileUrl);
  const isImage = isImageFile(fileUrl || displayName, fileType);
  const isPdf = isPdfFile(fileUrl || displayName, fileType);
  const extLabel = getFileExtensionLabel(fileUrl || displayName, fileType);

  // Reset loading and error states when a new URL is opened
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [fileUrl, isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
    >
      <div className="space-y-4">
        {/* Main Content Area */}
        <div className="bg-slate-900 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[340px] max-h-[540px] overflow-auto relative border border-slate-800">
          {!fileUrl ? (
            <div className="text-center p-8 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <FiAlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <p className="text-sm font-bold text-white">No Document URL Available</p>
              <p className="text-xs text-slate-400">The file has not been uploaded or is currently unavailable.</p>
            </div>
          ) : isImage && !imageError ? (
            /* IMAGE PREVIEW MODE */
            <div className="w-full flex flex-col items-center justify-center">
              {imageLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 z-10 space-y-2">
                  <Spinner size="md" className="text-coral-500" />
                  <span className="text-xs text-slate-400 font-medium">Loading image preview...</span>
                </div>
              )}
              <img
                src={fileUrl}
                alt={displayName}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  setImageError(true);
                }}
                className={`max-w-full max-h-[440px] object-contain rounded-xl shadow-2xl transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
              />
            </div>
          ) : (
            /* NON-IMAGE (PDF / OTHER) OR CORRUPTED/404 FALLBACK MODE */
            <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-2xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 rounded-2xl bg-coral-500/10 border border-coral-400/30 text-coral-400 flex items-center justify-center mx-auto shadow-xs">
                {imageError ? (
                  <FiAlertCircle className="w-8 h-8 text-amber-400" />
                ) : (
                  <FiFileText className="w-8 h-8" />
                )}
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                  {extLabel} Document
                </div>
                <h4 className="text-sm font-bold text-white truncate max-w-xs mx-auto" title={displayName}>
                  {displayName}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  {imageError
                    ? 'Could not display inline image preview. The file may be in PDF format, secured, or requires direct viewing.'
                    : 'Preview not available for this file type. Click below to view the full document in a new tab.'}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-coral-500 hover:bg-coral-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiExternalLink className="w-4 h-4" /> Open in New Tab
                </a>
                <a
                  href={fileUrl}
                  download={displayName}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FiDownload className="w-4 h-4" /> Download File
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
          {fileUrl ? (
            <div className="flex items-center gap-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-coral-600 font-semibold hover:underline flex items-center gap-1 bg-coral-50 hover:bg-coral-100 px-3 py-1.5 rounded-lg border border-coral-200/60 transition-colors"
              >
                <FiExternalLink /> Open in new tab
              </a>
              <a
                href={fileUrl}
                download={displayName}
                className="text-xs text-slate-700 font-semibold hover:underline flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
              >
                <FiDownload /> Download
              </a>
            </div>
          ) : (
            <div />
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
