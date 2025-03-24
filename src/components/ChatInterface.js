import React, { useState, useRef, useEffect } from 'react';
import { API } from 'aws-amplify';
import { FaPaperPlane, FaMountain } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

const ChatInterface = ({ messages, addMessage, clearMessages }) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to chat
    addMessage({ role: 'user', content: userInput });
    
    // Clear input field
    setUserInput('');
    
    // Show loading state
    setIsLoading(true);
    
    try {
      // Call Lambda function via API Gateway
      const response = await API.post('mountainGuideApi', '/chat', {
        body: {
          message: userInput,
          history: messages
        }
      });
      
      // Add Claude's response to chat
      addMessage({ role: 'assistant', content: response.message });
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage({ 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error processing your request. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Function to handle clicking on a suggested question
  const handleSuggestedQuestion = (question) => {
    setUserInput(question);
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <FaMountain className="chat-header-icon" />
        <h2>Mountain Guide Assistant</h2>
        {messages.length > 1 && (
          <button onClick={clearMessages} className="clear-chat-btn">
            Clear Chat
          </button>
        )}
      </div>
      
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <FaMountain className="welcome-icon" />
            <h3>Welcome to Mountain Guide!</h3>
            <p>Ask me anything about mountains, hiking, climbing, or outdoor adventures. I'm here to help with information, advice, and recommendations.</p>
            <div className="suggested-questions">
              <p>Try asking:</p>
              <ul>
                {[
                  "What are the tallest mountains in the world?",
                  "How should I prepare for high altitude hiking?",
                  "Tell me about hiking in the Alps.",
                  "What equipment do I need for mountain climbing?"
                ].map((question, index) => (
                  <li 
                    key={index} 
                    onClick={() => handleSuggestedQuestion(question)}
                  >
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  <ReactMarkdown>
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="loading-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about mountains, hiking, climbing, etc..."
          className="chat-input"
          rows="1"
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!userInput.trim() || isLoading}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;