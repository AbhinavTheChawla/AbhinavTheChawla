import React, { useState, useEffect, useRef } from 'react';
import { MistakeTracker, calculateWPM, calculateAccuracy } from '../utils/mistakeUtils';

const TypingTestCore = ({ targetText, onComplete, mode, duration }) => {
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isTestActive, setIsTestActive] = useState(false);
  const [wpmHistory, setWpmHistory] = useState([]);
  const [lastWpmUpdate, setLastWpmUpdate] = useState(0);

  const inputRef = useRef(null);
  const mistakeTrackerRef = useRef(new MistakeTracker());
  const previousInputRef = useRef('');

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer for timed mode
  useEffect(() => {
    if (!isTestActive || mode.type !== 'timed') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTestActive, mode.type]);

  // WPM history tracking (every 2 seconds)
  useEffect(() => {
    if (!isTestActive || !startTime) return;

    const interval = setInterval(() => {
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      if (elapsedSeconds >= lastWpmUpdate + 2) {
        const correctChars = userInput.split('').filter((char, i) => char === targetText[i]).length;
        const currentWpm = calculateWPM(correctChars, elapsedSeconds);
        setWpmHistory(prev => [...prev, currentWpm]);
        setLastWpmUpdate(elapsedSeconds);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isTestActive, startTime, userInput, lastWpmUpdate]);

  const finishTest = () => {
    if (!startTime) return;

    setIsTestActive(false);
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;

    // Calculate stats
    const correctChars = userInput.split('').filter((char, i) => char === targetText[i]).length;
    const totalChars = userInput.length;
    const wpm = calculateWPM(correctChars, totalTime);
    const rawWpm = calculateWPM(totalChars, totalTime);
    const accuracy = calculateAccuracy(correctChars, totalChars);

    // Get mistake data
    const mistakeStats = mistakeTrackerRef.current.getStats();

    onComplete({
      wpm,
      rawWpm,
      accuracy,
      totalTime,
      correctChars,
      totalChars,
      mistakes: mistakeTrackerRef.current.getAllMistakes(),
      mistakeStats,
      wpmHistory,
    });
  };

  const handleInputChange = (e) => {
    const newInput = e.target.value;

    // Start test on first character
    if (!isTestActive && newInput.length > 0) {
      setIsTestActive(true);
      setStartTime(Date.now());
    }

    // Track mistakes
    const previousInput = previousInputRef.current;

    // Check if user backspaced
    if (newInput.length < previousInput.length) {
      // User deleted character(s)
      const deletedIndex = newInput.length;
      const deletedChar = previousInput[deletedIndex];
      const expectedChar = targetText[deletedIndex];

      // If the deleted character was wrong, it's a backspaced mistake
      if (deletedChar !== expectedChar) {
        const wordIndex = targetText.slice(0, deletedIndex).split(' ').length - 1;
        const position = deletedIndex - targetText.slice(0, deletedIndex).lastIndexOf(' ') - 1;

        mistakeTrackerRef.current.recordMistake(
          expectedChar,
          deletedChar,
          position,
          wordIndex,
          true, // wasBackspaced
          Date.now()
        );
      }
    } else if (newInput.length > previousInput.length) {
      // User added character(s)
      const addedIndex = previousInput.length;
      const addedChar = newInput[addedIndex];
      const expectedChar = targetText[addedIndex];

      // If the added character is wrong, track it
      if (addedChar !== expectedChar && addedIndex < targetText.length) {
        const wordIndex = targetText.slice(0, addedIndex).split(' ').length - 1;
        const position = addedIndex - targetText.slice(0, addedIndex).lastIndexOf(' ') - 1;

        mistakeTrackerRef.current.recordMistake(
          expectedChar,
          addedChar,
          position,
          wordIndex,
          false, // Not backspaced (yet)
          Date.now()
        );
      }
    }

    previousInputRef.current = newInput;
    setUserInput(newInput);
    setCurrentIndex(newInput.length);

    // Check for completion (word count mode)
    if (mode.type === 'words') {
      const targetWords = targetText.split(' ').slice(0, mode.value).join(' ');
      if (newInput.trim().split(/\s+/).length >= mode.value && newInput.endsWith(' ')) {
        finishTest();
      }
    } else if (newInput.length >= targetText.length) {
      finishTest();
    }
  };

  // Render character with styling
  const renderCharacter = (char, index) => {
    const userChar = userInput[index];
    let className = 'transition-colors duration-75';

    if (index < currentIndex) {
      if (userChar === char) {
        className += ' text-slate-700'; // Correct - subtle
      } else {
        className += ' text-red-500 bg-red-100'; // Incorrect - red
      }
    } else if (index === currentIndex) {
      className += ' border-l-2 border-blue-500 animate-pulse'; // Cursor
    } else {
      className += ' text-slate-400'; // Not yet typed
    }

    // Handle extra characters
    if (index >= targetText.length && index < currentIndex) {
      className = ' text-red-700 bg-red-200'; // Extra chars - darker red
    }

    return (
      <span key={index} className={className}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  // Calculate live stats
  const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
  const correctChars = userInput.split('').filter((char, i) => char === targetText[i]).length;
  const liveWpm = elapsedSeconds > 0 ? calculateWPM(correctChars, elapsedSeconds) : 0;
  const liveRawWpm = elapsedSeconds > 0 ? calculateWPM(userInput.length, elapsedSeconds) : 0;
  const liveAccuracy = calculateAccuracy(correctChars, userInput.length);

  return (
    <div className="space-y-6" onClick={() => inputRef.current?.focus()}>
      {/* Stats Bar */}
      <div className="flex justify-between items-center bg-slate-100 px-6 py-4 rounded-xl">
        <div className="flex gap-8">
          <div>
            <div className="text-xs text-slate-500 font-medium">WPM</div>
            <div className="text-2xl font-bold text-slate-700">{liveWpm}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Raw</div>
            <div className="text-2xl font-bold text-slate-700">{liveRawWpm}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Accuracy</div>
            <div className="text-2xl font-bold text-slate-700">{liveAccuracy}%</div>
          </div>
        </div>

        {mode.type === 'timed' && (
          <div>
            <div className="text-xs text-slate-500 font-medium">Time Left</div>
            <div className="text-2xl font-bold text-slate-700">{timeLeft}s</div>
          </div>
        )}
      </div>

      {/* Text Display */}
      <div className="bg-white px-8 py-12 rounded-xl shadow-sm border border-slate-200 cursor-text">
        <div className="font-mono text-2xl leading-relaxed tracking-wide select-none">
          {targetText.split('').map((char, index) => renderCharacter(char, index))}
          {/* Show extra characters */}
          {userInput.length > targetText.length &&
            userInput
              .slice(targetText.length)
              .split('')
              .map((char, index) =>
                renderCharacter(char, targetText.length + index)
              )}
        </div>
      </div>

      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onChange={handleInputChange}
        className="opacity-0 absolute pointer-events-none"
        autoFocus
      />

      {/* Focus Hint */}
      {!isTestActive && (
        <div className="text-center text-slate-400 text-sm">
          Click anywhere and start typing to begin
        </div>
      )}
    </div>
  );
};

export default TypingTestCore;
