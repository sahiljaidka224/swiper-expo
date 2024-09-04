import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useCallback, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";

export const useGetConversations = () => {
  const [conversationList, setConversationList] = useState<CometChat.Conversation[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConversations = async () => {
    const conversationsRequest = new CometChat.ConversationsRequestBuilder().setLimit(50).build();

    try {
      const conversations = await conversationsRequest.fetchNext();
      setConversationList(conversations);
    } catch (err) {
      setError(err as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    let listenerID: string = `conversations-listener`;

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
          fetchConversations();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
          fetchConversations();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  }, []);

  return { conversationList, error, loading, fetchConversations };
};

export const useDeleteConversation = () => {
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [deletedConversation, setDeletedConversation] = useState<string | null>(null);

  const deleteConversation = useCallback(async (UID: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await CometChat.deleteConversation(UID, "user");
      setDeletedConversation(result);
    } catch (err) {
      setError(err as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteConversation, deletedConversation, error, isLoading };
};

export const useGetGroupConversationsWithTags = (tags: string[]) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [groupConversations, setGroups] = useState<CometChat.Conversation[]>([]);
  const getGroups = async () => {
    setLoading(true);
    setError(null);

    try {
      const conversationsRequest = new CometChat.ConversationsRequestBuilder()
        .setLimit(30)
        .withTags(true)
        .setConversationType("group")
        .setGroupTags(tags)
        .build();

      const conversations = await conversationsRequest.fetchNext();

      setGroups(conversations);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Group fetch failed with error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  return { getGroups, isGroupsLoading: loading, groupsError: error, groupConversations };
};
