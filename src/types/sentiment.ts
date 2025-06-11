export interface SentimentResult {
  id: string;
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  timestamp: Date;
  source?: string;
}

export interface BatchAnalysisResult {
  id: string;
  results: SentimentResult[];
  summary: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
    averageConfidence: number;
  };
  timestamp: Date;
}

export interface ApiResponse {
  label: string;
  score: number;
}