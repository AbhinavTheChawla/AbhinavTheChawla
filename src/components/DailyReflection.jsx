import React, { useEffect, useState } from 'react';
import useStore from '../store';

const DailyReflection = () => {
  const dailyReflection = useStore((state) => state.dailyReflection);
  const updateDailyReflection = useStore((state) => state.updateDailyReflection);
  const [showHistory, setShowHistory] = useState(false);

  const questions = [
    "What mission did you progress?",
    "Time you chose most difficult path?",
    "A time you exercised agency + accountability?",
    "A time you experienced and redirected emotion?",
    "Time you had a non-ranking interaction"
  ];

  // Get today's date string
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Check if we need to reset for a new day
  useEffect(() => {
    const checkDailyReset = () => {
      const today = getTodayString();
      const lastDate = dailyReflection.currentDate;

      // If it's a new day and there are answers, archive them
      if (lastDate && lastDate !== today) {
        const hasAnswers = dailyReflection.answers.some(answer => answer.trim() !== '');

        if (hasAnswers) {
          // Archive current answers
          const newHistory = [
            {
              date: lastDate,
              answers: [...dailyReflection.answers]
            },
            ...dailyReflection.history
          ];

          updateDailyReflection({
            currentDate: today,
            answers: ['', '', '', '', ''],
            submitted: [false, false, false, false, false],
            history: newHistory
          });
        } else {
          // Just reset without archiving empty answers
          updateDailyReflection({
            ...dailyReflection,
            currentDate: today,
            answers: ['', '', '', '', ''],
            submitted: [false, false, false, false, false]
          });
        }
      } else if (!lastDate) {
        // Initialize if not set
        updateDailyReflection({
          ...dailyReflection,
          currentDate: today,
          submitted: dailyReflection.submitted || [false, false, false, false, false]
        });
      }
    };

    checkDailyReset();
    // Check every minute for new day
    const interval = setInterval(checkDailyReset, 60000);

    return () => clearInterval(interval);
  }, [dailyReflection, updateDailyReflection]);

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...dailyReflection.answers];
    newAnswers[index] = value;

    updateDailyReflection({
      ...dailyReflection,
      answers: newAnswers
    });
  };

  const handleSubmitQuestion = (index) => {
    // Mark the question as submitted
    const newSubmitted = [...(dailyReflection.submitted || [false, false, false, false, false])];
    newSubmitted[index] = true;

    updateDailyReflection({
      ...dailyReflection,
      submitted: newSubmitted
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mb-4 sm:mb-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-violet-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-violet-900 flex items-center gap-2">
          <span>🌙</span>
          Daily Reflection
        </h3>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-xs sm:text-sm text-violet-700 hover:text-violet-900 font-medium transition-colors px-3 py-1.5 bg-white/60 rounded-lg hover:bg-white/80"
        >
          {showHistory ? '← Back' : '📖 History'}
        </button>
      </div>

      {!showHistory ? (
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-violet-600 mb-4">
            Take a moment to reflect on your day. Submit each question when complete.
          </p>

          {questions.map((question, index) => {
            const submitted = dailyReflection.submitted?.[index] || false;

            // Don't show submitted questions
            if (submitted) return null;

            return (
              <div key={index} className="bg-white/60 rounded-lg p-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {index + 1}. {question}
                </label>
                <textarea
                  value={dailyReflection.answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent hover:border-violet-300 transition-all resize-none mb-3"
                  placeholder="Your reflection..."
                  rows="3"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
                />
                <button
                  onClick={() => handleSubmitQuestion(index)}
                  disabled={!dailyReflection.answers[index]?.trim()}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                  Submit
                </button>
              </div>
            );
          })}

          {dailyReflection.submitted?.every(s => s) && (
            <div className="text-center py-8 bg-white/60 rounded-lg border border-violet-200">
              <span className="text-2xl mb-2 block">✨</span>
              <p className="text-slate-600 font-medium">All reflections complete for today!</p>
              <p className="text-slate-400 text-sm mt-1">See you tomorrow</p>
            </div>
          )}
        </div>
      ) : (
        // History View
        <div className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            Your past reflections
          </div>

          {dailyReflection.history.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No history yet. Complete your first reflection to see it here!
            </div>
          ) : (
            <div className="space-y-6">
              {dailyReflection.history.map((entry, entryIndex) => (
                <div
                  key={entryIndex}
                  className="bg-white/60 rounded-lg p-4 border border-violet-200"
                >
                  <div className="text-sm font-bold text-violet-700 mb-4">
                    {formatDate(entry.date)}
                  </div>

                  <div className="space-y-3">
                    {questions.map((question, qIndex) => (
                      <div key={qIndex} className="border-l-2 border-violet-300 pl-3">
                        <div className="text-xs font-semibold text-slate-600 mb-1">
                          {question}
                        </div>
                        <div className="text-sm text-slate-700">
                          {entry.answers[qIndex] || <span className="text-slate-400 italic">No response</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyReflection;
