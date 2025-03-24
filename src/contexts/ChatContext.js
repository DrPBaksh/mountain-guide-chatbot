import React, { createContext, useContext, useState, useEffect } from 'react';

// Create a context for chat functionality
const ChatContext = createContext();

// Custom hook to use the chat context
export const useChatContext = () => useContext(ChatContext);

// Provider component for chat functionality
export const ChatProvider = ({ children }) => {
  // Initialize messages from localStorage if available
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('mountainGuideMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mountainGuideMessages', JSON.stringify(messages));
  }, [messages]);

  // Function to add a new message
  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  // Function to clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Provide the chat context to children components
  return (
    <ChatContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;