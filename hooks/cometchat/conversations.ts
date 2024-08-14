import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";

export const useGetConversations = () => {
  const [conversationList, setConversationList] = useState<CometChat.Conversation[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchConversations = async () => {
      const conversationsRequest = new CometChat.ConversationsRequestBuilder()
        .setConversationType("user")
        .setLimit(50)
        .build();

      try {
        const conversations = await conversationsRequest.fetchNext();
        setConversationList(conversations);
      } catch (err) {
        setError(err as CometChat.CometChatException);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return { conversationList, error, loading };
};
