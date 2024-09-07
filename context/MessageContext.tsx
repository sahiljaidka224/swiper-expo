import { createContext, useContext, useState } from "react";

export interface MessageContextType {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

interface MessageContextProviderProps {
  children: React.ReactNode;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageContextProvider: React.FC<MessageContextProviderProps> = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const updateUnreadCount = async (count: number) => {
    setUnreadCount(count);
  };
  return (
    <MessageContext.Provider value={{ unreadCount, setUnreadCount: updateUnreadCount }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessageContext = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
