import axios from 'axios';
import { ApiResponse } from '../types/sentiment';

// Multiple model endpoints for ensemble analysis
const SENTIMENT_MODELS = {
  primary: 'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
  secondary: 'https://api-inference.huggingface.co/models/nlptown/bert-base-multilingual-uncased-sentiment',
  tertiary: 'https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base'
};

// Google Gemini API configuration - set to null to prevent rate limiting
const GEMINI_API_KEY = null;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

interface ApiError {
  type: 'network' | 'auth' | 'rate_limit' | 'server' | 'timeout' | 'unknown';
  message: string;
  details?: string;
  retryAfter?: number;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Enhanced training data patterns extracted from the provided dataset
const TRAINING_PATTERNS = {
  positive: {
    phrases: [
      'love this', 'absolutely amazing', 'fantastic experience', 'highly recommend',
      'exceeded expectations', 'brilliant service', 'outstanding quality', 'perfect solution',
      'incredibly helpful', 'wonderful experience', 'great value', 'excellent customer service',
      'top notch', 'five stars', 'best ever', 'amazing quality', 'superb performance',
      'delighted with', 'thrilled about', 'impressed by', 'satisfied with results',
      'works perfectly', 'exactly what needed', 'beyond expectations', 'remarkable improvement',
      'money well spent', 'worth every penny', 'highly satisfied', 'would buy again'
    ],
    words: [
      'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect', 'outstanding', 
      'brilliant', 'superb', 'magnificent', 'delightful', 'awesome', 'great',
      'good', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied',
      'impressive', 'remarkable', 'exceptional', 'marvelous', 'terrific',
      'beautiful', 'stunning', 'incredible', 'phenomenal', 'spectacular',
      'flawless', 'superior', 'premium', 'quality', 'valuable', 'helpful',
      'efficient', 'reliable', 'trustworthy', 'professional', 'friendly',
      'recommend', 'recommend', 'thrilled', 'delighted', 'impressed'
    ],
    intensifiers: ['absolutely', 'extremely', 'incredibly', 'remarkably', 'exceptionally', 'truly', 'genuinely', 'very', 'really', 'quite']
  },
  negative: {
    phrases: [
      'terrible experience', 'worst ever', 'complete waste', 'total disaster',
      'absolutely awful', 'horrible service', 'disappointing quality', 'poor performance',
      'not recommended', 'avoid at all costs', 'money wasted', 'regret buying',
      'broken promises', 'failed expectations', 'useless product', 'terrible support',
      'nightmare experience', 'completely unsatisfied', 'major problems', 'serious issues',
      'does not work', 'falling apart', 'cheap quality', 'overpriced junk',
      'waste of money', 'total failure', 'extremely disappointed', 'never again'
    ],
    words: [
      'terrible', 'awful', 'horrible', 'disgusting', 'disappointing', 'pathetic',
      'atrocious', 'dreadful', 'appalling', 'abysmal', 'bad', 'hate', 'dislike',
      'annoying', 'frustrating', 'useless', 'worthless', 'poor', 'worst',
      'unacceptable', 'inadequate', 'inferior', 'defective', 'faulty',
      'broken', 'damaged', 'unreliable', 'unprofessional', 'rude', 'slow',
      'expensive', 'overpriced', 'cheap', 'flimsy', 'fragile', 'uncomfortable',
      'disappointed', 'regret', 'waste', 'failed', 'disaster', 'nightmare'
    ],
    intensifiers: ['absolutely', 'completely', 'totally', 'utterly', 'extremely', 'incredibly', 'ridiculously', 'very', 'really', 'quite']
  },
  neutral: {
    phrases: [
      'it is okay', 'average quality', 'nothing special', 'as expected',
      'standard service', 'typical experience', 'meets requirements', 'basic functionality',
      'normal performance', 'adequate solution', 'fair price', 'reasonable option',
      'could be better', 'room for improvement', 'mixed feelings', 'pros and cons',
      'neither good nor bad', 'middle of the road', 'so so', 'not bad not great'
    ],
    words: [
      'okay', 'average', 'normal', 'standard', 'typical', 'regular',
      'ordinary', 'common', 'usual', 'basic', 'moderate', 'fair',
      'adequate', 'acceptable', 'reasonable', 'decent', 'sufficient',
      'mediocre', 'mixed', 'neutral', 'balanced', 'expected',
      'fine', 'alright', 'so-so', 'middle', 'standard'
    ]
  },
  // Strong negative indicators that should never be neutral
  strongNegative: [
    'hate', 'terrible', 'awful', 'horrible', 'disgusting', 'pathetic',
    'atrocious', 'dreadful', 'appalling', 'abysmal', 'worst', 'useless',
    'worthless', 'unacceptable', 'disaster', 'nightmare', 'regret',
    'waste', 'failed', 'broken', 'damaged', 'defective', 'faulty'
  ],
  // Strong positive indicators that should never be neutral
  strongPositive: [
    'love', 'excellent', 'amazing', 'wonderful', 'fantastic', 'perfect',
    'outstanding', 'brilliant', 'superb', 'magnificent', 'awesome',
    'incredible', 'phenomenal', 'spectacular', 'flawless', 'exceptional'
  ]
};

export class SentimentAnalysisService {
  private static instance: SentimentAnalysisService;
  private apiToken: string;
  private useEnsemble: boolean = true;
  private useGemini: boolean = true;
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
            message: 'Invalid API token. Please check your API token.',
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

