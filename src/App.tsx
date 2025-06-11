import React, { useState } from 'react';
import { Brain, BarChart3, FileText } from 'lucide-react';
import { ApiTokenInput } from './components/ApiTokenInput';
import { TextInput } from './components/TextInput';
import { ResultsDisplay } from './components/ResultsDisplay';
import { SentimentVisualization } from './components/SentimentVisualization';
import { ComparativeAnalysis } from './components/ComparativeAnalysis';
import { SentimentAnalysisService } from './services/sentimentApi';
import { SentimentResult, BatchAnalysisResult } from './types/sentiment';
import { exportToCSV, exportToJSON, exportToPDF } from './utils/exportUtils';

function App() {
  const [hasApiToken, setHasApiToken] = useState(false);
  const [results, setResults] = useState<SentimentResult[]>([]);
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sentimentService = SentimentAnalysisService.getInstance();

  const mapApiResponseToSentiment = (label: string): 'positive' | 'negative' | 'neutral' => {
    switch (label) {
      case 'LABEL_2':
        return 'positive';
      case 'LABEL_0':
        return 'negative';
      case 'LABEL_1':
      default:
        return 'neutral';
    }
  };

  const handleAnalyze = async (text: string) => {
    setIsLoading(true);
    try {
      const apiResults = await sentimentService.analyzeSentiment(text);
      const topResult = apiResults[0];
      
      const sentiment = mapApiResponseToSentiment(topResult.label);
      const keywords = sentimentService.extractKeywords(text, sentiment);
      
      const result: SentimentResult = {
        id: Date.now().toString(),
        text,
        sentiment,
        confidence: topResult.score,
        keywords,
        timestamp: new Date(),
        source: 'Direct Input'
      };
      
      setResults(prev => [result, ...prev]);
    } catch (error) {
      console.error('Analysis failed:', error);
      // Create fallback result
      const result: SentimentResult = {
        id: Date.now().toString(),
        text,
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        timestamp: new Date(),
        source: 'Fallback Analysis'
      };
      setResults(prev => [result, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchAnalyze = async (texts: string[]) => {
    setIsLoading(true);
    try {
      const apiResultsArray = await sentimentService.analyzeBatch(texts);
      
      const batchResults: SentimentResult[] = apiResultsArray.map((apiResults, index) => {
        const topResult = apiResults[0];
        const sentiment = mapApiResponseToSentiment(topResult.label);
        const keywords = sentimentService.extractKeywords(texts[index], sentiment);
        
        return {
          id: `${Date.now()}-${index}`,
          text: texts[index],
          sentiment,
          confidence: topResult.score,
          keywords,
          timestamp: new Date(),
          source: 'Batch Analysis'
        };
      });
      
      // Calculate summary
      const summary = {
        total: batchResults.length,
        positive: batchResults.filter(r => r.sentiment === 'positive').length,
        negative: batchResults.filter(r => r.sentiment === 'negative').length,
        neutral: batchResults.filter(r => r.sentiment === 'neutral').length,
        averageConfidence: batchResults.reduce((sum, r) => sum + r.confidence, 0) / batchResults.length
      };
      
      const batchAnalysis: BatchAnalysisResult = {
        id: Date.now().toString(),
        results: batchResults,
        summary,
        timestamp: new Date()
      };
      
      setResults(prev => [...batchResults, ...prev]);
      setBatchResults(prev => [batchAnalysis, ...prev]);
    } catch (error) {
      console.error('Batch analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    switch (format) {
      case 'csv':
        exportToCSV(results);
        break;
      case 'json':
        exportToJSON(results);
        break;
      case 'pdf':
        exportToPDF(results);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Brain className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sentiment Analysis Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Analyze text sentiment with advanced AI models and comprehensive insights
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto space-y-8">
          {/* API Configuration */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <ApiTokenInput onTokenSet={setHasApiToken} />
            </div>
          </div>

          {/* Input Section */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TextInput
                onAnalyze={handleAnalyze}
                onBatchAnalyze={handleBatchAnalyze}
                isLoading={isLoading}
              />
            </div>
            
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 className="text-indigo-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick Stats</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Analyzed:</span>
                  <span className="font-semibold">{results.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Positive:</span>
                  <span className="font-semibold text-green-600">
                    {results.filter(r => r.sentiment === 'positive').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Negative:</span>
                  <span className="font-semibold text-red-600">
                    {results.filter(r => r.sentiment === 'negative').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Neutral:</span>
                  <span className="font-semibold text-gray-600">
                    {results.filter(r => r.sentiment === 'neutral').length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          {results.length > 0 && (
            <SentimentVisualization results={results} batchResults={batchResults} />
          )}

          {/* Comparative Analysis */}
          {results.length > 1 && (
            <ComparativeAnalysis results={results} />
          )}

          {/* Results */}
          <ResultsDisplay results={results} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
}

export default App;