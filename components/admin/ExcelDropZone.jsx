import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, AlertCircle } from 'lucide-react';

export default function ExcelDropZone({ onFileSelect, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];

    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      return 'Please select an Excel file (.xlsx or .xls)';
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'File is too large. Maximum size is 10MB.';
    }

    return null;
  };

  const handleFile = (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileSelect?.(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-full min-h-[160px] rounded-xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDragging
            ? 'border-admin-red bg-admin-red/5 scale-[1.01]'
            : selectedFile
              ? 'border-green-500 bg-green-500/5'
              : error
                ? 'border-red-500 bg-red-500/5'
                : 'border-admin-card-border hover:border-stone-400 bg-admin-content-bg hover:bg-stone-100'
          }
        `}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
          {selectedFile ? (
            <>
              <div className="p-3 rounded-full bg-green-100 mb-3">
                <FileSpreadsheet className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-admin-text">{selectedFile.name}</p>
              <p className="text-xs text-admin-text-secondary mt-1">{formatFileSize(selectedFile.size)}</p>
              <button
                onClick={handleClear}
                className="mt-3 flex items-center gap-1 text-xs text-admin-text-secondary hover:text-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove file
              </button>
            </>
          ) : error ? (
            <>
              <div className="p-3 rounded-full bg-red-100 mb-3">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <p className="text-xs text-admin-text-secondary mt-2">Click to try again</p>
            </>
          ) : (
            <>
              <div className={`p-3 rounded-full mb-3 ${isDragging ? 'bg-admin-red/10' : 'bg-stone-200'}`}>
                <Upload className={`w-8 h-8 ${isDragging ? 'text-admin-red' : 'text-admin-text-muted'}`} />
              </div>
              <p className="text-sm font-medium text-admin-text">
                {isDragging ? 'Drop your file here' : 'Drag & drop your Excel file'}
              </p>
              <p className="text-xs text-admin-text-secondary mt-1">or click to browse</p>
              <p className="text-[10px] text-admin-text-muted mt-3">
                Supports .xlsx and .xls files up to 10MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