  private async callGeminiAPI(text: string, attempt: number = 1): Promise<ApiResponse[]> {
    try {
      this.validateInput(text);

      const prompt = `Analyze the sentiment of the following text and provide a detailed response in JSON format. 
      
Text: "${text}"

Please respond with a JSON object containing:
1. sentiment: "positive", "negative", or "neutral"
2. confidence: a number between 0 and 1 representing confidence level
3. reasoning: brief explanation of the sentiment classification
4. keywords: array of key words/phrases that influenced the sentiment

Format your response as valid JSON only, no additional text.`;

      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      if (response.status === 200 && response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const geminiText = response.data.candidates[0].content.parts[0].text;
        
        try {
          // Extract JSON from the response
          const jsonMatch = geminiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const geminiResult = JSON.parse(jsonMatch[0]);
            
            // Convert Gemini response to our format
            const sentimentMap: Record<string, string> = {
              'positive': 'LABEL_2',
              'negative': 'LABEL_0',
              'neutral': 'LABEL_1'
            };
            
            const label = sentimentMap[geminiResult.sentiment.toLowerCase()] || 'LABEL_1';
            const confidence = Math.max(0.1, Math.min(1.0, geminiResult.confidence || 0.7));
            
            return [
              { label, score: confidence },
              { label: 'LABEL_1', score: (1 - confidence) * 0.5 },
              { label: label === 'LABEL_2' ? 'LABEL_0' : 'LABEL_2', score: (1 - confidence) * 0.5 }
            ].sort((a, b) => b.score - a.score);
          }
        } catch (parseError) {
          console.warn('Failed to parse Gemini JSON response, using fallback analysis');
        }
      }

      throw new Error('Invalid response format from Gemini API');

    } catch (error) {
      const apiError = this.parseApiError(error);
      
      // Retry logic for certain error types
      if (attempt <= this.retryCount && (apiError.type === 'network' || apiError.type === 'timeout' || apiError.type === 'server')) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        console.warn(`Gemini API call failed (attempt ${attempt}/${this.retryCount}), retrying in ${delay}ms:`, apiError.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callGeminiAPI(text, attempt + 1);
      }

      console.error(`Gemini API call failed:`, apiError);
      throw new Error(apiError.message);
    }
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
      
      // Try Gemini API first for enhanced accuracy (only if API key is available)
      if (this.useGemini && GEMINI_API_KEY) {
        try {
          console.log('Using Gemini API for enhanced sentiment analysis');
          const geminiResult = await this.callGeminiAPI(processedText);
          return geminiResult;
        } catch (geminiError) {
          console.warn('Gemini API failed, falling back to other methods:', geminiError);
        }
      }
      
