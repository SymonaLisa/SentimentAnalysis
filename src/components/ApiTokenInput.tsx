import React, { useState } from 'react';
import { Key, Settings, Brain, Zap } from 'lucide-react';
import { SentimentAnalysisService } from '../services/sentimentApi';

interface ApiTokenInputProps {
  onTokenSet: (hasToken: boolean) => void;
}

export const ApiTokenInput: React.FC<ApiTokenInputProps> = ({ onTokenSet }) => {
  const [token, setToken] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [useEnsemble, setUseEnsemble] = useState(true);

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
          <Key className="text-blue-600" size={20} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Enhanced API Configuration</h3>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="text-blue-600" size={16} />
          <span className="font-medium text-blue-900">Enhanced Accuracy Features</span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Advanced text preprocessing with negation handling</li>
          <li>• Ensemble analysis using multiple AI models</li>
          <li>• Context-aware sentiment detection</li>
          <li>• Enhanced emoji and emoticon recognition</li>
          <li>• Improved keyword extraction with relevance scoring</li>
        </ul>
      </div>
      
      <p className="text-gray-600 mb-4">
        To use real sentiment analysis with enhanced accuracy features, provide your Hugging Face API token. 
        The system will use ensemble methods and advanced preprocessing for superior results.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            Hugging Face API Token (Optional)
          </label>
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <p className="text-xs text-gray-500 mt-1">
            Get your free token at <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">huggingface.co/settings/tokens</a>
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-600" size={16} />
            <span className="text-sm font-medium text-yellow-800">Enhanced Demo Mode</span>
          </div>
          <p className="text-xs text-yellow-700">
            Even without an API token, our enhanced demo mode provides significantly improved accuracy 
            using advanced preprocessing, context analysis, and sophisticated pattern recognition.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Brain size={16} />
            Enable Enhanced Analysis
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
          >
            Use Enhanced Demo
          </button>
        </div>
      </form>
    </div>
  );
};