import axios from 'axios';
import { ApiResponse } from '../types/sentiment';

// Multiple model endpoints for ensemble analysis
const SENTIMENT_MODELS = {
  primary: 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
  secondary: 'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
  tertiary: 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base'
};

interface ApiError {
  type: 'network' | 'auth' | 'rate_limit' | 'server' | 'timeout' | 'unknown';
  message: string;
  details?: string;
  retryAfter?: number;
}

export class SentimentAnalysisService {
  private static instance: SentimentAnalysisService;
  private apiToken: string;
  private useEnsemble: boolean = true;
  private retryCount: number = 3;
  private retryDelay: number = 1000; // 1 second base delay

  private constructor() {
    this.apiToken = '';
  }

  public static getInstance(): SentimentAnalysisService {
    if (!SentimentAnalysisService.instance) {
      SentimentAnalysisService.instance = new SentimentAnalysisService();
    }
    return SentimentAnalysisService.instance;
  }

  public setApiToken(token: string): void {
    this.apiToken = token;
  }

  private validateInput(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new Error('Input text is required and must be a string');
    }
    
    if (text.trim().length === 0) {
      throw new Error('Input text cannot be empty');
    }
    
    if (text.length > 10000) {
      throw new Error('Input text is too long (maximum 10,000 characters)');
    }
    
