import React, { useState, useEffect, useRef } from 'react';
import { Clock, Hash, RotateCcw, Trash2, History } from 'lucide-react';
import TypingTestCore from './TypingTestCore';
import ResultsScreen from './ResultsScreen';
import {
  generateText,
  generateDrill,
  MistakeTracker,
  updateMistakeHistory,
  getHistoricalTopMistakes,
  clearMistakeHistory,
  saveTestResult,
  loadTestHistory,
  clearTestHistory,
} from '../utils/mistakeUtils';

const TypingTest = () => {
  const [mode, setMode] = useState({ type: 'timed', value: 30 });
  const [testState, setTestState] = useState('setup'); // setup, testing, results, drill
  const [targetText, setTargetText] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [drillData, setDrillData] = useState(null);
  const [historicalMistakes, setHistoricalMistakes] = useState([]);
  const [testHistory, setTestHistory] = useState([]);

  const testCoreRef = useRef(null);

  // Load historical mistakes and test history on mount
  useEffect(() => {
    const mistakes = getHistoricalTopMistakes(5);
    setHistoricalMistakes(mistakes);

    const history = loadTestHistory();
    setTestHistory(history);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Tab or Tab+Enter to restart
      if (e.key === 'Tab') {
        e.preventDefault();
        if (testState === 'testing' || testState === 'results') {
          startNewTest();
        }
      }

      // Esc to reset/go to setup
      if (e.key === 'Escape') {
        e.preventDefault();
        setTestState('setup');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [testState, mode]);

  const startNewTest = (sameText = false) => {
    if (!sameText) {
      const wordCount = mode.type === 'words' ? mode.value : 100;
      setTargetText(generateText(wordCount));
    }

    setTestState('testing');
    setTestResults(null);
    setDrillData(null);
  };

  const handleTestComplete = (results) => {
    // Update mistake history in localStorage
    updateMistakeHistory(results.mistakes);

    // Update historical mistakes display
    const mistakes = getHistoricalTopMistakes(5);
    setHistoricalMistakes(mistakes);

    // Save test result to history
    const modeString = mode.type === 'timed' ? `${mode.value}s` : `${mode.value} words`;
    saveTestResult({
      ...results,
      mode: modeString,
    });

    // Reload test history
    const history = loadTestHistory();
    setTestHistory(history);

    setTestResults(results);
    setTestState('results');
  };

  const handleGenerateDrill = () => {
    if (!testResults) return;

    // Create MistakeTracker from results
    const tracker = new MistakeTracker();
    testResults.mistakes.forEach(m => {
      tracker.recordMistake(m.expected, m.actual, m.position, m.wordIndex, m.wasBackspaced, m.timestamp);
    });

    const drill = generateDrill(tracker, 30);
    setDrillData(drill);
    setTargetText(drill.text);
    setTestState('drill');
  };

  const handleRetry = (sameText) => {
    startNewTest(sameText);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all mistake history? This cannot be undone.')) {
      clearMistakeHistory();
      setHistoricalMistakes([]);
    }
  };

  const handleClearTestHistory = () => {
    if (window.confirm('Are you sure you want to clear all test history? This cannot be undone.')) {
      clearTestHistory();
      setTestHistory([]);
    }
  };

  // Render different states
  if (testState === 'testing' || testState === 'drill') {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {testState === 'drill' ? '🎯 Practice Drill' : 'Touch Typing Test'}
            </h2>
            {testState === 'drill' && drillData && (
              <p className="text-sm text-slate-600 mt-1">
                Targeting: {drillData.targetedMistakes.map(m => `${m.expected}→${m.actual}`).join(', ')}
              </p>
            )}
          </div>
          <button
            onClick={() => setTestState('setup')}
            className="text-slate-600 hover:text-slate-800 text-sm flex items-center gap-2"
          >
            <RotateCcw size={16} />
            Reset (Esc)
          </button>
        </div>

        <TypingTestCore
          ref={testCoreRef}
          targetText={targetText}
          onComplete={handleTestComplete}
          mode={mode}
          duration={mode.type === 'timed' ? mode.value : 600}
        />

        <div className="mt-6 text-center text-sm text-slate-500">
          Press <kbd className="px-2 py-1 bg-slate-200 rounded">Tab</kbd> to restart
        </div>
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Test Results</h2>
        </div>

        <ResultsScreen
          results={testResults}
          onRetry={handleRetry}
          onGenerateDrill={handleGenerateDrill}
          targetedMistakes={drillData?.targetedMistakes}
        />
      </div>
    );
  }

  // Setup screen
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Touch Typing Test</h2>
        <p className="text-slate-600">
          Improve your typing speed and accuracy with targeted mistake drills
        </p>
      </div>

      {/* Historical Mistakes */}
      {historicalMistakes.length > 0 && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl p-6 mb-8">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
              📊 Your Chronic Weaknesses
            </h3>
            <button
              onClick={handleClearHistory}
              className="text-red-600 hover:text-red-700 hover:bg-red-100 px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 text-sm font-medium"
              title="Clear mistake history"
            >
              <Trash2 size={14} />
              Clear History
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {historicalMistakes.map((mistake, index) => (
              <span
                key={index}
                className="bg-violet-100 text-violet-700 px-3 py-2 rounded-lg text-sm font-mono"
              >
                {mistake.expected} → {mistake.actual} ({mistake.count}x)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mode Selection */}
      <div className="space-y-6">
        {/* Timed Mode */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg">
              <Clock size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Timed Test</h3>
          </div>

          <div className="flex gap-3">
            {[15, 30, 60, 120].map((seconds) => (
              <button
                key={seconds}
                onClick={() => setMode({ type: 'timed', value: seconds })}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                  mode.type === 'timed' && mode.value === seconds
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>

        {/* Word Count Mode */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 text-green-600 p-2 rounded-lg">
              <Hash size={24} />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Word Count</h3>
          </div>

          <div className="flex gap-3">
            {[10, 25, 50, 100].map((words) => (
              <button
                key={words}
                onClick={() => setMode({ type: 'words', value: words })}
                className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                  mode.type === 'words' && mode.value === words
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {words} words
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => startNewTest()}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Start Test
        </button>

        {/* Test History */}
        {testHistory.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <History size={20} />
                Test History ({testHistory.length})
              </h3>
              <button
                onClick={handleClearTestHistory}
                className="text-red-600 hover:text-red-700 hover:bg-red-100 px-3 py-1 rounded-lg transition-all duration-200 flex items-center gap-1 text-sm font-medium"
                title="Clear test history"
              >
                <Trash2 size={14} />
                Clear
              </button>
            </div>

            {/* Last 10 tests table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">Date</th>
                    <th className="text-left py-2 px-2 font-semibold text-slate-700">Mode</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-700">WPM</th>
                    <th className="text-center py-2 px-2 font-semibold text-slate-700">Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {testHistory.slice(-10).reverse().map((test, index) => (
                    <tr key={test.id} className="border-b border-blue-100">
                      <td className="py-2 px-2 text-slate-600">
                        {new Date(test.timestamp).toLocaleDateString()} {new Date(test.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-2 text-slate-600">{test.mode}</td>
                      <td className="py-2 px-2 text-center">
                        <span className="font-bold text-blue-700">{test.wpm}</span>
                        <span className="text-slate-500 text-xs ml-1">({test.rawWpm})</span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`font-semibold ${test.accuracy >= 95 ? 'text-green-600' : test.accuracy >= 85 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {test.accuracy}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Average WPM */}
            {testHistory.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="text-sm text-slate-600">
                  Average WPM (last 10): <span className="font-bold text-blue-700">{Math.round(testHistory.slice(-10).reduce((sum, test) => sum + test.wpm, 0) / Math.min(testHistory.length, 10))}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Keyboard Shortcuts Help */}
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Keyboard Shortcuts</h3>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Restart test</span>
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Tab</kbd>
            </div>
            <div className="flex justify-between">
              <span>Return to setup</span>
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">Esc</kbd>
            </div>
            <div className="flex justify-between">
              <span>Backspace works naturally</span>
              <kbd className="px-2 py-1 bg-white rounded border border-slate-300">←</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
