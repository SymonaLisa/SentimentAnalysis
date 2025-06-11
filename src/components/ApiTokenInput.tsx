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
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="text-purple-600" size={16} />
          <span className="font-medium text-purple-900">Google Gemini AI Integration</span>
        </div>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Google Gemini 1.5 Flash for superior accuracy</li>
          <li>• Advanced context understanding and reasoning</li>
          <li>• Multi-model ensemble analysis for best results</li>
          <li>• Fallback to Hugging Face models when needed</li>
          <li>• Enhanced local analysis with training data patterns</li>
        </ul>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="text-blue-600" size={16} />
          <span className="font-medium text-blue-900">Enhanced Accuracy Features</span>
        </div>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Advanced text preprocessing with negation handling</li>
          <li>• Context-aware sentiment detection with training data</li>
          <li>• Enhanced emoji and emoticon recognition</li>
          <li>• Improved keyword extraction with relevance scoring</li>
          <li>• Strong sentiment indicators for precise classification</li>
        </ul>
      </div>
      
      <p className="text-gray-600 mb-4">
        The system now uses Google Gemini AI for the highest accuracy sentiment analysis. 
        You can optionally provide your Hugging Face API token for additional model ensemble analysis.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            Hugging Face API Token (Optional - for ensemble analysis)
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

        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="text-green-600" size={16} />
            <span className="text-sm font-medium text-green-800">Google Gemini AI Active</span>
          </div>
          <p className="text-xs text-green-700">
            The system is now powered by Google Gemini 1.5 Flash for the most accurate sentiment analysis available. 
            Advanced reasoning and context understanding provide superior results compared to traditional models.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Enable Gemini + Ensemble
          </button>
          <button
            type="button"
            onClick={handleSkip}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <Brain size={16} />
            Use Gemini AI Only
          </button>
        </div>
      </form>
    </div>
  );
};