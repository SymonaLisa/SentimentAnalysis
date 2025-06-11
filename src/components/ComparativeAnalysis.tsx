import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, GitCompare, Info, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { SentimentResult } from '../types/sentiment';

interface ComparativeAnalysisProps {
  results: SentimentResult[];
}

interface ComparisonGroup {
  id: string;
  name: string;
  results: SentimentResult[];
  averageConfidence: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ results }) => {
  const [selectedComparison, setSelectedComparison] = useState<'source' | 'time' | 'confidence' | 'length'>('source');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (results.length < 2) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <GitCompare size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Comparative Analysis</h3>
        <p className="text-gray-500">Need at least 2 results to perform comparative analysis</p>
      </div>
    );
  }

  const createComparisonGroups = (): ComparisonGroup[] => {
    switch (selectedComparison) {
      case 'source':
        return groupBySource();
      case 'time':
        return groupByTime();
      case 'confidence':
        return groupByConfidence();
      case 'length':
        return groupByLength();
      default:
        return [];
    }
  };

  const groupBySource = (): ComparisonGroup[] => {
    const sourceGroups = results.reduce((acc, result) => {
      const source = result.source || 'Direct Input';
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(result);
      return acc;
    }, {} as Record<string, SentimentResult[]>);

    return Object.entries(sourceGroups).map(([source, groupResults]) => ({
      id: source,
      name: source,
      results: groupResults,
      averageConfidence: groupResults.reduce((sum, r) => sum + r.confidence, 0) / groupResults.length,
      sentimentDistribution: {
        positive: groupResults.filter(r => r.sentiment === 'positive').length,
        negative: groupResults.filter(r => r.sentiment === 'negative').length,
        neutral: groupResults.filter(r => r.sentiment === 'neutral').length,
      }
    }));
  };

  const groupByTime = (): ComparisonGroup[] => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const timeGroups = {
      'Last Hour': results.filter(r => r.timestamp > oneHourAgo),
      'Last 24 Hours': results.filter(r => r.timestamp > oneDayAgo && r.timestamp <= oneHourAgo),
      'Older': results.filter(r => r.timestamp <= oneDayAgo)
    };

    return Object.entries(timeGroups)
      .filter(([, groupResults]) => groupResults.length > 0)
      .map(([period, groupResults]) => ({
        id: period,
        name: period,
        results: groupResults,
        averageConfidence: groupResults.reduce((sum, r) => sum + r.confidence, 0) / groupResults.length,
        sentimentDistribution: {
          positive: groupResults.filter(r => r.sentiment === 'positive').length,
          negative: groupResults.filter(r => r.sentiment === 'negative').length,
          neutral: groupResults.filter(r => r.sentiment === 'neutral').length,
        }
      }));
  };

  const groupByConfidence = (): ComparisonGroup[] => {
    const confidenceGroups = {
      'High Confidence (80%+)': results.filter(r => r.confidence >= 0.8),
      'Medium Confidence (60-79%)': results.filter(r => r.confidence >= 0.6 && r.confidence < 0.8),
      'Low Confidence (<60%)': results.filter(r => r.confidence < 0.6)
    };

    return Object.entries(confidenceGroups)
      .filter(([, groupResults]) => groupResults.length > 0)
      .map(([range, groupResults]) => ({
        id: range,
        name: range,
        results: groupResults,
        averageConfidence: groupResults.reduce((sum, r) => sum + r.confidence, 0) / groupResults.length,
        sentimentDistribution: {
          positive: groupResults.filter(r => r.sentiment === 'positive').length,
          negative: groupResults.filter(r => r.sentiment === 'negative').length,
          neutral: groupResults.filter(r => r.sentiment === 'neutral').length,
        }
      }));
  };

  const groupByLength = (): ComparisonGroup[] => {
    const lengthGroups = {
      'Short (< 50 chars)': results.filter(r => r.text.length < 50),
      'Medium (50-200 chars)': results.filter(r => r.text.length >= 50 && r.text.length < 200),
      'Long (200+ chars)': results.filter(r => r.text.length >= 200)
    };

    return Object.entries(lengthGroups)
      .filter(([, groupResults]) => groupResults.length > 0)
      .map(([range, groupResults]) => ({
        id: range,
        name: range,
        results: groupResults,
        averageConfidence: groupResults.reduce((sum, r) => sum + r.confidence, 0) / groupResults.length,
        sentimentDistribution: {
          positive: groupResults.filter(r => r.sentiment === 'positive').length,
          negative: groupResults.filter(r => r.sentiment === 'negative').length,
          neutral: groupResults.filter(r => r.sentiment === 'neutral').length,
        }
      }));
  };

  const comparisonGroups = createComparisonGroups();

  const chartData = comparisonGroups.map(group => ({
    name: group.name,
    positive: group.sentimentDistribution.positive,
    negative: group.sentimentDistribution.negative,
    neutral: group.sentimentDistribution.neutral,
    confidence: Math.round(group.averageConfidence * 100),
    total: group.results.length
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <GitCompare className="text-indigo-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Comparative Analysis</h3>
        </div>

        {/* Comparison Type Selector */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'source', label: 'By Source', icon: '📊' },
            { key: 'time', label: 'By Time', icon: '⏰' },
            { key: 'confidence', label: 'By Confidence', icon: '🎯' },
            { key: 'length', label: 'By Text Length', icon: '📏' }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setSelectedComparison(key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedComparison === key
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="positive" stackId="a" fill="#10B981" name="Positive" />
              <Bar dataKey="neutral" stackId="a" fill="#6B7280" name="Neutral" />
              <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Group Analysis */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">Detailed Group Analysis</h4>
          {comparisonGroups.map((group) => (
            <div key={group.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <h5 className="font-medium text-gray-900">{group.name}</h5>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{group.results.length} texts</span>
                    <span>{Math.round(group.averageConfidence * 100)}% avg confidence</span>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span>{group.sentimentDistribution.positive}</span>
                      <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                      <span>{group.sentimentDistribution.neutral}</span>
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span>{group.sentimentDistribution.negative}</span>
                    </div>
                  </div>
                </div>
                {expandedGroup === group.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              
              {expandedGroup === group.id && (
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="font-medium text-gray-900 mb-2">Key Insights</h6>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Most common sentiment: {
                          Object.entries(group.sentimentDistribution)
                            .sort(([,a], [,b]) => b - a)[0][0]
                        }</li>
                        <li>• Confidence range: {
                          Math.round(Math.min(...group.results.map(r => r.confidence)) * 100)
                        }% - {
                          Math.round(Math.max(...group.results.map(r => r.confidence)) * 100)
                        }%</li>
                        <li>• Average text length: {
                          Math.round(group.results.reduce((sum, r) => sum + r.text.length, 0) / group.results.length)
                        } characters</li>
                        <li>• Most common keywords: {
                          (() => {
                            const keywordCounts = group.results
                              .flatMap(r => r.keywords)
                              .reduce((acc, keyword) => {
                                acc[keyword] = (acc[keyword] || 0) + 1;
                                return acc;
                              }, {} as Record<string, number>);
                            
                            return Object.entries(keywordCounts)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 3)
                              .map(([keyword]) => keyword)
                              .join(', ');
                          })()
                        }</li>
                      </ul>
                    </div>
                    <div>
                      <h6 className="font-medium text-gray-900 mb-2">Sample Texts</h6>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {group.results.slice(0, 3).map((result, index) => (
                          <div key={index} className="text-xs bg-white p-2 rounded border">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-1 rounded text-xs ${
                                result.sentiment === 'positive' ? 'bg-green-100 text-green-700' :
                                result.sentiment === 'negative' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {result.sentiment}
                              </span>
                              <span className="text-gray-500">{Math.round(result.confidence * 100)}%</span>
                            </div>
                            <p className="text-gray-700 line-clamp-2">{result.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};