      // Fallback to Hugging Face APIs if available
      if (this.apiToken && this.apiToken.trim() !== '') {
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
            
            console.warn('All Hugging Face API calls failed, using enhanced fallback analysis:', { primaryError, secondaryError });
          }
        } else {
          // Single model approach
          try {
            return await this.callSentimentAPI(processedText, SENTIMENT_MODELS.primary);
          } catch (error) {
            console.warn('Primary Hugging Face API failed, using enhanced fallback analysis:', error);
          }
        }
      }
      
      // Final fallback to enhanced mock analysis
      console.log('Using enhanced local sentiment analysis');
      return this.getEnhancedMockSentiment(processedText, text);
      
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
    const batchSize = this.useGemini && GEMINI_API_KEY ? 2 : 3; // Smaller batches for Gemini due to potential rate limits
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
          await new Promise(resolve => setTimeout(resolve, this.useGemini && GEMINI_API_KEY ? 3000 : 2000));
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
      // Enhanced mock sentiment analysis with training data patterns
      const features = this.extractTextFeaturesWithTrainingData(processedText, originalText);
      
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
          positiveScore *= 1.4;
        } else {
          negativeScore *= 1.4;
        }
      }
      
      if (features.hasDiminisher) {
        // Reduce sentiment intensity
        positiveScore *= 0.8;
        negativeScore *= 0.8;
        neutralScore *= 1.2;
      }

      // Apply strong sentiment overrides
      if (features.hasStrongNegative) {
        negativeScore *= 2.0;
        neutralScore *= 0.3;
      }
      
      if (features.hasStrongPositive) {
        positiveScore *= 2.0;
        neutralScore *= 0.3;
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

  private extractTextFeaturesWithTrainingData(processedText: string, originalText: string) {
    try {
      const lowerText = originalText.toLowerCase();
      const lowerProcessed = processedText.toLowerCase();
      
      let positiveScore = 0;
      let negativeScore = 0;
      let neutralScore = 0.3; // Base neutral score
      
      // Check for strong sentiment indicators first
      let hasStrongNegative = false;
      let hasStrongPositive = false;
      
      TRAINING_PATTERNS.strongNegative.forEach(word => {
        if (lowerText.includes(word)) {
          hasStrongNegative = true;
          negativeScore += 1.0;
        }
      });
      
      TRAINING_PATTERNS.strongPositive.forEach(word => {
        if (lowerText.includes(word)) {
          hasStrongPositive = true;
          positiveScore += 1.0;
        }
      });
      
      // Enhanced pattern matching using training data
      
      // Check for positive phrases
      TRAINING_PATTERNS.positive.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          positiveScore += 0.8; // Higher weight for phrases
        }
      });
      
      // Check for negative phrases
      TRAINING_PATTERNS.negative.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          negativeScore += 0.8;
        }
      });
      
      // Check for neutral phrases
      TRAINING_PATTERNS.neutral.phrases.forEach(phrase => {
        if (lowerText.includes(phrase)) {
          neutralScore += 0.6;
        }
      });
      
      // Check for positive words with intensifiers
      TRAINING_PATTERNS.positive.words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          let wordScore = matches.length * 0.4;
          
          // Check for intensifiers before the word
          TRAINING_PATTERNS.positive.intensifiers.forEach(intensifier => {
            if (lowerText.includes(`${intensifier} ${word}`)) {
              wordScore *= 1.5;
            }
          });
          
          positiveScore += wordScore;
        }
      });
      
      // Check for negative words with intensifiers
      TRAINING_PATTERNS.negative.words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          let wordScore = matches.length * 0.4;
          
          // Check for intensifiers before the word
          TRAINING_PATTERNS.negative.intensifiers.forEach(intensifier => {
            if (lowerText.includes(`${intensifier} ${word}`)) {
              wordScore *= 1.5;
            }
          });
          
          negativeScore += wordScore;
        }
      });
      
      // Check for neutral words (only if no strong sentiment detected)
      if (!hasStrongNegative && !hasStrongPositive) {
        TRAINING_PATTERNS.neutral.words.forEach(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'g');
          const matches = lowerText.match(regex);
          if (matches) {
            neutralScore += matches.length * 0.3;
          }
        });
      }
      
      // Check for special indicators
      const hasNegation = /NOT_/.test(lowerProcessed);
      const hasIntensifier = /INTENSIFIER_/.test(lowerProcessed);
      const hasDiminisher = /DIMINISHER_/.test(lowerProcessed);
      const hasPositiveEmoji = /POSITIVE_EMOJI|LOVE_EMOJI|POSITIVE_EMOTICON/.test(lowerProcessed);
      const hasNegativeEmoji = /NEGATIVE_EMOJI|ANGER_EMOJI|NEGATIVE_EMOTICON/.test(lowerProcessed);
      const hasExcitement = /EXCITEMENT/.test(lowerProcessed);
      
      // Apply emoji and emoticon weights
      if (hasPositiveEmoji) positiveScore += 0.6;
      if (hasNegativeEmoji) negativeScore += 0.6;
      if (hasExcitement) {
        if (positiveScore > negativeScore) positiveScore += 0.4;
        else negativeScore += 0.4;
      }
      
      // Advanced pattern recognition from training data
      
      // Check for comparison patterns
      if (lowerText.includes('better than') || lowerText.includes('superior to')) {
        positiveScore += 0.3;
      }
      if (lowerText.includes('worse than') || lowerText.includes('inferior to')) {
        negativeScore += 0.3;
      }
      
      // Check for recommendation patterns
      if (lowerText.includes('recommend') || lowerText.includes('suggest')) {
        if (hasNegation) {
          negativeScore += 0.5;
        } else {
          positiveScore += 0.5;
        }
      }
      
      // Check for satisfaction patterns
      if (lowerText.includes('satisfied') || lowerText.includes('pleased')) {
        positiveScore += 0.4;
      }
      if (lowerText.includes('disappointed') || lowerText.includes('unsatisfied')) {
        negativeScore += 0.4;
      }
      
      // Check for quality indicators
      if (lowerText.includes('high quality') || lowerText.includes('premium')) {
        positiveScore += 0.4;
      }
      if (lowerText.includes('low quality') || lowerText.includes('cheap')) {
        negativeScore += 0.4;
      }
      
      // Check for service-related patterns
      if (lowerText.includes('customer service') || lowerText.includes('support')) {
        // Context matters for service mentions
        const serviceContext = lowerText.substring(
          Math.max(0, lowerText.indexOf('service') - 20),
          lowerText.indexOf('service') + 20
        );
        
        if (serviceContext.includes('excellent') || serviceContext.includes('great')) {
          positiveScore += 0.5;
        } else if (serviceContext.includes('poor') || serviceContext.includes('terrible')) {
          negativeScore += 0.5;
        }
      }
      
      return {
        positiveScore,
        negativeScore,
        neutralScore,
        hasNegation,
        hasIntensifier,
        hasDiminisher,
        hasStrongNegative,
        hasStrongPositive
      };
    } catch (error) {
      console.warn('Enhanced feature extraction failed:', error);
      return {
        positiveScore: 0.3,
        negativeScore: 0.3,
        neutralScore: 0.4,
        hasNegation: false,
        hasIntensifier: false,
        hasDiminisher: false,
        hasStrongNegative: false,
        hasStrongPositive: false
      };
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
      
      // Enhanced sentiment-specific keywords using training data
      const sentimentKeywords = {
        positive: TRAINING_PATTERNS.positive.words.concat(
          TRAINING_PATTERNS.positive.phrases.join(' ').split(' ')
        ).filter(word => word.length > 2),
        negative: TRAINING_PATTERNS.negative.words.concat(
          TRAINING_PATTERNS.negative.phrases.join(' ').split(' ')
        ).filter(word => word.length > 2),
        neutral: TRAINING_PATTERNS.neutral.words.concat(
          TRAINING_PATTERNS.neutral.phrases.join(' ').split(' ')
        ).filter(word => word.length > 2)
      };
      
      const relevantWords = words.filter(word => {
        if (stopWords.has(word)) return false;
        
        // Always include strong sentiment words regardless of context
        if (TRAINING_PATTERNS.strongNegative.includes(word) || TRAINING_PATTERNS.strongPositive.includes(word)) {
          return true;
        }
        
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
        
        // Higher score for strong sentiment words
        if (TRAINING_PATTERNS.strongNegative.includes(keyword) || TRAINING_PATTERNS.strongPositive.includes(keyword)) {
          score += 5;
        }
        
        // Higher score for sentiment-specific words
        if (sentimentKeywords[sentiment as keyof typeof sentimentKeywords]?.includes(keyword)) {
          score += 3;
        }
        
        // Score by frequency
        const frequency = words.filter(w => w === keyword).length;
        score += frequency;
        
        // Score by length (longer words often more meaningful)
        score += Math.min(keyword.length / 10, 1);
        
        // Bonus for training data patterns
        const isTrainingPattern = Object.values(TRAINING_PATTERNS).some(pattern => 
          pattern.words?.includes(keyword) || 
          pattern.phrases?.some(phrase => phrase.includes(keyword))
        );
        if (isTrainingPattern) score += 2;
        
        return { keyword, score };
      });
      
      // Return top keywords sorted by score
      return keywordScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map(item => item.keyword)
        .filter(keyword => !keyword.includes('_')); // Remove processed markers
    } catch (error) {
      console.warn('Keyword extraction failed:', error);
      return [];
    }
  }
}