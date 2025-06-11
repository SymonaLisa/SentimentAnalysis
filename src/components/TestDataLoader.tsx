import React, { useState } from 'react';
import { FileText, Play, BarChart3, Target, CheckCircle, XCircle, AlertCircle, TrendingUp, Database, FileCheck } from 'lucide-react';
import { sentimentTestData, TestDataEntry, getTestDataByCategory, getTestDataByDifficulty, getTestDataBySource, getRandomTestSample, getBalancedTestSample, getTestDataStats, getPDFTestData } from '../data/testData';
import { SentimentResult } from '../types/sentiment';

interface TestDataLoaderProps {
  onLoadTestData: (texts: string[]) => void;
  onRunAccuracyTest: (testEntries: TestDataEntry[]) => void;
  isLoading: boolean;
  results: SentimentResult[];
}

interface AccuracyResult {
  testEntry: TestDataEntry;
  predicted: 'positive' | 'negative' | 'neutral';
  correct: boolean;
  confidence: number;
}

export const TestDataLoader: React.FC<TestDataLoaderProps> = ({ 
  onLoadTestData, 
  onRunAccuracyTest, 
  isLoading,
  results 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [testResults, setTestResults] = useState<AccuracyResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const categories = ['all', 'product_review', 'service_review', 'mixed_review'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const sources = ['all', 'PDF Test Data', 'Enhanced Dataset'];

  const stats = getTestDataStats();
  const pdfTestData = getPDFTestData();

  const getFilteredTestData = (): TestDataEntry[] => {
    let filtered = sentimentTestData;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(entry => entry.category === selectedCategory);
    }
    
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(entry => entry.difficulty === selectedDifficulty);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(entry => entry.source === selectedSource);
    }
    
    return filtered;
  };

  const handleLoadSample = () => {
    const sample = getRandomTestSample(10);
    const texts = sample.map(entry => entry.text);
    onLoadTestData(texts);
  };

  const handleLoadBalanced = () => {
    const sample = getBalancedTestSample(15);
    const texts = sample.map(entry => entry.text);
    onLoadTestData(texts);
  };

  const handleLoadPDFData = () => {
    const texts = pdfTestData.map(entry => entry.text);
    onLoadTestData(texts);
  };

  const handleLoadFiltered = () => {
    const filtered = getFilteredTestData();
    const texts = filtered.map(entry => entry.text);
    onLoadTestData(texts);
  };

  const handleRunAccuracyTest = () => {
    const testData = getFilteredTestData().slice(0, 25); // Limit to 25 for performance
    onRunAccuracyTest(testData);
  };

  const handleRunPDFAccuracyTest = () => {
    onRunAccuracyTest(pdfTestData);
  };

  const handleRunComprehensiveTest = () => {
    const testData = getBalancedTestSample(30); // Balanced comprehensive test
    onRunAccuracyTest(testData);
  };

  const calculateAccuracy = (results: AccuracyResult[]) => {
    if (results.length === 0) return 0;
    const correct = results.filter(r => r.correct).length;
    return Math.round((correct / results.length) * 100);
  };

  const getAccuracyByCategory = (results: AccuracyResult[]) => {
    const categories = ['positive', 'negative', 'neutral'];
    return categories.map(category => {
      const categoryResults = results.filter(r => r.testEntry.expectedSentiment === category);
      const correct = categoryResults.filter(r => r.correct).length;
      const total = categoryResults.length;
      return {
        category,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        total,
        correct
      };
    });
  };

  const getAccuracyByDifficulty = (results: AccuracyResult[]) => {
    const difficulties = ['easy', 'medium', 'hard'];
    return difficulties.map(difficulty => {
      const difficultyResults = results.filter(r => r.testEntry.difficulty === difficulty);
      const correct = difficultyResults.filter(r => r.correct).length;
      const total = difficultyResults.length;
      return {
        difficulty,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        total,
        correct
      };
    });
  };

  // Calculate test results when results change
  React.useEffect(() => {
    if (results.length > 0 && results.some(r => r.source?.includes('Accuracy Test'))) {
      const accuracyResults = results.filter(r => r.source?.includes('Accuracy Test'));
      const simulatedResults: AccuracyResult[] = accuracyResults.map((result) => {
        const expectedSentiment = result.source?.match(/Expected: (\w+)/)?.[1] as 'positive' | 'negative' | 'neutral' || 'neutral';
        const testEntry: TestDataEntry = {
          id: result.id,
          text: result.text,
          expectedSentiment,
          category: 'test',
          difficulty: 'medium'
        };
        return {
          testEntry,
          predicted: result.sentiment,
          correct: result.sentiment === expectedSentiment,
          confidence: result.confidence
        };
      });
      setTestResults(simulatedResults);
      setShowResults(true);
    }
  }, [results]);

  const filteredData = getFilteredTestData();
  const accuracy = calculateAccuracy(testResults);
  const categoryAccuracy = getAccuracyByCategory(testResults);
  const difficultyAccuracy = getAccuracyByDifficulty(testResults);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Database className="text-purple-600" size={20} />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Test Data & Accuracy Testing</h3>
        <button
          onClick={() => setShowStats(!showStats)}
          className="ml-auto text-sm text-purple-600 hover:text-purple-800 transition-colors duration-200"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* PDF Test Data Highlight */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <FileCheck className="text-blue-600" size={20} />
          <h4 className="font-medium text-blue-900">PDF Test Data Available</h4>
        </div>
        <p className="text-sm text-blue-800 mb-3">
          {pdfTestData.length} test cases extracted from your PDF document with expected sentiment ratings.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleLoadPDFData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 text-sm font-medium"
          >
            <FileText size={14} />
            Load PDF Data ({pdfTestData.length} texts)
          </button>
          <button
            onClick={handleRunPDFAccuracyTest}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 text-sm font-medium"
          >
            <Target size={14} />
            Test PDF Accuracy
          </button>
        </div>
      </div>

      {/* Dataset Statistics */}
      {showStats && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-3">Dataset Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-semibold text-purple-800">Total Tests</div>
              <div className="text-purple-600">{stats.total}</div>
            </div>
            <div>
              <div className="font-semibold text-purple-800">From PDF</div>
              <div className="text-purple-600">{stats.bySource['PDF Test Data']}</div>
            </div>
            <div>
              <div className="font-semibold text-purple-800">Enhanced</div>
              <div className="text-purple-600">{stats.bySource['Enhanced Dataset']}</div>
            </div>
            <div>
              <div className="font-semibold text-purple-800">Categories</div>
              <div className="text-purple-600">{Object.keys(stats.byCategory).length}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-semibold text-green-700">Positive</div>
              <div className="text-green-600">{stats.bySentiment.positive}</div>
            </div>
            <div>
              <div className="font-semibold text-red-700">Negative</div>
              <div className="text-red-600">{stats.bySentiment.negative}</div>
            </div>
            <div>
              <div className="font-semibold text-gray-700">Neutral</div>
              <div className="text-gray-600">{stats.bySentiment.neutral}</div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Filters */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="product_review">Product Reviews</option>
              <option value="service_review">Service Reviews</option>
              <option value="mixed_review">Mixed Reviews</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="PDF Test Data">PDF Test Data</option>
              <option value="Enhanced Dataset">Enhanced Dataset</option>
            </select>
          </div>
        </div>

        {/* Current Filter Stats */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{filteredData.length}</div>
              <div className="text-sm text-gray-600">Filtered</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(d => d.expectedSentiment === 'positive').length}
              </div>
              <div className="text-sm text-gray-600">Positive</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(d => d.expectedSentiment === 'negative').length}
              </div>
              <div className="text-sm text-gray-600">Negative</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-600">
                {filteredData.filter(d => d.expectedSentiment === 'neutral').length}
              </div>
              <div className="text-sm text-gray-600">Neutral</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredData.filter(d => d.source === 'PDF Test Data').length}
              </div>
              <div className="text-sm text-gray-600">From PDF</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            onClick={handleLoadSample}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
          >
            <Play size={16} />
            Random Sample
          </button>
          <button
            onClick={handleLoadBalanced}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
          >
            <TrendingUp size={16} />
            Balanced Sample
          </button>
          <button
            onClick={handleLoadFiltered}
            disabled={isLoading || filteredData.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
          >
            <FileText size={16} />
            Load Filtered
          </button>
          <button
            onClick={handleRunAccuracyTest}
            disabled={isLoading || filteredData.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
          >
            <Target size={16} />
            Accuracy Test
          </button>
          <button
            onClick={handleRunComprehensiveTest}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors duration-200 font-medium"
          >
            <BarChart3 size={16} />
            Full Test
          </button>
        </div>

        {/* Test Results */}
        {showResults && testResults.length > 0 && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="text-green-600" size={20} />
              </div>
              <h4 className="text-lg font-semibold text-gray-900">Accuracy Test Results</h4>
            </div>

            {/* Overall Accuracy */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{accuracy}%</div>
                <div className="text-sm text-gray-600">Overall Accuracy</div>
                <div className="text-xs text-gray-500 mt-1">
                  {testResults.filter(r => r.correct).length} correct out of {testResults.length} tests
                </div>
              </div>
            </div>

            {/* Category and Difficulty Breakdown */}
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div>
                <h5 className="font-medium text-gray-900 mb-3">Accuracy by Sentiment</h5>
                <div className="grid grid-cols-3 gap-3">
                  {categoryAccuracy.map(({ category, accuracy, total, correct }) => (
                    <div key={category} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-center">
                        <div className={`text-xl font-bold mb-1 ${
                          category === 'positive' ? 'text-green-600' :
                          category === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-sm font-medium text-gray-900 capitalize">{category}</div>
                        <div className="text-xs text-gray-500">{correct}/{total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-900 mb-3">Accuracy by Difficulty</h5>
                <div className="grid grid-cols-3 gap-3">
                  {difficultyAccuracy.map(({ difficulty, accuracy, total, correct }) => (
                    <div key={difficulty} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="text-center">
                        <div className={`text-xl font-bold mb-1 ${
                          difficulty === 'easy' ? 'text-green-600' :
                          difficulty === 'medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {accuracy}%
                        </div>
                        <div className="text-sm font-medium text-gray-900 capitalize">{difficulty}</div>
                        <div className="text-xs text-gray-500">{correct}/{total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h5 className="font-medium text-gray-900 mb-2">Detailed Results</h5>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded border">
                  <div className="flex-shrink-0">
                    {result.correct ? (
                      <CheckCircle className="text-green-500" size={16} />
                    ) : (
                      <XCircle className="text-red-500" size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-900 truncate" title={result.testEntry.text}>
                      {result.testEntry.text}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Expected: <span className="font-medium">{result.testEntry.expectedSentiment}</span></span>
                      <span>Predicted: <span className="font-medium">{result.predicted}</span></span>
                      <span>Confidence: {Math.round(result.confidence * 100)}%</span>
                      {result.testEntry.difficulty && (
                        <span>Difficulty: <span className="font-medium">{result.testEntry.difficulty}</span></span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowResults(false)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              Hide Results
            </button>
          </div>
        )}

        {/* Sample Preview */}
        <div className="border-t border-gray-200 pt-4">
          <h5 className="font-medium text-gray-900 mb-3">Sample Test Data Preview</h5>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {filteredData.slice(0, 5).map((entry, index) => (
              <div key={entry.id} className="text-sm p-2 bg-gray-50 rounded border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    entry.expectedSentiment === 'positive' ? 'bg-green-100 text-green-700' :
                    entry.expectedSentiment === 'negative' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {entry.expectedSentiment}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{entry.difficulty}</span>
                  <span className="text-xs text-purple-500">{entry.source}</span>
                </div>
                <div className="text-gray-700">{entry.text}</div>
              </div>
            ))}
          </div>
          {filteredData.length > 5 && (
            <div className="text-xs text-gray-500 mt-2">
              Showing 5 of {filteredData.length} filtered entries
            </div>
          )}
        </div>
      </div>
    </div>
  );
};