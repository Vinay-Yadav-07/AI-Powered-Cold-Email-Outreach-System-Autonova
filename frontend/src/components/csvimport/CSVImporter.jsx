import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Card } from '../cards/CardComponents';

const REQUIRED_COLUMNS = [
  'first_name',
  'company',
  'email',
  'industry',
];

const OPTIONAL_COLUMNS = [
  'id',
  'status',
  'last_sent_at',
  'last_email_content',
  'followup_count',
  'last_response',
  'notes',
  'sender_account',
  'validation_reason',
];

const CSV_TEMPLATE = [
  [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(','),
  'Asha,Acme Labs,asha@example.com,Technology,,queued,,,0,,,sender@example.com,',
].join('\n');

export const CSVImporter = ({ onSuccess, onError }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV file',
      });
      onError?.('Invalid file format');
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/leads/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || result?.error || 'Upload failed');
      }

      setUploadStatus({
        type: 'success',
        message: `Successfully imported ${result.importedCount} leads`,
      });

      onSuccess?.(result);

      // Clear status after 3 seconds
      setTimeout(() => {
        setUploadStatus(null);
        setFileName(null);
      }, 3000);
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.message || 'Failed to import CSV',
      });
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const downloadTemplate = (event) => {
    event.stopPropagation();
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autonova-leads-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border-dashed border-2 border-white/[0.2] p-8">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadStatus ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          {uploadStatus.type === 'success' ? (
            <>
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="text-green-400 font-semibold text-center">{uploadStatus.message}</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <p className="text-red-400 font-semibold text-center">{uploadStatus.message}</p>
            </>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-8">
          <Loader size={32} className="text-blue-400 animate-spin" />
          <p className="text-gray-300 font-medium">Importing {fileName}...</p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-4 py-8 cursor-pointer transition-all duration-300 rounded-xl p-4 ${
            isDragging
              ? 'bg-blue-500/10 border-blue-400/50'
              : 'hover:bg-white/[0.02]'
          }`}
        >
          <div className={`p-4 rounded-full transition-colors duration-300 ${
            isDragging ? 'bg-blue-500/30' : 'bg-white/[0.05]'
          }`}>
            <Upload size={32} className={isDragging ? 'text-blue-400' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">
              Drop your CSV file here or click to browse
            </p>
            <p className="text-gray-400 text-sm">
              Supported format: CSV with lead data columns
            </p>
          </div>
          <div className="w-full max-w-3xl rounded-lg border border-white/[0.08] bg-white/[0.03] p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
              Required columns
            </p>
            <p className="text-xs leading-6 text-gray-300 break-words">
              {REQUIRED_COLUMNS.join(', ')}
            </p>
            <p className="mt-2 text-xs leading-6 text-gray-500 break-words">
              Optional: {OPTIONAL_COLUMNS.join(', ')}
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="mt-3 text-xs font-semibold text-blue-400 hover:text-blue-300"
            >
              Download exact CSV template
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1]">
            <FileText size={16} className="text-gray-400" />
            <span className="text-xs text-gray-400">Max file size: 10MB</span>
          </div>
        </div>
      )}
    </Card>
  );
};
