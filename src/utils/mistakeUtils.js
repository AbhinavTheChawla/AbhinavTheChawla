// Word corpus for typing tests
export const WORD_CORPUS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having',
  'may', 'should', 'could', 'being', 'does', 'did', 'done', 'doing', 'made', 'makes',
  'find', 'found', 'call', 'called', 'asking', 'work', 'works', 'working', 'feel', 'feeling',
  'try', 'tried', 'trying', 'ask', 'asked', 'need', 'needs', 'needed', 'become', 'becomes',
  'leave', 'left', 'put', 'mean', 'keep', 'let', 'begin', 'seem', 'help', 'talk',
  'turn', 'start', 'might', 'show', 'hear', 'play', 'run', 'move', 'live', 'believe',
  'bring', 'happen', 'write', 'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue',
  'set', 'learn', 'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak',
  'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember',
  'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect', 'build',
  'stay', 'fall', 'cut', 'reach', 'kill', 'remain', 'suggest', 'raise', 'pass', 'sell',
  'require', 'report', 'decide', 'pull', 'break', 'produce', 'explain', 'hope', 'develop', 'carry',
  'great', 'where', 'every', 'much', 'before', 'right', 'too', 'means', 'old', 'any',
  'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'part', 'about', 'place',
  'made', 'live', 'where', 'after', 'back', 'little', 'only', 'round', 'man', 'year',
  'still', 'big', 'found', 'every', 'between', 'name', 'should', 'home', 'thought', 'went',
  'without', 'however', 'around', 'several', 'program', 'against', 'number', 'across', 'social', 'although',
  'head', 'room', 'today', 'until', 'power', 'hour', 'game', 'often', 'run', 'important',
  'against', 'pattern', 'late', 'during', 'less', 'public', 'moment', 'result', 'morning', 'far',
];

// Generate random text from word corpus
export function generateText(wordCount) {
  const words = [];
  for (let i = 0; i < wordCount; i++) {
    words.push(WORD_CORPUS[Math.floor(Math.random() * WORD_CORPUS.length)]);
  }
  return words.join(' ');
}

// Mistake tracking data structure
export class MistakeTracker {
  constructor() {
    this.mistakes = [];
    this.confusionMatrix = new Map();
  }

  recordMistake(expected, actual, position, wordIndex, wasBackspaced, timestamp) {
    const mistake = {
      expected,
      actual,
      position,
      wordIndex,
      wasBackspaced,
      timestamp,
    };

    this.mistakes.push(mistake);
    this.updateConfusionMatrix(expected, actual);
  }

  updateConfusionMatrix(expected, actual) {
    if (!this.confusionMatrix.has(expected)) {
      this.confusionMatrix.set(expected, new Map());
    }

    const actualMap = this.confusionMatrix.get(expected);
    const currentCount = actualMap.get(actual) || 0;
    actualMap.set(actual, currentCount + 1);
  }

  getTopMistakes(limit = 5) {
    const mistakePairs = [];

    this.confusionMatrix.forEach((actualMap, expected) => {
      actualMap.forEach((count, actual) => {
        mistakePairs.push({ expected, actual, count });
      });
    });

    return mistakePairs
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getAllMistakes() {
    return this.mistakes;
  }

  getStats() {
    return {
      totalMistakes: this.mistakes.length,
      backspacedMistakes: this.mistakes.filter(m => m.wasBackspaced).length,
      submittedMistakes: this.mistakes.filter(m => !m.wasBackspaced).length,
      topMistakes: this.getTopMistakes(5),
    };
  }
}

// Drill generation
export function generateDrill(mistakeTracker, wordCount = 25) {
  const topMistakes = mistakeTracker.getTopMistakes(5);

  if (topMistakes.length === 0) {
    // No mistakes - generate random text
    return {
      text: generateText(wordCount),
      targetedMistakes: [],
    };
  }

  // Build word pools for each mistake pattern
  const drillWords = [];
  const targetedMistakes = topMistakes.slice(0, 3);

  targetedMistakes.forEach(({ expected, actual }) => {
    // Find words that contain the expected character
    const relevantWords = WORD_CORPUS.filter(word =>
      word.includes(expected) || (expected === ' ' && word.length > 0)
    );

    // Add words weighted by mistake frequency
    drillWords.push(...relevantWords.slice(0, 5));
  });

  // Fill remaining with random words
  while (drillWords.length < wordCount) {
    drillWords.push(WORD_CORPUS[Math.floor(Math.random() * WORD_CORPUS.length)]);
  }

  // Shuffle and limit
  const shuffled = drillWords
    .sort(() => Math.random() - 0.5)
    .slice(0, wordCount);

  return {
    text: shuffled.join(' '),
    targetedMistakes: targetedMistakes.map(m => ({
      expected: m.expected === ' ' ? 'space' : m.expected,
      actual: m.actual === ' ' ? 'space' : m.actual,
      count: m.count,
    })),
  };
}

// LocalStorage persistence
const STORAGE_KEY = 'typing_test_mistake_history';

export function loadMistakeHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load mistake history:', error);
    return null;
  }
}

export function saveMistakeHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save mistake history:', error);
  }
}

export function updateMistakeHistory(newMistakes) {
  const history = loadMistakeHistory() || {
    confusionMatrix: {},
    totalTests: 0,
    lastUpdated: new Date().toISOString(),
  };

  // Update confusion matrix
  newMistakes.forEach(mistake => {
    const { expected, actual } = mistake;

    if (!history.confusionMatrix[expected]) {
      history.confusionMatrix[expected] = {};
    }

    const currentCount = history.confusionMatrix[expected][actual] || 0;
    history.confusionMatrix[expected][actual] = currentCount + 1;
  });

  history.totalTests += 1;
  history.lastUpdated = new Date().toISOString();

  saveMistakeHistory(history);
  return history;
}

export function getHistoricalTopMistakes(limit = 5) {
  const history = loadMistakeHistory();
  if (!history) return [];

  const mistakePairs = [];

  Object.entries(history.confusionMatrix).forEach(([expected, actualMap]) => {
    Object.entries(actualMap).forEach(([actual, count]) => {
      mistakePairs.push({
        expected: expected === ' ' ? 'space' : expected,
        actual: actual === ' ' ? 'space' : actual,
        count
      });
    });
  });

  return mistakePairs
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function clearMistakeHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear mistake history:', error);
    return false;
  }
}

// Calculate WPM
export function calculateWPM(charCount, timeInSeconds) {
  if (timeInSeconds === 0 || timeInSeconds < 0.1) return 0;
  const minutes = timeInSeconds / 60;
  const wpm = (charCount / 5) / minutes;
  return Math.round(isFinite(wpm) ? wpm : 0);
}

// Calculate accuracy
export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars === 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

// Calculate consistency (standard deviation of WPM over time)
export function calculateConsistency(wpmHistory) {
  if (wpmHistory.length === 0) return 100;

  const mean = wpmHistory.reduce((sum, wpm) => sum + wpm, 0) / wpmHistory.length;
  const variance = wpmHistory.reduce((sum, wpm) => sum + Math.pow(wpm - mean, 2), 0) / wpmHistory.length;
  const stdDev = Math.sqrt(variance);

  // Convert to consistency percentage (lower stdDev = higher consistency)
  const consistency = Math.max(0, 100 - (stdDev * 2));
  return Math.round(consistency);
}
