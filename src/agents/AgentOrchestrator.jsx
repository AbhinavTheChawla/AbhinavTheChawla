import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import useStore from '../store';
import { wardrobeAgent } from './wardrobeAgent';
import { groomingAgent } from './groomingAgent';
import { lifePlanningAgent } from './lifePlanningAgent';
import { callClaude } from './claudeAPI';

const AgentOrchestrator = () => {
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Get full context from store
  const getAllData = useStore((state) => state.getAllData);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

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
          response = await wardrobeAgent(query, context);
        } else if (routing.agent === 'grooming') {
          response = await groomingAgent(query, context);
        } else if (routing.agent === 'lifePlanning') {
          response = await lifePlanningAgent(query, context);
        }
      } else {
        // Multi-agent synthesis
        const agentResponses = await Promise.all(
          routing.agents.map(async (agentName) => {
            if (agentName === 'wardrobe') {
              return { name: 'Wardrobe', response: await wardrobeAgent(query, context) };
            } else if (agentName === 'grooming') {
              return { name: 'Grooming', response: await groomingAgent(query, context) };
            } else if (agentName === 'lifePlanning') {
              return { name: 'Life Planning', response: await lifePlanningAgent(query, context) };
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
        response = await callClaude(synthesisMessages, 2000);
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
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">AI Assistant</h2>
            <p className="text-violet-100 text-xs sm:text-sm">Your personal wardrobe, grooming, and life planning advisor</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 350px)', minHeight: '400px' }}>
        {conversationHistory.length === 0 ? (
          <div className="text-center py-8 sm:py-12 text-slate-500">
            <Sparkles size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-base sm:text-lg font-medium mb-2">Welcome to your AI Assistant!</p>
            <p className="text-xs sm:text-sm mb-4 px-4">Ask me anything about your wardrobe, grooming routine, or life plans.</p>
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
