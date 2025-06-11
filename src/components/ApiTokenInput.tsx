import React, { useState } from 'react';
import { Key, Settings, Brain, Zap, Sparkles } from 'lucide-react';
import { SentimentAnalysisService } from '../services/sentimentApi';

interface ApiTokenInputProps {
  onTokenSet: (hasToken: boolean) => void;
}

export const ApiTokenInput: React.FC<ApiTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      const service = SentimentAnalysisService.getInstance();
      service.setApiToken(token.trim());
      setHasValidToken(true);
      onTokenSet(true);
      setIsVisible(false);
    }
  };

  const handleSkip = () => {
    setHasValidToken(true);
    onTokenSet(false);
    setIsVisible(false);
  };

  if (hasValidToken && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
      >
        <Settings size={16} />
        API Settings
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Brain className="text-blue-600" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Enhanced Sentiment Analysis</h3>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-blue-600" size={16} />
          <span className="font-medium text-blue-900">Advanced Local Analysis Engine</span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Advanced text preprocessing with negation handling</li>
          <li>• Training data patterns for superior accuracy</li>
          <li>• Context-aware sentiment detection</li>
          <li>• Enhanced emoji and emoticon recognition</li>
          <li>• Improved keyword extraction with relevance scoring</li>
          <li>• Strong sentiment indicators for precise classification</li>
        </ul>
      </div>
      
      <p className="text-gray-600 mb-4">
        Our enhanced sentiment analysis engine uses sophisticated algorithms and training data patterns 
        to provide highly accurate sentiment classification without requiring external API dependencies.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            API Token (Optional - for future integrations)
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter API token for future features..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            Currently using advanced local analysis. API tokens may be used for future enhancements.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Enhanced Local Analysis Active</span>
          </div>
          <p className="text-xs text-green-700">
            The system uses advanced local sentiment analysis with training data patterns, 
            providing excellent accuracy without external dependencies or rate limits.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Brain size={16} />
            Start Analyzing
          </button>
        </div>
      </form>
    </div>
  );
};