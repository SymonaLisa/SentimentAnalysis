import React, { useState } from 'react';
import { Type, Upload, Loader, AlertTriangle, FileText, X } from 'lucide-react';

interface TextInputProps {
  onAnalyze: (text: string) => void;
  onBatchAnalyze: (texts: string[]) => void;
  isLoading: boolean;
}

interface FileError {
  type: 'size' | 'format' | 'content' | 'read';
  message: string;
}

export const TextInput: React.FC<TextInputProps> = ({ onAnalyze, onBatchAnalyze, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');
  const [batchTexts, setBatchTexts] = useState<string[]>([]);
  const [fileError, setFileError] = useState<FileError | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_BATCH_SIZE = 100; // Maximum number of texts in batch
  const MAX_TEXT_LENGTH = 10000; // Maximum characters per text

  const validateText = (text: string): string | null => {
    if (!text || text.trim().length === 0) {
      return 'Text cannot be empty';
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return `Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed`;
    }
    if (text.trim().length < 3) {
      return 'Text must be at least 3 characters long';
    }
    return null;
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateText(inputText);
    if (validation) {
      setFileError({ type: 'content', message: validation });
      return;
    }
    
    setFileError(null);
    onAnalyze(inputText.trim());
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    setUploadStatus('uploading');

    if (!file) {
      setUploadStatus('idle');
      return;
    }

    try {
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }

      // Validate file type
      const allowedTypes = ['text/plain', 'text/csv', 'application/csv'];
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const allowedExtensions = ['txt', 'csv'];

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
        throw new Error('Invalid file format. Only .txt and .csv files are supported');
      }

      // Read file content
      const content = await readFileContent(file);
      
      if (!content || content.trim().length === 0) {
        throw new Error('File is empty or contains no readable text');
      }

      // Process file content based on type
      let lines: string[] = [];
      
      if (fileExtension === 'csv' || file.type.includes('csv')) {
        // Handle CSV files - assume first column contains text or single column
        lines = content.split('\n')
          .map(line => {
            // Simple CSV parsing - take first column or entire line if no commas
            const firstColumn = line.includes(',') ? line.split(',')[0] : line;
            return firstColumn.replace(/^["']|["']$/g, '').trim(); // Remove quotes
          })
          .filter(line => line.length > 0);
      } else {
        // Handle text files
        lines = content.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }

      // Validate content
      if (lines.length === 0) {
        throw new Error('No valid text content found in file');
      }

      if (lines.length > MAX_BATCH_SIZE) {
        throw new Error(`Too many texts in file. Maximum ${MAX_BATCH_SIZE} texts allowed`);
      }

      // Validate individual texts
      const validTexts: string[] = [];
      const invalidTexts: string[] = [];

      lines.forEach((line, index) => {
        const validation = validateText(line);
        if (validation) {
          invalidTexts.push(`Line ${index + 1}: ${validation}`);
        } else {
          validTexts.push(line);
        }
      });

      if (validTexts.length === 0) {
        throw new Error('No valid texts found in file. All texts are either empty or too short');
      }

      // Warn about invalid texts but proceed with valid ones
      if (invalidTexts.length > 0 && validTexts.length > 0) {
        console.warn('Some texts were skipped:', invalidTexts);
        setFileError({
          type: 'content',
          message: `${invalidTexts.length} texts were skipped due to validation errors. Processing ${validTexts.length} valid texts.`
        });
      }

      setBatchTexts(validTexts);
      setUploadStatus('success');

    } catch (error) {
      console.error('File upload error:', error);
      setFileError({
        type: error instanceof Error && error.message.includes('format') ? 'format' : 'read',
        message: error instanceof Error ? error.message : 'Failed to read file'
      });
      setUploadStatus('error');
    }

    // Reset file input
    e.target.value = '';
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          resolve(content);
        } catch (error) {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('File reading failed'));
      };
      
      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };
      
      // Set timeout for file reading
      setTimeout(() => {
        if (reader.readyState === FileReader.LOADING) {
          reader.abort();
          reject(new Error('File reading timeout'));
        }
      }, 30000); // 30 second timeout
      
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleBatchSubmit = () => {
    if (batchTexts.length === 0) {
      setFileError({ type: 'content', message: 'No texts to analyze' });
      return;
    }

    setFileError(null);
    onBatchAnalyze(batchTexts);
  };

  const addBatchText = () => {
    const validation = validateText(inputText);
    if (validation) {
      setFileError({ type: 'content', message: validation });
      return;
    }

    if (batchTexts.length >= MAX_BATCH_SIZE) {
      setFileError({ type: 'content', message: `Maximum ${MAX_BATCH_SIZE} texts allowed in batch` });
      return;
    }

    setFileError(null);
    setBatchTexts([...batchTexts, inputText.trim()]);
    setInputText('');
  };

  const removeBatchText = (index: number) => {
    setBatchTexts(batchTexts.filter((_, i) => i !== index));
    if (fileError && batchTexts.length <= 1) {
      setFileError(null);
    }
  };

  const clearFileError = () => {
    setFileError(null);
    setUploadStatus('idle');
  };

  const getUploadStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader className="animate-spin text-blue-500" size={16} />;
      case 'success':
        return <FileText className="text-green-500" size={16} />;
      case 'error':
        return <AlertTriangle className="text-red-500" size={16} />;
      default:
        return <Upload className="text-gray-500" size={16} />;
    }
  };

  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Processing file...';
      case 'success':
        return `Successfully loaded ${batchTexts.length} texts`;
      case 'error':
        return 'Upload failed';
      default:
        return 'Upload File (.txt, .csv)';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 rounded-lg">
          <Type className="text-green-600" size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Text Analysis</h2>
      </div>

      {/* Error Display */}
      {fileError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                {fileError.type === 'format' && 'Invalid File Format'}
                {fileError.type === 'size' && 'File Too Large'}
                {fileError.type === 'content' && 'Content Validation Error'}
                {fileError.type === 'read' && 'File Reading Error'}
              </h4>
              <p className="text-sm text-red-700">{fileError.message}</p>
              {fileError.type === 'format' && (
                <div className="mt-2 text-xs text-red-600">
                  <p>Supported formats:</p>
                  <ul className="list-disc list-inside ml-2">
                    <li>.txt files (plain text)</li>
                    <li>.csv files (comma-separated values)</li>
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={clearFileError}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('single')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'single'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Single Text
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
            activeTab === 'batch'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Batch Analysis
        </button>
      </div>

      {activeTab === 'single' ? (
        <form onSubmit={handleSingleSubmit} className="space-y-4">
          <div>
            <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
              Enter text to analyze
            </label>
            <textarea
              id="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={4}
              maxLength={MAX_TEXT_LENGTH}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
              disabled={isLoading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Minimum 3 characters required</span>
              <span>{inputText.length}/{MAX_TEXT_LENGTH}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" size={20} />
                Analyzing...
              </>
            ) : (
              'Analyze Sentiment'
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload text file or add texts manually
            </label>
            <div className="flex gap-2 mb-4">
              <input
                type="file"
                accept=".txt,.csv,text/plain,text/csv,application/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isLoading}
              />
              <label
                htmlFor="file-upload"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                  uploadStatus === 'uploading'
                    ? 'bg-blue-100 text-blue-700'
                    : uploadStatus === 'success'
                    ? 'bg-green-100 text-green-700'
                    : uploadStatus === 'error'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getUploadStatusIcon()}
                {getUploadStatusText()}
              </label>
            </div>
            <div className="text-xs text-gray-500">
              <p>Supported formats: .txt, .csv | Max size: {MAX_FILE_SIZE / (1024 * 1024)}MB | Max texts: {MAX_BATCH_SIZE}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Add text manually..."
              maxLength={MAX_TEXT_LENGTH}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isLoading}
            />
            <button
              onClick={addBatchText}
              disabled={!inputText.trim() || isLoading || batchTexts.length >= MAX_BATCH_SIZE}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200"
            >
              Add
            </button>
          </div>

          {batchTexts.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">
                Texts to analyze ({batchTexts.length}/{MAX_BATCH_SIZE})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {batchTexts.map((text, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <span className="flex-1 text-sm text-gray-700 truncate" title={text}>
                      {text}
                    </span>
                    <button
                      onClick={() => removeBatchText(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      disabled={isLoading}
                      title="Remove text"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleBatchSubmit}
                disabled={isLoading || batchTexts.length === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Analyzing Batch...
                  </>
                ) : (
                  `Analyze ${batchTexts.length} Texts`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};