    if (text.trim().length < 3) {
      throw new Error('Input text must be at least 3 characters long');
    }
  }

  private preprocessText(text: string): string {
    try {
      // Enhanced text preprocessing for better accuracy
      let processed = text.trim();
      
      // Handle negations more effectively
      processed = processed.replace(/\b(not|no|never|nothing|nowhere|nobody|none|neither|nor)\s+/gi, 'NOT_');
      
      // Handle intensifiers
      processed = processed.replace(/\b(very|extremely|incredibly|absolutely|totally|completely)\s+/gi, 'INTENSIFIER_');
      
      // Handle diminishers
      processed = processed.replace(/\b(slightly|somewhat|rather|quite|fairly|pretty)\s+/gi, 'DIMINISHER_');
      
      // Handle contractions
      const contractions = {
        "won't": "will not", "can't": "cannot", "n't": " not",
        "'re": " are", "'ve": " have", "'ll": " will", "'d": " would",
        "'m": " am", "it's": "it is", "that's": "that is"
      };
      
      Object.entries(contractions).forEach(([contraction, expansion]) => {
        processed = processed.replace(new RegExp(contraction, 'gi'), expansion);
      });
      
      // Remove excessive punctuation but preserve emotional indicators
      processed = processed.replace(/[!]{2,}/g, ' EXCITEMENT ');
      processed = processed.replace(/[?]{2,}/g, ' CONFUSION ');
      processed = processed.replace(/[.]{3,}/g, ' PAUSE ');
      
      // Handle emojis and emoticons
      const emojiPatterns = {
        '😊|😀|😃|😄|😁|🙂|😌|😍|🥰|😘|🤗': ' POSITIVE_EMOJI ',
        '😢|😭|😞|😔|😟|😕|🙁|☹️|😰|😨': ' NEGATIVE_EMOJI ',
        '😐|😑|🤔|😶|🙄|😏': ' NEUTRAL_EMOJI ',
        '😡|😠|🤬|😤|💢': ' ANGER_EMOJI ',
        '❤️|💕|💖|💗|💝|🧡|💛|💚|💙|💜': ' LOVE_EMOJI '
      };
      
      Object.entries(emojiPatterns).forEach(([pattern, replacement]) => {
        processed = processed.replace(new RegExp(pattern, 'g'), replacement);
      });
      
      // Handle text emoticons
      processed = processed.replace(/:\)|:-\)|:\]|:D|:-D|=\)|=D/g, ' POSITIVE_EMOTICON ');
      processed = processed.replace(/:\(|:-\(|:\[|=\(|D:/g, ' NEGATIVE_EMOTICON ');
      processed = processed.replace(/:\||:-\||=\|/g, ' NEUTRAL_EMOTICON ');
      
      return processed;
    } catch (error) {
      console.warn('Text preprocessing failed, using original text:', error);
      return text.trim();
    }
  }

  private parseApiError(error: any): ApiError {
    if (!error) {
      return { type: 'unknown', message: 'Unknown error occurred' };
    }

    // Network/Connection errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ENETUNREACH') {
      return {
        type: 'network',
        message: 'Network connection failed. Please check your internet connection.',
        details: error.message
      };
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        type: 'timeout',
        message: 'Request timed out. The API is taking too long to respond.',
        details: error.message
      };
    }

    // HTTP Response errors
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 401:
          return {
            type: 'auth',
            message: 'Invalid API token. Please check your Hugging Face API token.',
            details: data?.error || 'Authentication failed'
          };
        
        case 403:
          return {
            type: 'auth',
            message: 'Access forbidden. Your API token may not have the required permissions.',
            details: data?.error || 'Forbidden access'
          };
        
        case 429:
          const retryAfter = error.response.headers['retry-after'];
          return {
            type: 'rate_limit',
            message: 'Rate limit exceeded. Please wait before making more requests.',
            details: data?.error || 'Too many requests',
            retryAfter: retryAfter ? parseInt(retryAfter) : 60
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: 'server',
            message: 'Server error. The API service is temporarily unavailable.',
            details: data?.error || `HTTP ${status} error`
          };
        
        default:
          return {
            type: 'unknown',
            message: `API request failed with status ${status}`,
            details: data?.error || error.message
          };
      }
    }

    // Request setup errors
    if (error.request) {
      return {
        type: 'network',
        message: 'No response received from the API. Please check your connection.',
        details: 'Request was made but no response received'
      };
    }

    // Other errors
    return {
      type: 'unknown',
      message: error.message || 'An unexpected error occurred',
      details: error.toString()
    };
  }

  private async callSentimentAPI(text: string, modelUrl: string, attempt: number = 1): Promise<ApiResponse[]> {
    try {
      this.validateInput(text);

      const response = await axios.post(
        modelUrl,
        { inputs: text },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
          validateStatus: (status) => status < 500, // Don't throw for client errors
        }
      );

      // Handle successful response
      if (response.status === 200 && response.data) {
        const result = Array.isArray(response.data) ? response.data[0] : response.data;
        if (Array.isArray(result) && result.length > 0) {
          return result;
        }
      }

      // Handle model loading (202 status)
      if (response.status === 202) {
        if (attempt <= this.retryCount) {
          const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Model loading, retrying in ${delay}ms (attempt ${attempt}/${this.retryCount})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.callSentimentAPI(text, modelUrl, attempt + 1);
        } else {
          throw new Error('Model is still loading after multiple attempts');
        }
      }

      // Handle other non-200 responses
      throw new Error(`API returned status ${response.status}: ${response.data?.error || 'Unknown error'}`);

    } catch (error) {
      const apiError = this.parseApiError(error);
      
      // Retry logic for certain error types
      if (attempt <= this.retryCount && (apiError.type === 'network' || apiError.type === 'timeout' || apiError.type === 'server')) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`API call failed (attempt ${attempt}/${this.retryCount}), retrying in ${delay}ms:`, apiError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callSentimentAPI(text, modelUrl, attempt + 1);
      }

      // Log the error for debugging
      console.error(`API call failed for ${modelUrl}:`, apiError);
      throw new Error(apiError.message);
    }
  }

  public async analyzeSentiment(text: string): Promise<ApiResponse[]> {
    try {
      this.validateInput(text);
      const processedText = this.preprocessText(text);
      
      if (!this.apiToken || this.apiToken.trim() === '') {
        return this.getEnhancedMockSentiment(processedText, text);
      }

      if (this.useEnsemble) {
        // Ensemble approach using multiple models
        const results = await Promise.allSettled([
          this.callSentimentAPI(processedText, SENTIMENT_MODELS.primary),
          this.callSentimentAPI(processedText, SENTIMENT_MODELS.secondary)
        ]);

        const primaryResult = results[0].status === 'fulfilled' ? results[0].value : null;
        const secondaryResult = results[1].status === 'fulfilled' ? results[1].value : null;

        if (primaryResult && secondaryResult) {
          return this.combineEnsembleResults(primaryResult, secondaryResult);
        } else if (primaryResult) {
          return primaryResult;
        } else if (secondaryResult) {
          return this.normalizeSecondaryModelResults(secondaryResult);
        } else {
          // Both API calls failed, log the errors
          const primaryError = results[0].status === 'rejected' ? results[0].reason : null;
          const secondaryError = results[1].status === 'rejected' ? results[1].reason : null;
          
          console.error('All API calls failed:', { primaryError, secondaryError });
          throw new Error('All sentiment analysis APIs are currently unavailable. Please try again later.');
        }
      } else {
        // Single model approach
        return await this.callSentimentAPI(processedText, SENTIMENT_MODELS.primary);
      }
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      
      // Fallback to enhanced mock analysis with error context
      if (error instanceof Error) {
        console.warn('Falling back to enhanced mock analysis due to:', error.message);
      }
      
      try {
        const processedText = this.preprocessText(text);
        return this.getEnhancedMockSentiment(processedText, text);
      } catch (fallbackError) {
        throw new Error('Sentiment analysis failed and fallback analysis also failed. Please check your input and try again.');
      }
    }
  }

  public async analyzeBatch(texts: string[]): Promise<ApiResponse[][]> {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new Error('Batch analysis requires an array of texts');
    }

    if (texts.length > 100) {
      throw new Error('Batch size too large. Maximum 100 texts allowed');
    }

    const results: ApiResponse[][] = [];
    const errors: { index: number; error: string }[] = [];
    
    // Process in smaller batches to avoid rate limiting and improve reliability
    const batchSize = 3;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      try {
        const batchPromises = batch.map(async (text, batchIndex) => {
          try {
            return await this.analyzeSentiment(text);
          } catch (error) {
            const globalIndex = i + batchIndex;
            errors.push({
              index: globalIndex,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            // Return fallback result for failed analysis
            return this.getEnhancedMockSentiment(this.preprocessText(text), text);
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Longer delay between batches for API stability
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Batch processing failed for batch starting at index ${i}:`, error);
        
        // Add fallback results for the entire failed batch
        for (let j = 0; j < batch.length; j++) {
          const globalIndex = i + j;
          errors.push({
            index: globalIndex,
            error: 'Batch processing failed'
          });
          results.push(this.getEnhancedMockSentiment(this.preprocessText(batch[j]), batch[j]));
        }
      }
    }

    // Log errors if any occurred
    if (errors.length > 0) {
      console.warn(`Batch analysis completed with ${errors.length} errors:`, errors);
    }
    
    return results;
  }

  private combineEnsembleResults(primary: ApiResponse[], secondary: ApiResponse[]): ApiResponse[] {
    try {
      // Combine results from multiple models with weighted averaging
      const combinedScores: Record<string, number> = {
        'LABEL_0': 0, // negative
        'LABEL_1': 0, // neutral
        'LABEL_2': 0  // positive
      };

      // Weight primary model more heavily (70% vs 30%)
      primary.forEach(result => {
        const normalizedLabel = this.normalizeLabelToStandard(result.label);
        if (normalizedLabel) {
          combinedScores[normalizedLabel] += result.score * 0.7;
        }
      });

      secondary.forEach(result => {
        const normalizedLabel = this.normalizeLabelToStandard(result.label);
        if (normalizedLabel) {
          combinedScores[normalizedLabel] += result.score * 0.3;
        }
      });

      // Convert back to array format and sort by score
      return Object.entries(combinedScores)
        .map(([label, score]) => ({ label, score }))
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.warn('Ensemble combination failed, using primary result:', error);
      return primary;
    }
  }

  private normalizeLabelToStandard(label: string): string | null {
    const labelMap: Record<string, string> = {
      'LABEL_0': 'LABEL_0', // negative
      'LABEL_1': 'LABEL_1', // neutral
      'LABEL_2': 'LABEL_2', // positive
      'negative': 'LABEL_0',
      'neutral': 'LABEL_1',
      'positive': 'LABEL_2',
      '1 star': 'LABEL_0',
      '2 stars': 'LABEL_0',
      '3 stars': 'LABEL_1',
      '4 stars': 'LABEL_2',
      '5 stars': 'LABEL_2'
    };
    
    return labelMap[label] || null;
  }

  private normalizeSecondaryModelResults(results: ApiResponse[]): ApiResponse[] {
    try {
      // Convert star ratings to sentiment labels
      return results.map(result => {
        const normalizedLabel = this.normalizeLabelToStandard(result.label);
        return {
          label: normalizedLabel || result.label,
          score: result.score
        };
      }).filter(result => result.label.startsWith('LABEL_'));
    } catch (error) {
      console.warn('Secondary model normalization failed:', error);
      return results;
    }
  }

  private getEnhancedMockSentiment(processedText: string, originalText: string): ApiResponse[] {
    try {
      // Enhanced mock sentiment analysis with better accuracy
      const features = this.extractTextFeatures(processedText, originalText);
      
      let positiveScore = features.positiveScore;
      let negativeScore = features.negativeScore;
      let neutralScore = features.neutralScore;
      
      // Apply context-aware adjustments
      if (features.hasNegation) {
        // Flip sentiment when negation is detected
        const temp = positiveScore;
        positiveScore = negativeScore;
        negativeScore = temp;
      }
      
      if (features.hasIntensifier) {
        // Amplify the dominant sentiment
        if (positiveScore > negativeScore) {
          positiveScore *= 1.3;
        } else {
          negativeScore *= 1.3;
        }
      }
      
      if (features.hasDiminisher) {
        // Reduce sentiment intensity
        positiveScore *= 0.8;
        negativeScore *= 0.8;
        neutralScore *= 1.2;
      }
      
      // Normalize scores
      const total = positiveScore + negativeScore + neutralScore;
      if (total === 0) {
        return [
          { label: 'LABEL_1', score: 0.6 },
          { label: 'LABEL_2', score: 0.25 },
          { label: 'LABEL_0', score: 0.15 }
        ];
      }
      
      const normalizedPositive = positiveScore / total;
      const normalizedNegative = negativeScore / total;
      const normalizedNeutral = neutralScore / total;
      
      return [
        { label: 'LABEL_2', score: normalizedPositive },
        { label: 'LABEL_0', score: normalizedNegative },
        { label: 'LABEL_1', score: normalizedNeutral }
      ].sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Mock sentiment analysis failed:', error);
      // Return default neutral sentiment
      return [
        { label: 'LABEL_1', score: 0.7 },
        { label: 'LABEL_2', score: 0.2 },
        { label: 'LABEL_0', score: 0.1 }
      ];
    }
  }

  private extractTextFeatures(processedText: string, originalText: string) {
    try {
      // Enhanced feature extraction for better sentiment analysis
      const positiveWords = [
        'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 
        'brilliant', 'superb', 'magnificent', 'delightful', 'awesome', 'great',
        'good', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied',
        'impressive', 'remarkable', 'exceptional', 'marvelous', 'terrific'
      ];
      
      const negativeWords = [
        'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'pathetic',
        'atrocious', 'dreadful', 'appalling', 'abysmal', 'bad', 'hate', 'dislike',
        'annoying', 'frustrating', 'useless', 'worthless', 'poor', 'worst',
        'unacceptable', 'inadequate', 'inferior', 'defective', 'faulty'
      ];
      
      const neutralWords = [
        'okay', 'average', 'normal', 'standard', 'typical', 'regular',
        'ordinary', 'common', 'usual', 'basic', 'moderate', 'fair'
      ];
      
      const lowerText = originalText.toLowerCase();
      const lowerProcessed = processedText.toLowerCase();
      
      let positiveScore = 0;
      let negativeScore = 0;
      let neutralScore = 0.3; // Base neutral score
      
      // Count sentiment words with context awareness
      positiveWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          positiveScore += matches.length * 0.4;
        }
      });
      
      negativeWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          negativeScore += matches.length * 0.4;
        }
      });
      
      neutralWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          neutralScore += matches.length * 0.3;
        }
      });
      
      // Check for special indicators
      const hasNegation = /NOT_/.test(lowerProcessed);
      const hasIntensifier = /INTENSIFIER_/.test(lowerProcessed);
      const hasDiminisher = /DIMINISHER_/.test(lowerProcessed);
      const hasPositiveEmoji = /POSITIVE_EMOJI|LOVE_EMOJI|POSITIVE_EMOTICON/.test(lowerProcessed);
      const hasNegativeEmoji = /NEGATIVE_EMOJI|ANGER_EMOJI|NEGATIVE_EMOTICON/.test(lowerProcessed);
      const hasExcitement = /EXCITEMENT/.test(lowerProcessed);
      
      // Apply emoji and emoticon weights
      if (hasPositiveEmoji) positiveScore += 0.5;
      if (hasNegativeEmoji) negativeScore += 0.5;
      if (hasExcitement) {
        if (positiveScore > negativeScore) positiveScore += 0.3;
        else negativeScore += 0.3;
      }
      
      // Sentence structure analysis
      const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 1) {
        // Multi-sentence text - analyze each sentence
        sentences.forEach(sentence => {
          const sentenceScore = this.analyzeSentenceStructure(sentence);
          positiveScore += sentenceScore.positive;
          negativeScore += sentenceScore.negative;
          neutralScore += sentenceScore.neutral;
        });
      }
      
      return {
        positiveScore,
        negativeScore,
        neutralScore,
        hasNegation,
        hasIntensifier,
        hasDiminisher
      };
    } catch (error) {
      console.warn('Feature extraction failed:', error);
      return {
        positiveScore: 0.3,
        negativeScore: 0.3,
        neutralScore: 0.4,
        hasNegation: false,
        hasIntensifier: false,
        hasDiminisher: false
      };
    }
  }

  private analyzeSentenceStructure(sentence: string) {
    try {
      let positive = 0;
      let negative = 0;
      let neutral = 0;
      
      // Look for comparative structures
      if (sentence.includes('better than') || sentence.includes('worse than')) {
        if (sentence.includes('better than')) positive += 0.2;
        if (sentence.includes('worse than')) negative += 0.2;
      }
      
      // Look for conditional statements
      if (sentence.includes('if') || sentence.includes('would')) {
        neutral += 0.1; // Conditional statements are often more neutral
      }
      
      // Look for questions
      if (sentence.includes('?')) {
        neutral += 0.1; // Questions are often neutral
      }
      
      return { positive, negative, neutral };
    } catch (error) {
      return { positive: 0, negative: 0, neutral: 0 };
    }
  }

  public extractKeywords(text: string, sentiment: string): string[] {
    try {
      const processedText = this.preprocessText(text);
      const words = processedText.toLowerCase().split(/\W+/).filter(word => word.length > 2);
      
      const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
        'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
        'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
        'can', 'shall', 'not_', 'intensifier_', 'diminisher_'
      ]);
      
      // Enhanced sentiment-specific keywords
      const sentimentKeywords = {
        positive: [
          'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding',
          'brilliant', 'superb', 'magnificent', 'delightful', 'awesome', 'great',
          'good', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied',
          'impressive', 'remarkable', 'exceptional', 'marvelous', 'terrific',
          'positive_emoji', 'love_emoji', 'positive_emoticon'
        ],
        negative: [
          'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'pathetic',
          'atrocious', 'dreadful', 'appalling', 'abysmal', 'bad', 'hate', 'dislike',
          'annoying', 'frustrating', 'useless', 'worthless', 'poor', 'worst',
          'unacceptable', 'inadequate', 'inferior', 'defective', 'faulty',
          'negative_emoji', 'anger_emoji', 'negative_emoticon'
        ],
        neutral: [
          'okay', 'average', 'normal', 'standard', 'typical', 'regular',
          'ordinary', 'common', 'usual', 'basic', 'moderate', 'fair',
          'neutral_emoji', 'neutral_emoticon'
        ]
      };
      
      const relevantWords = words.filter(word => {
        if (stopWords.has(word)) return false;
        
        // Include sentiment-specific words
        if (sentimentKeywords[sentiment as keyof typeof sentimentKeywords]?.includes(word)) {
          return true;
        }
        
        // Include longer words that might be important
        if (word.length > 4) return true;
        
        // Include words that appear in context with sentiment words
        const wordIndex = words.indexOf(word);
        const context = words.slice(Math.max(0, wordIndex - 2), wordIndex + 3);
        const hasSentimentContext = context.some(contextWord => 
          sentimentKeywords.positive.includes(contextWord) ||
          sentimentKeywords.negative.includes(contextWord) ||
          sentimentKeywords.neutral.includes(contextWord)
        );
        
        return hasSentimentContext;
      });
      
      // Remove duplicates and limit to most relevant keywords
      const uniqueKeywords = [...new Set(relevantWords)];
      
      // Score keywords by relevance and frequency
      const keywordScores = uniqueKeywords.map(keyword => {
        let score = 0;
        
        // Higher score for sentiment-specific words
        if (sentimentKeywords[sentiment as keyof typeof sentimentKeywords]?.includes(keyword)) {
          score += 3;
        }
        
        // Score by frequency
        const frequency = words.filter(w => w === keyword).length;
        score += frequency;
        
        // Score by length (longer words often more meaningful)
        score += Math.min(keyword.length / 10, 1);
        
        return { keyword, score };
      });
      
      // Return top keywords sorted by score
      return keywordScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map(item => item.keyword)
        .filter(keyword => !keyword.includes('_')); // Remove processed markers
    } catch (error) {
      console.warn('Keyword extraction failed:', error);
      return [];
    }
  }
}