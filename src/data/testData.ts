export interface TestDataEntry {
  id: string;
  text: string;
  expectedSentiment: 'positive' | 'negative' | 'neutral';
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  source?: string;
}

// Comprehensive test data with specified expected responses
export const sentimentTestData: TestDataEntry[] = [
  {
    id: 'test_1',
    text: 'The product is absolutely amazing! I love it so much.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_2',
    text: 'This movie was a complete waste of time, truly disappointing.',
    expectedSentiment: 'negative',
    category: 'entertainment',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_3',
    text: 'The weather today is neither good nor bad, just average.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_4',
    text: 'Customer service was excellent, very helpful and polite.',
    expectedSentiment: 'positive',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_5',
    text: 'I\'m quite frustrated with the constant bugs in this software.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_6',
    text: 'Received the package quickly and it was exactly as described.',
    expectedSentiment: 'neutral',
    category: 'service_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_7',
    text: 'The new policy seems to have a mix of pros and cons.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_8',
    text: 'I couldn\'t believe how rude the staff was, utterly unacceptable.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_9',
    text: 'Enjoyed the concert thoroughly, the band was incredible!',
    expectedSentiment: 'positive',
    category: 'entertainment',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_10',
    text: 'The instructions were unclear, making assembly very difficult.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_11',
    text: 'It\'s okay, nothing special, just does the job.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_12',
    text: 'What a delightful surprise! Highly recommend.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_13',
    text: 'Feeling utterly miserable after that experience.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_14',
    text: 'The presentation was informative and well-structured.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_15',
    text: 'Indifferent about the outcome; it didn\'t really affect me.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_16',
    text: 'This coffee tastes like burnt tires, truly awful.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_17',
    text: 'So happy with my purchase, exceeded all expectations.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_18',
    text: 'There were some minor issues, but nothing major.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_19',
    text: 'My internet connection is consistently terrible these days.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_20',
    text: 'A perfectly adequate solution for basic needs.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_21',
    text: 'The food was good, but the service was slow.',
    expectedSentiment: 'neutral',
    category: 'service_review',
    difficulty: 'hard',
    source: 'Specified Test Data'
  },
  {
    id: 'test_22',
    text: 'I am beyond ecstatic about this new feature!',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_23',
    text: 'Absolutely fuming about the delayed flight.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_24',
    text: 'The colours are vibrant and the design is sleek.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_25',
    text: 'It\'s neither here nor there, just exists.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_26',
    text: 'Worst customer experience ever, will never return.',
    expectedSentiment: 'negative',
    category: 'service_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_27',
    text: 'Fantastic value for money, a definite must-buy.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_28',
    text: 'The meeting was unproductive and boring.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_29',
    text: 'Their response was neither here nor there.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_30',
    text: 'This game is incredibly addictive and fun!',
    expectedSentiment: 'positive',
    category: 'entertainment',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_31',
    text: 'I despise doing laundry on Sundays.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_32',
    text: 'The new update introduces several improvements.',
    expectedSentiment: 'positive',
    category: 'product_review',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_33',
    text: 'It\'s a bit complicated, but manageable.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_34',
    text: 'Such a letdown, completely failed to deliver.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_35',
    text: 'This is a masterpiece of modern art.',
    expectedSentiment: 'positive',
    category: 'entertainment',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_36',
    text: 'Not sure how I feel about it, still processing.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_37',
    text: 'The slow loading times are driving me crazy.',
    expectedSentiment: 'negative',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_38',
    text: 'Overall a solid performance.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_39',
    text: 'It could be better, honestly.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_40',
    text: 'The incessant noise is unbearable.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_41',
    text: 'A truly inspiring speech.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_42',
    text: 'Average quality, nothing to write home about.',
    expectedSentiment: 'neutral',
    category: 'product_review',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_43',
    text: 'That was a truly horrific accident.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_44',
    text: 'Pleased with the outcome.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_45',
    text: 'The results were ambiguous at best.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_46',
    text: 'I\'m fed up with the broken system.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_47',
    text: 'Brilliant! Simply brilliant!',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_48',
    text: 'The situation remains uncertain.',
    expectedSentiment: 'neutral',
    category: 'general',
    difficulty: 'medium',
    source: 'Specified Test Data'
  },
  {
    id: 'test_49',
    text: 'Utter garbage.',
    expectedSentiment: 'negative',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
  },
  {
    id: 'test_50',
    text: 'A ray of sunshine.',
    expectedSentiment: 'positive',
    category: 'general',
    difficulty: 'easy',
    source: 'Specified Test Data'
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
    entertainment: getTestDataByCategory('entertainment').length,
    general: getTestDataByCategory('general').length
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
    'Specified Test Data': getTestDataBySource('Specified Test Data').length
  };

  return {
    total,
    byCategory,
    byDifficulty,
    bySentiment,
    bySource
  };
};