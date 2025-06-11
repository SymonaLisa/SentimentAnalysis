export interface TestDataEntry {
  id: string;
  text: string;
  expectedSentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: string;
}

// Enhanced test data based on the PDF content and additional comprehensive examples
export const sentimentTestData: TestDataEntry[] = [
  // Positive Examples - Easy
  {
    id: 'pos_1',
    text: 'I absolutely love this product! It exceeded all my expectations.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'pos_2',
    text: 'Outstanding customer service and brilliant quality. Highly recommend!',
    expectedSentiment: 'positive',
    category: 'service_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'pos_3',
    text: 'This is exactly what I needed. Perfect solution and great value for money.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'pos_4',
    text: 'Fantastic experience from start to finish. The team was incredibly helpful.',
    expectedSentiment: 'positive',
    category: 'service_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'pos_5',
    text: 'While there were minor issues initially, the final result was amazing.',
    expectedSentiment: 'positive',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'pos_6',
    text: 'Excellent quality and fast delivery. Very satisfied with my purchase.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },
  {
    id: 'pos_7',
    text: 'The staff went above and beyond to help me. Truly exceptional service.',
    expectedSentiment: 'positive',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },
  {
    id: 'pos_8',
    text: 'Beautiful design and works perfectly. Worth every penny!',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  },

  // Negative Examples - Easy
  {
    id: 'neg_1',
    text: 'Terrible experience. Worst customer service I have ever encountered.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'neg_2',
    text: 'Complete waste of money. The product broke after just one day.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'neg_3',
    text: 'Disappointing quality and poor performance. Would not recommend.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'neg_4',
    text: 'The staff was rude and unprofessional. Avoid at all costs.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'neg_5',
    text: 'Not the worst I have seen, but definitely not good enough.',
    expectedSentiment: 'negative',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'neg_6',
    text: 'Horrible experience. The product arrived damaged and customer service was useless.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },
  {
    id: 'neg_7',
    text: 'Overpriced and underdelivered. Very disappointed with this purchase.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  },
  {
    id: 'neg_8',
    text: 'Slow delivery, poor packaging, and the item was not as described.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  },

  // Neutral Examples
  {
    id: 'neu_1',
    text: 'The product is okay. Nothing special but does what it says.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'neu_2',
    text: 'Average service. Met my basic requirements but room for improvement.',
    expectedSentiment: 'neutral',
    category: 'service_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'neu_3',
    text: 'Standard quality as expected. Fair price for what you get.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'neu_4',
    text: 'Mixed feelings about this. Some good points, some bad points.',
    expectedSentiment: 'neutral',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'neu_5',
    text: 'It works fine. Neither impressed nor disappointed.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'neu_6',
    text: 'The service was adequate. Nothing to complain about, nothing to praise.',
    expectedSentiment: 'neutral',
    category: 'service_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  },
  {
    id: 'neu_7',
    text: 'Received the item as described. Standard packaging and delivery time.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },

  // Complex/Challenging Examples
  {
    id: 'complex_1',
    text: 'I was not unhappy with the service, though it could be better.',
    expectedSentiment: 'neutral',
    category: 'service_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'complex_2',
    text: 'The product is not bad, but I would not say it is great either.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'complex_3',
    text: 'Despite the initial problems, I am quite satisfied with the outcome.',
    expectedSentiment: 'positive',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'complex_4',
    text: 'The interface is not intuitive and lacks important features.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'complex_5',
    text: 'Good value for money, though the design could be more modern.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },

  // Sarcasm and Irony
  {
    id: 'sarcasm_1',
    text: 'Oh great, another delay. Just what I needed today.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'sarcasm_2',
    text: 'Sure, waiting 3 hours for a 10-minute appointment is totally reasonable.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'hard',
    source: 'PDF Test Data'
  },
  {
    id: 'sarcasm_3',
    text: 'Wonderful! My order arrived broken. Exactly what I was hoping for.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'hard',
    source: 'Enhanced Dataset'
  },

  // Emotional Context
  {
    id: 'emotion_1',
    text: 'I am thrilled with this purchase! Best decision I made this year.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'PDF Test Data'
  },
  {
    id: 'emotion_2',
    text: 'Feeling frustrated and disappointed with the whole experience.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },
  {
    id: 'emotion_3',
    text: 'Honestly, I am not sure how I feel about this product yet.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'medium',
    source: 'PDF Test Data'
  },

  // Additional challenging cases
  {
    id: 'challenge_1',
    text: 'The product works as advertised, but the customer support could use improvement.',
    expectedSentiment: 'neutral',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'Enhanced Dataset'
  },
  {
    id: 'challenge_2',
    text: 'Not terrible, but certainly not worth the premium price they charge.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'hard',
    source: 'Enhanced Dataset'
  },
  {
    id: 'challenge_3',
    text: 'I expected more issues based on reviews, but it actually works quite well.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'hard',
    source: 'Enhanced Dataset'
  },
  {
    id: 'challenge_4',
    text: 'The delivery was fast, but the product quality is questionable.',
    expectedSentiment: 'neutral',
    category: 'mixed_review',
    difficulty: 'hard',
    source: 'Enhanced Dataset'
  },

  // Short texts
  {
    id: 'short_1',
    text: 'Love it!',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },
  {
    id: 'short_2',
    text: 'Terrible.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },
  {
    id: 'short_3',
    text: 'It\'s okay.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Enhanced Dataset'
  },

  // Longer, detailed reviews
  {
    id: 'detailed_1',
    text: 'After using this product for several months, I can confidently say it has exceeded my expectations in every way. The build quality is exceptional, the customer service team is responsive and helpful, and the value for money is outstanding. I have recommended it to several friends and colleagues, and they have all been equally impressed. This is definitely a company that cares about their customers and stands behind their products.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  },
  {
    id: 'detailed_2',
    text: 'I had high hopes for this product based on the marketing materials and positive reviews, but unfortunately, my experience has been quite disappointing. The product arrived later than promised, the packaging was damaged, and when I tried to contact customer service about the issues, I was put on hold for over an hour. The product itself works, but not as well as advertised, and I feel like I overpaid for what I received.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Enhanced Dataset'
  }
];

export const getTestDataByCategory = (category: string): TestDataEntry[] => {
  return sentimentTestData.filter(entry => entry.category === category);
};

export const getTestDataByDifficulty = (difficulty: string): TestDataEntry[] => {
  return sentimentTestData.filter(entry => entry.difficulty === difficulty);
};

export const getTestDataBySource = (source: string): TestDataEntry[] => {
  return sentimentTestData.filter(entry => entry.source === source);
};

export const getRandomTestSample = (count: number = 5): TestDataEntry[] => {
  const shuffled = [...sentimentTestData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getBalancedTestSample = (count: number = 15): TestDataEntry[] => {
  const perSentiment = Math.floor(count / 3);
  const positive = sentimentTestData.filter(entry => entry.expectedSentiment === 'positive').slice(0, perSentiment);
  const negative = sentimentTestData.filter(entry => entry.expectedSentiment === 'negative').slice(0, perSentiment);
  const neutral = sentimentTestData.filter(entry => entry.expectedSentiment === 'neutral').slice(0, perSentiment);
  
  return [...positive, ...negative, ...neutral].sort(() => 0.5 - Math.random());
};

// Statistics about the test data
export const getTestDataStats = () => {
  const total = sentimentTestData.length;
  const byCategory = {
    product_review: getTestDataByCategory('product_review').length,
    service_review: getTestDataByCategory('service_review').length,
    mixed_review: getTestDataByCategory('mixed_review').length
  };
  const byDifficulty = {
    easy: getTestDataByDifficulty('easy').length,
    medium: getTestDataByDifficulty('medium').length,
    hard: getTestDataByDifficulty('hard').length
  };
  const bySentiment = {
    positive: sentimentTestData.filter(entry => entry.expectedSentiment === 'positive').length,
    negative: sentimentTestData.filter(entry => entry.expectedSentiment === 'negative').length,
    neutral: sentimentTestData.filter(entry => entry.expectedSentiment === 'neutral').length
  };
  const bySource = {
    'PDF Test Data': getTestDataBySource('PDF Test Data').length,
    'Enhanced Dataset': getTestDataBySource('Enhanced Dataset').length
  };

  return {
    total,
    byCategory,
    byDifficulty,
    bySentiment,
    bySource
  };
};