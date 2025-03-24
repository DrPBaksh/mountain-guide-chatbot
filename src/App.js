import React from 'react';
import { Amplify } from 'aws-amplify';
import { ChatProvider } from './contexts/ChatContext';
import ChatInterface from './components/ChatInterface';
import { useChatContext } from './contexts/ChatContext';
import './App.css';

// Try to load AWS Amplify configuration if available
try {
  Amplify.configure({
    API: {
      endpoints: [
        {
          name: 'mountainGuideApi',
          endpoint: process.env.REACT_APP_API_ENDPOINT || 'https://your-api-gateway-endpoint.execute-api.us-east-1.amazonaws.com/prod'
        }
      ]
    }
  });
} catch (error) {
  console.log('AWS Amplify configuration will be loaded at runtime or environment.');
}

// Main component to render chat interface
const ChatContainer = () => {
  const { messages, addMessage, clearMessages } = useChatContext();
  
  return (
    <div className="chat-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Mountain Adventure Guide</h1>
          <p>Your AI companion for mountain information and guidance</p>
        </div>
      </header>
      
      <main className="app-main">
        <ChatInterface 
          messages={messages} 
          addMessage={addMessage} 
          clearMessages={clearMessages} 
        />
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Mountain Guide | Powered by Claude Haiku</p>
        <p>
          <a href="https://github.com/DrPBaksh/mountain-guide-chatbot" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
};

// Root App component with context provider
function App() {
  return (
    <ChatProvider>
      <div className="app">
        <ChatContainer />
      </div>
    </ChatProvider>
  );
}

export default App;