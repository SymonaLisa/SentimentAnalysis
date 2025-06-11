import React from 'react';
import { FileText, Download, Tag } from 'lucide-react';
import { SentimentResult } from '../types/sentiment';
import { SentimentExplanation } from './SentimentExplanation';

interface ResultsDisplayProps {
  results: SentimentResult[];
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onExport }) => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Yet</h3>
        <p className="text-gray-500">Analyze some text to see results here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FileText className="text-orange-600" size={20} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onExport('csv')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
            >
              <Download size={16} />
              CSV
            </button>
            <button
              onClick={() => onExport('json')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
            >
              <Download size={16} />
              JSON
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
            >
              <Download size={16} />
              PDF
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <div key={result.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-4">
                <div className="text-2xl">{getSentimentIcon(result.sentiment)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(result.sentiment)}`}>
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(result.confidence * 100)}% confidence
                    </span>
                    {result.source && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        {result.source}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-3">{result.text}</p>
                  
                  {result.keywords.length > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <Tag size={14} className="text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {result.keywords.map((keyword, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Sentiment Explanation Component */}
                  <SentimentExplanation result={result} />
                  
                  <div className="text-xs text-gray-400 mt-2">
                    {result.timestamp.toLocaleDateString()} {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};