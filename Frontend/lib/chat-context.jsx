// lib/chat-context.jsx
import { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);

export function useChat() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [sessions, setSessions] = useState([
    { id: "s1", title: "Explain RAG architecture", date: new Date(), group: "today" },
    // ... your demo sessions
  ]);
  const [activeSession, setActiveSession] = useState("s1");
  const [messages, setMessages] = useState({
    s1: [
      // ... your demo messages
    ],
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [documents, setDocuments] = useState([{ id: "d1", name: "company_handbook.pdf", size: "2.4 MB" }]);
  const [selectedModel, setSelectedModel] = useState("Enterprise RAG Model");

  const getMessages = (sessionId) => messages[sessionId] || [];
  const addMessage = (sessionId, message) => {
    setMessages((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), message],
    }));
  };
  const updateLastMessage = (sessionId, content) => {
    setMessages((prev) => {
      const msgs = [...(prev[sessionId] || [])];
      if (msgs.length > 0) {
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
      }
      return { ...prev, [sessionId]: msgs };
    });
  };
  const createSession = () => {
    const id = `s${Date.now()}`;
    const session = { id, title: "New Chat", date: new Date(), group: "today" };
    setSessions((prev) => [session, ...prev]);
    setActiveSession(id);
    return id;
  };

  return (
    <ChatContext.Provider value={{
      sessions, activeSession, setActiveSession,
      getMessages, addMessage, updateLastMessage,
      isStreaming, setIsStreaming,
      documents, setDocuments,
      selectedModel, setSelectedModel,
      createSession,
    }}>
      {children}
    </ChatContext.Provider>
  );
}