import { createContext, useContext, useEffect, useState } from "react";

const backendUrl = window.location.hostname === 'localhost' 
? 'http://localhost:3000' 
: 'http://d48ggk0.165.227.218.168.sslip.io';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const chat = async (message) => {
    setLoading(true);
    console.log('Sending message:', message); // Log the message being sent
    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });
      console.log('Response:', response); // Log the response
      if (!response.ok) {
        console.error('Response error:', response.statusText); // Log any response error
      }
      const data = await response.json();
      console.log('Response data:', data); // Log the response data
      const resp = data.messages;
      setMessages((messages) => [...messages, ...resp]);
    } catch (error) {
      console.error('Fetch error:', error); // Log any fetch error
    } finally {
      setLoading(false);
    }
  };
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState();
  const [loading, setLoading] = useState(false);
  const [cameraZoomed, setCameraZoomed] = useState(true);
  const onMessagePlayed = () => {
    setMessages((messages) => messages.slice(1));
  };

  useEffect(() => {
    if (messages.length > 0) {
      setMessage(messages[0]);
    } else {
      setMessage(null);
    }
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        chat,
        message,
        onMessagePlayed,
        loading,
        cameraZoomed,
        setCameraZoomed,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
