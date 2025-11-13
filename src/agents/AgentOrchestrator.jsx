import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Settings, X, Eye, EyeOff, Trash2 } from 'lucide-react';
import useStore from '../store';
import { wardrobeAgent } from './wardrobeAgent';
import { groomingAgent } from './groomingAgent';
import { lifePlanningAgent } from './lifePlanningAgent';
import { callClaude } from './claudeAPI';

const AgentOrchestrator = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState(''); // 'testing', 'success', 'error'
  const [testMessage, setTestMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Get full context and API key from store
  const getAllData = useStore((state) => state.getAllData);
  const claudeApiKey = useStore((state) => state.claudeApiKey);
  const updateClaudeApiKey = useStore((state) => state.updateClaudeApiKey);

  // Load conversation history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ai_chat_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setConversationHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, []);

  // Save conversation history to localStorage whenever it changes
  useEffect(() => {
    try {
      if (conversationHistory.length > 0) {
        localStorage.setItem('ai_chat_history', JSON.stringify(conversationHistory));
      }
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [conversationHistory]);

  // Initialize temp API key when settings open
  useEffect(() => {
    if (showSettings) {
      setTempApiKey(claudeApiKey);
    }
  }, [showSettings, claudeApiKey]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSaveApiKey = () => {
    updateClaudeApiKey(tempApiKey);
    setShowSettings(false);
  };

  const handleCancelApiKey = () => {
    setTempApiKey(claudeApiKey);
    setTestStatus('');
    setTestMessage('');
    setShowSettings(false);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      setConversationHistory([]);
      localStorage.removeItem('ai_chat_history');
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Testing connection...');

    try {
      // Step 1: Test proxy server
      console.log('🧪 Testing proxy server health...');
      const proxyUrl = 'http://localhost:3001';

      try {
        const healthResponse = await fetch(`${proxyUrl}/health`, {
          method: 'GET',
        });

        if (!healthResponse.ok) {
          throw new Error('Proxy server health check failed');
        }

        console.log('✅ Proxy server is running');
      } catch (healthError) {
        console.error('❌ Proxy server is not accessible:', healthError);
        setTestStatus('error');
        setTestMessage('❌ Proxy server not running! Please ensure you started the app with "npm run dev" (not "npm run client").');
        return;
      }

      // Step 2: Test API key
      if (!tempApiKey || tempApiKey.trim() === '') {
        setTestStatus('error');
        setTestMessage('❌ Please enter an API key first');
        return;
      }

      if (!tempApiKey.startsWith('sk-ant-')) {
        setTestStatus('error');
        setTestMessage('❌ Invalid API key format. Key should start with "sk-ant-"');
        return;
      }

      console.log('🧪 Testing Claude API with your key...');

      // Step 3: Test actual API call
      const testMessages = [{ role: 'user', content: 'Say "test successful" if you can read this.' }];
      const response = await callClaude(testMessages, 100, tempApiKey);

      console.log('✅ API test successful');
      setTestStatus('success');
      setTestMessage('✅ Connection successful! Your API key is working correctly.');

    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestStatus('error');

      if (error.message.includes('Cannot connect to proxy server')) {
        setTestMessage('❌ Cannot connect to proxy server. Start the app with "npm run dev"');
      } else if (error.message.includes('API key')) {
        setTestMessage(`❌ API Key Error: ${error.message}`);
      } else {
        setTestMessage(`❌ Test failed: ${error.message}`);
      }
    }
  };

  /**
   * Analyze user query to determine which agent(s) to call
   */
  const analyzeQuery = (query) => {
    const lowerQuery = query.toLowerCase();

    // Keywords for each domain
    const wardrobeKeywords = [
      'wear', 'outfit', 'clothes', 'wardrobe', 'shirt', 'pants', 'shoes',
      'dress', 'style', 'fashion', 'clothing', 'attire', 'suit', 'casual',
      'formal', 'interview', 'date', 'shopping', 'buy', 'brands'
    ];

    const groomingKeywords = [
      'skin', 'hair', 'grooming', 'skincare', 'routine', 'cleanser',
      'moisturizer', 'shampoo', 'beard', 'shave', 'perfume', 'cologne',
      'supplement', 'vitamin', 'haircut', 'facial', 'acne', 'wrinkle'
    ];

    const lifePlanningKeywords = [
      'goal', 'plan', 'career', 'life', 'strategy', 'future', 'habit',
      'practice', 'consistency', 'growth', 'development', 'balance',
      'schedule', 'time', 'priority', 'focus', 'mindset', 'meditation',
      'reflection', 'week', 'month', 'year'
    ];

    // Multi-agent trigger phrases
    const multiAgentPhrases = [
      'prepare me', 'get ready', 'plan my week', 'plan my day',
      'prepare for', 'everything', 'full prep', 'complete guide',
      'all aspects', 'holistic', 'overall'
    ];

    // Check for multi-agent queries
    const needsMultiAgent = multiAgentPhrases.some(phrase =>
      lowerQuery.includes(phrase)
    );

    if (needsMultiAgent) {
      return { type: 'multi', agents: ['wardrobe', 'grooming', 'lifePlanning'] };
    }

    // Count keyword matches
    const wardrobeScore = wardrobeKeywords.filter(kw => lowerQuery.includes(kw)).length;
    const groomingScore = groomingKeywords.filter(kw => lowerQuery.includes(kw)).length;
    const lifePlanningScore = lifePlanningKeywords.filter(kw => lowerQuery.includes(kw)).length;

    // If multiple scores are high, use multi-agent
    const highScores = [wardrobeScore, groomingScore, lifePlanningScore].filter(s => s > 0);
    if (highScores.length > 1) {
      const agents = [];
      if (wardrobeScore > 0) agents.push('wardrobe');
      if (groomingScore > 0) agents.push('grooming');
      if (lifePlanningScore > 0) agents.push('lifePlanning');
      return { type: 'multi', agents };
    }

    // Single agent routing
    if (wardrobeScore >= groomingScore && wardrobeScore >= lifePlanningScore && wardrobeScore > 0) {
      return { type: 'single', agent: 'wardrobe' };
    }
    if (groomingScore >= wardrobeScore && groomingScore >= lifePlanningScore && groomingScore > 0) {
      return { type: 'single', agent: 'grooming' };
    }
    if (lifePlanningScore > 0) {
      return { type: 'single', agent: 'lifePlanning' };
    }

    // Default to life planning for general questions
    return { type: 'single', agent: 'lifePlanning' };
  };

  /**
   * Handle user message submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const query = userInput.trim();
    setUserInput('');
    setIsLoading(true);

    // Add user message to conversation
    const userMessage = { role: 'user', content: query };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      // Get full context
      const context = getAllData();

      // Analyze query to determine routing
      const routing = analyzeQuery(query);

      let response;

      if (routing.type === 'single') {
        // Single agent call
        if (routing.agent === 'wardrobe') {
          response = await wardrobeAgent(query, context, claudeApiKey);
        } else if (routing.agent === 'grooming') {
          response = await groomingAgent(query, context, claudeApiKey);
        } else if (routing.agent === 'lifePlanning') {
          response = await lifePlanningAgent(query, context, claudeApiKey);
        }
      } else {
        // Multi-agent synthesis
        const agentResponses = await Promise.all(
          routing.agents.map(async (agentName) => {
            if (agentName === 'wardrobe') {
              return { name: 'Wardrobe', response: await wardrobeAgent(query, context, claudeApiKey) };
            } else if (agentName === 'grooming') {
              return { name: 'Grooming', response: await groomingAgent(query, context, claudeApiKey) };
            } else if (agentName === 'lifePlanning') {
              return { name: 'Life Planning', response: await lifePlanningAgent(query, context, claudeApiKey) };
            }
          })
        );

        // Synthesize responses
        const synthesisPrompt = `You are a personal assistant helping to synthesize advice from multiple specialists.

USER'S ORIGINAL QUESTION:
${query}

SPECIALIST RESPONSES:
${agentResponses.map(ar => `
${ar.name} Specialist:
${ar.response}
`).join('\n---\n')}

YOUR TASK:
Combine these specialist responses into a single, cohesive, well-organized response that:
1. Addresses all aspects of the user's question
2. Integrates the advice smoothly without repetition
3. Creates a logical flow (e.g., for "prepare for interview": outfit → grooming → mental prep)
4. Uses bullet points or numbered lists for clarity when appropriate
5. Maintains a helpful, supportive tone
6. Keeps the response concise (3-5 paragraphs maximum)

Provide your synthesized response:`;

        const synthesisMessages = [{ role: 'user', content: synthesisPrompt }];
        response = await callClaude(synthesisMessages, 2000, claudeApiKey);
      }

      // Add assistant response to conversation
      const assistantMessage = { role: 'assistant', content: response };
      setConversationHistory(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error processing query:', error);
      const errorMessage = {
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your request: ${error.message}. Please try again.`
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">AI Assistant</h2>
              <p className="text-violet-100 text-xs sm:text-sm">Your personal wardrobe, grooming, and life planning advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversationHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
                title="Clear Chat History"
              >
                <Trash2 className="text-white" size={20} />
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all"
              title="Configure API Key"
            >
              <Settings className="text-white" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">API Settings</h3>
              <button
                onClick={handleCancelApiKey}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Claude API Key
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Get your API key from{' '}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 hover:text-violet-700 underline"
                >
                  console.anthropic.com
                </a>
              </p>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Your API key is stored locally in your browser and never sent to any server except Anthropic's API.
              </p>
            </div>

            {/* Test Connection Button */}
            <div className="mb-4">
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {testStatus === 'testing' ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>

              {/* Test Result Message */}
              {testMessage && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  testStatus === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : testStatus === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-gray-50 border border-gray-200 text-gray-800'
                }`}>
                  {testMessage}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCancelApiKey}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '400px' }}>
        {conversationHistory.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-slate-500">
            <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base sm:text-lg font-medium mb-2">Welcome to your AI Assistant!</p>
            <p className="text-xs sm:text-sm mb-4 px-4">Ask me anything about your wardrobe, grooming routine, or life plans.</p>

            {!claudeApiKey && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 max-w-md mx-auto">
                <p className="text-sm text-amber-800 mb-2">
                  <strong>⚠️ API Key Required</strong>
                </p>
                <p className="text-xs text-amber-700 mb-3">
                  Click the settings icon (⚙️) to configure your Claude API key before using the AI assistant.
                </p>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-all font-medium"
                >
                  Configure Now
                </button>
              </div>
            )}

            <div className="text-left max-w-md mx-auto space-y-2 text-xs sm:text-sm px-4">
              <p className="font-semibold text-slate-600">Try asking:</p>
              <ul className="space-y-1 text-slate-500">
                <li>• "What should I wear today?"</li>
                <li>• "Help me prepare for my UBS interview"</li>
                <li>• "Am I being consistent with my goals?"</li>
                <li>• "Plan my week"</li>
                <li>• "What skincare products should I add?"</li>
              </ul>
            </div>
          </div>
        ) : (
          conversationHistory.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="animate-spin text-violet-600" size={16} />
              <span className="text-xs sm:text-sm text-slate-600">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-slate-200 p-4 bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm hover:shadow-md"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentOrchestrator;
