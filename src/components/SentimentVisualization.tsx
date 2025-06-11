import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { SentimentResult, BatchAnalysisResult } from '../types/sentiment';

interface SentimentVisualizationProps {
  results: SentimentResult[];
  batchResults?: BatchAnalysisResult[];
}

export const SentimentVisualization: React.FC<SentimentVisualizationProps> = ({ results, batchResults }) => {
  const sentimentCounts = results.reduce((acc, result) => {
    acc[result.sentiment] = (acc[result.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = [
    { name: 'Positive', value: sentimentCounts.positive || 0, color: '#10B981' },
    { name: 'Negative', value: sentimentCounts.negative || 0, color: '#EF4444' },
    { name: 'Neutral', value: sentimentCounts.neutral || 0, color: '#6B7280' },
  ].filter(item => item.value > 0);

  const confidenceData = results.map((result, index) => ({
    id: index + 1,
    confidence: Math.round(result.confidence * 100),
    sentiment: result.sentiment,
  }));

  const averageConfidence = results.length > 0 
    ? results.reduce((sum, result) => sum + result.confidence, 0) / results.length 
    : 0;

  if (results.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <p className="text-gray-500">No analysis results to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Analysis Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{sentimentCounts.positive || 0}</div>
            <div className="text-sm text-green-700">Positive</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600">{sentimentCounts.negative || 0}</div>
            <div className="text-sm text-red-700">Negative</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-600">{sentimentCounts.neutral || 0}</div>
            <div className="text-sm text-gray-700">Neutral</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{Math.round(averageConfidence * 100)}%</div>
            <div className="text-sm text-blue-700">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Confidence Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Confidence Scores</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="id" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`, 
                  `Confidence (${props.payload.sentiment})`
                ]} 
              />
              <Bar 
                dataKey="confidence" 
                fill={(entry) => {
                  switch (entry.sentiment) {
                    case 'positive': return '#10B981';
                    case 'negative': return '#EF4444';
                    default: return '#6B7280';
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Batch Analysis Summary */}
      {batchResults && batchResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Batch Analysis History</h4>
          <div className="space-y-3">
            {batchResults.map((batch) => (
              <div key={batch.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-medium text-gray-900">{batch.results.length} texts analyzed</h5>
                  <span className="text-sm text-gray-500">
                    {batch.timestamp.toLocaleDateString()} {batch.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-green-600 font-medium">{batch.summary.positive}</span>
                    <span className="text-gray-500"> positive</span>
                  </div>
                  <div>
                    <span className="text-red-600 font-medium">{batch.summary.negative}</span>
                    <span className="text-gray-500"> negative</span>
                  </div>
                  <div>
                    <span className="text-gray-600 font-medium">{batch.summary.neutral}</span>
                    <span className="text-gray-500"> neutral</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-medium">{Math.round(batch.summary.averageConfidence * 100)}%</span>
                    <span className="text-gray-500"> confidence</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};