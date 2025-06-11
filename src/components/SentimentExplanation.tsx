import React, { useState } from 'react';
import { Info, Eye, Brain, Target, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { SentimentResult } from '../types/sentiment';
import { SentimentAnalysisService } from '../services/sentimentApi';

interface SentimentExplanationProps {
  result: SentimentResult;
}

interface ExplanationDetails {
  overallReasoning: string;
  keyFactors: {
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
    explanation: string;
  }[];
  textFeatures: {
    feature: string;
    value: string | number;
    significance: string;
  }[];
  confidenceFactors: {
    factor: string;
    contribution: number;
    explanation: string;
  }[];
  alternativeInterpretations?: {
    sentiment: 'positive' | 'negative' | 'neutral';
    probability: number;
    reasoning: string;
  }[];
}

export const SentimentExplanation: React.FC<SentimentExplanationProps> = ({ result }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [explanation, setExplanation] = useState<ExplanationDetails | null>(null);

  const generateExplanation = (): ExplanationDetails => {
    const service = SentimentAnalysisService.getInstance();
    const text = result.text.toLowerCase();
    const keywords = result.keywords;
    
    // Analyze text features
    const textLength = result.text.length;
    const wordCount = result.text.split(/\s+/).length;
    const avgWordLength = result.text.replace(/\s+/g, '').length / wordCount;
    const punctuationCount = (result.text.match(/[!?.,;:]/g) || []).length;
    const exclamationCount = (result.text.match(/!/g) || []).length;
    const questionCount = (result.text.match(/\?/g) || []).length;
    const capsCount = (result.text.match(/[A-Z]/g) || []).length;
    
    // Detect sentiment indicators
    const positiveWords = [
      'love', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding',
      'brilliant', 'superb', 'great', 'good', 'happy', 'pleased', 'satisfied', 'recommend'
    ];
    const negativeWords = [
      'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'pathetic',
      'bad', 'worst', 'annoying', 'frustrated', 'useless', 'poor', 'disappointed'
    ];
    const neutralWords = [
      'okay', 'average', 'normal', 'standard', 'typical', 'regular', 'ordinary', 'fine'
    ];
    
    const foundPositive = positiveWords.filter(word => text.includes(word));
    const foundNegative = negativeWords.filter(word => text.includes(word));
    const foundNeutral = neutralWords.filter(word => text.includes(word));
    
    // Detect modifiers
    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely'];
    const diminishers = ['slightly', 'somewhat', 'rather', 'quite', 'fairly', 'pretty'];
    const negations = ['not', 'no', 'never', 'nothing', 'nowhere', 'nobody', 'none'];
    
    const foundIntensifiers = intensifiers.filter(word => text.includes(word));
    const foundDiminishers = diminishers.filter(word => text.includes(word));
    const foundNegations = negations.filter(word => text.includes(word));
    
    // Generate key factors
    const keyFactors: ExplanationDetails['keyFactors'] = [];
    
    if (foundPositive.length > 0) {
      keyFactors.push({
        factor: 'Positive Language',
        impact: 'positive',
        weight: foundPositive.length * 0.3,
        explanation: `Found positive words: ${foundPositive.join(', ')}. These words strongly indicate positive sentiment.`
      });
    }
    
    if (foundNegative.length > 0) {
      keyFactors.push({
        factor: 'Negative Language',
        impact: 'negative',
        weight: foundNegative.length * 0.3,
        explanation: `Found negative words: ${foundNegative.join(', ')}. These words strongly indicate negative sentiment.`
      });
    }
    
    if (foundNeutral.length > 0) {
      keyFactors.push({
        factor: 'Neutral Language',
        impact: 'neutral',
        weight: foundNeutral.length * 0.2,
        explanation: `Found neutral words: ${foundNeutral.join(', ')}. These words suggest a balanced or neutral tone.`
      });
    }
    
    if (foundIntensifiers.length > 0) {
      keyFactors.push({
        factor: 'Intensifiers',
        impact: result.sentiment,
        weight: foundIntensifiers.length * 0.2,
        explanation: `Found intensifiers: ${foundIntensifiers.join(', ')}. These words amplify the sentiment expressed.`
      });
    }
    
    if (foundNegations.length > 0) {
      keyFactors.push({
        factor: 'Negations',
        impact: result.sentiment === 'positive' ? 'negative' : 'positive',
        weight: foundNegations.length * 0.25,
        explanation: `Found negations: ${foundNegations.join(', ')}. These words can flip or modify the sentiment.`
      });
    }
    
    if (exclamationCount > 0) {
      keyFactors.push({
        factor: 'Exclamation Marks',
        impact: result.sentiment,
        weight: Math.min(exclamationCount * 0.1, 0.3),
        explanation: `${exclamationCount} exclamation mark(s) found. This suggests emotional intensity or emphasis.`
      });
    }
    
    if (keywords.length > 0) {
      keyFactors.push({
        factor: 'Key Terms',
        impact: result.sentiment,
        weight: keywords.length * 0.1,
        explanation: `Identified key terms: ${keywords.slice(0, 5).join(', ')}. These terms are contextually relevant to the sentiment.`
      });
    }
    
    // Generate text features
    const textFeatures: ExplanationDetails['textFeatures'] = [
      {
        feature: 'Text Length',
        value: `${textLength} characters`,
        significance: textLength < 50 ? 'Short texts may have less context for analysis' :
                    textLength > 200 ? 'Longer texts provide more context for accurate analysis' :
                    'Moderate length provides good context for analysis'
      },
      {
        feature: 'Word Count',
        value: wordCount,
        significance: `${wordCount} words provide ${wordCount < 10 ? 'limited' : wordCount > 50 ? 'extensive' : 'adequate'} context`
      },
      {
        feature: 'Punctuation Density',
        value: `${Math.round((punctuationCount / textLength) * 100)}%`,
        significance: punctuationCount > textLength * 0.1 ? 'High punctuation may indicate emotional expression' :
                     'Normal punctuation usage'
      }
    ];
    
    if (capsCount > 0) {
      textFeatures.push({
        feature: 'Capital Letters',
        value: `${capsCount} (${Math.round((capsCount / result.text.length) * 100)}%)`,
        significance: capsCount > result.text.length * 0.2 ? 'High caps usage may indicate emphasis or strong emotion' :
                     'Normal capitalization'
      });
    }
    
    // Generate confidence factors
    const confidenceFactors: ExplanationDetails['confidenceFactors'] = [
      {
        factor: 'Sentiment Word Strength',
        contribution: Math.min((foundPositive.length + foundNegative.length) * 0.2, 0.4),
        explanation: `Strong sentiment words provide clear indicators for classification`
      },
      {
        factor: 'Text Length Adequacy',
        contribution: textLength > 20 ? 0.2 : 0.1,
        explanation: textLength > 20 ? 'Sufficient text length for reliable analysis' : 'Short text may limit analysis accuracy'
      },
      {
        factor: 'Context Clarity',
        contribution: keywords.length > 2 ? 0.2 : 0.1,
        explanation: keywords.length > 2 ? 'Clear contextual indicators present' : 'Limited contextual information'
      }
    ];
    
    if (foundNegations.length === 0) {
      confidenceFactors.push({
        factor: 'No Negations',
        contribution: 0.15,
        explanation: 'Absence of negations makes sentiment interpretation more straightforward'
      });
    }
    
    // Generate overall reasoning
    const overallReasoning = generateOverallReasoning(result, keyFactors, textFeatures);
    
    // Generate alternative interpretations
    const alternativeInterpretations = generateAlternativeInterpretations(result, keyFactors);
    
    return {
      overallReasoning,
      keyFactors,
      textFeatures,
      confidenceFactors,
      alternativeInterpretations
    };
  };
  
  const generateOverallReasoning = (
    result: SentimentResult, 
    keyFactors: ExplanationDetails['keyFactors'],
    textFeatures: ExplanationDetails['textFeatures']
  ): string => {
    const dominantFactors = keyFactors
      .filter(f => f.weight > 0.2)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
    
    let reasoning = `This text was classified as ${result.sentiment} with ${Math.round(result.confidence * 100)}% confidence. `;
    
    if (dominantFactors.length > 0) {
      reasoning += `The primary factors influencing this classification were: `;
      reasoning += dominantFactors.map(f => f.factor.toLowerCase()).join(', ');
      reasoning += '. ';
    }
    
    const textLength = result.text.length;
    if (textLength < 30) {
      reasoning += `The relatively short text length may limit the depth of analysis, but clear sentiment indicators were still identified. `;
    } else if (textLength > 200) {
      reasoning += `The substantial text length provides rich context for accurate sentiment analysis. `;
    }
    
    if (result.confidence > 0.8) {
      reasoning += `The high confidence score indicates strong and clear sentiment indicators in the text.`;
    } else if (result.confidence < 0.6) {
      reasoning += `The moderate confidence score suggests some ambiguity or mixed sentiment indicators in the text.`;
    } else {
      reasoning += `The confidence score reflects a balanced assessment of the sentiment indicators present.`;
    }
    
    return reasoning;
  };
  
  const generateAlternativeInterpretations = (
    result: SentimentResult,
    keyFactors: ExplanationDetails['keyFactors']
  ): ExplanationDetails['alternativeInterpretations'] => {
    const alternatives: ExplanationDetails['alternativeInterpretations'] = [];
    
    // Calculate alternative probabilities based on key factors
    const sentimentScores = { positive: 0, negative: 0, neutral: 0 };
    
    keyFactors.forEach(factor => {
      sentimentScores[factor.impact] += factor.weight;
    });
    
    const total = Object.values(sentimentScores).reduce((sum, score) => sum + score, 0);
    
    if (total > 0) {
      Object.entries(sentimentScores).forEach(([sentiment, score]) => {
        if (sentiment !== result.sentiment && score > 0) {
          const probability = (score / total) * (1 - result.confidence);
          if (probability > 0.1) {
            alternatives.push({
              sentiment: sentiment as 'positive' | 'negative' | 'neutral',
              probability,
              reasoning: `Alternative interpretation based on ${sentiment} indicators found in the text`
            });
          }
        }
      });
    }
    
    return alternatives.sort((a, b) => b.probability - a.probability);
  };

  const handleToggleExplanation = () => {
    if (!isExpanded && !explanation) {
      setExplanation(generateExplanation());
    }
    setIsExpanded(!isExpanded);
  };

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral') => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={handleToggleExplanation}
        className="w-full p-3 text-left hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-blue-600" />
          <span className="text-sm font-medium text-gray-900">Why this sentiment?</span>
          <span className="text-xs text-gray-500">Click to explain</span>
        </div>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      
      {isExpanded && explanation && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
          {/* Overall Reasoning */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-yellow-600" />
              <h4 className="font-medium text-gray-900">Overall Analysis</h4>
            </div>
            <p className="text-sm text-gray-700 bg-white p-3 rounded border">
              {explanation.overallReasoning}
            </p>
          </div>

          {/* Key Factors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-purple-600" />
              <h4 className="font-medium text-gray-900">Key Factors</h4>
            </div>
            <div className="space-y-2">
              {explanation.keyFactors.map((factor, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(factor.impact)}`}>
                        {factor.impact}
                      </span>
                      <span className="text-xs text-gray-500">
                        Weight: {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{factor.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Text Features */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Eye size={16} className="text-green-600" />
              <h4 className="font-medium text-gray-900">Text Features</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {explanation.textFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-2 rounded border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900">{feature.feature}</span>
                    <span className="text-sm text-gray-600">{feature.value}</span>
                  </div>
                  <p className="text-xs text-gray-500">{feature.significance}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Factors */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Info size={16} className="text-blue-600" />
              <h4 className="font-medium text-gray-900">Confidence Factors</h4>
            </div>
            <div className="space-y-1">
              {explanation.confidenceFactors.map((factor, index) => (
                <div key={index} className="bg-white p-2 rounded border flex justify-between items-center">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                    <p className="text-xs text-gray-600">{factor.explanation}</p>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    +{Math.round(factor.contribution * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Interpretations */}
          {explanation.alternativeInterpretations && explanation.alternativeInterpretations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={16} className="text-orange-600" />
                <h4 className="font-medium text-gray-900">Alternative Interpretations</h4>
              </div>
              <div className="space-y-1">
                {explanation.alternativeInterpretations.map((alt, index) => (
                  <div key={index} className="bg-white p-2 rounded border">
                    <div className="flex justify-between items-center mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(alt.sentiment)}`}>
                        {alt.sentiment}
                      </span>
                      <span className="text-sm text-gray-600">
                        {Math.round(alt.probability * 100)}% likelihood
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{alt.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};