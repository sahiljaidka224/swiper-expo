import { CurrentUser, useAuth } from "@/context/AuthContext";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { IMessage } from "react-native-gifted-chat";
import * as Haptics from "expo-haptics";
import { useMessageContext } from "@/context/MessageContext";
import { showToast } from "@/components/Toast";

function parseCometChatMessageToGiftedChat(
  user: CurrentUser,
  message: CometChat.BaseMessage
): IMessage | IMessage[] | undefined {
  const sender = message.getSender();
  const messageType = message.getType();
  const data = message.getData();
  const fromCurrentUser = user?.id === sender.getUid();
  const sentAt = message.getSentAt();
  const received = message.getReadAt();

  const baseMessage = {
    _id: message.getId(),
    from: fromCurrentUser ? 1 : 0,
    createdAt: new Date(sentAt * 1000),
    sent: Boolean(sentAt),
    received: Boolean(received),
    user: {
      _id: fromCurrentUser ? 1 : 0,
      name: fromCurrentUser ? user?.name : sender.getName(),
    },
    text: "",
  };

  if (messageType === "image" || messageType === "video") {
    return data.attachments.map((attachment: { url: string }) => ({
      ...baseMessage,
      _id: message.getId() + Math.floor(Math.random() * 1000),
      image: messageType === "image" ? attachment.url : undefined,
      video: messageType === "video" ? attachment.url : undefined,
    }));
  } else if (messageType === "text") {
    let messageText = "";
    try {
      const jsonContent = JSON.parse(data.text);
      if (typeof jsonContent !== "object") throw new Error("Bad json");
      messageText = jsonContent.message;
    } catch {
      messageText = data.text || data.action;
    }

    return {
      ...baseMessage,
      text: messageText ?? "",
      image: undefined,
      video: undefined,
    };
  }

  return undefined;
}

export const useGetMessages = (toId: string) => {
  const { user } = useAuth();
  const { markAsRead } = useMarkMessageAsRead();
  const messageRequest = useRef<CometChat.MessagesRequest | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  useEffect(() => {
    let listenerID: string = `${toId}-listener`;

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
          const senderId = textMessage.getSender().getUid();
          const receiverType = textMessage.getReceiverType();
          if (senderId !== toId || !user || receiverType === "group") return;
          const parsedMessage = parseCometChatMessageToGiftedChat(user, textMessage);

          if (!parsedMessage || Array.isArray(parsedMessage)) return;
          setMessages((prevMessages) => [parsedMessage, ...prevMessages]);
          markAsRead(textMessage);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
          const senderId = mediaMessage.getSender().getUid();
          const receiverType = mediaMessage.getReceiverType();
          if (senderId !== toId || !user || receiverType === "group") return;
          const parsedMessages = parseCometChatMessageToGiftedChat(user, mediaMessage);

          if (!parsedMessages || !Array.isArray(parsedMessages)) return;
          setMessages((prevMessages) => [...parsedMessages, ...prevMessages]);
          markAsRead(mediaMessage);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onTypingStarted: (typingIndicator: CometChat.TypingIndicator) => {
          const senderUID = typingIndicator.getSender().getUid();
          const receiverType = typingIndicator.getReceiverType();
          if (senderUID !== toId || receiverType === "group") return;
          setIsTyping(true);
        },
        onTypingEnded: (typingIndicator: CometChat.TypingIndicator) => {
          const senderUID = typingIndicator.getSender().getUid();
          const receiverType = typingIndicator.getReceiverType();
          if (senderUID !== toId || receiverType === "group") return;
          setIsTyping(false);
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  }, []);

  const initializeMessageRequest = () => {
    if (messageRequest.current) return;

    messageRequest.current = new CometChat.MessagesRequestBuilder()
      .setUID(toId)
      .setTypes(["text", "image", "video"])
      .hideDeletedMessages(true)
      .setLimit(30)
      .build();
  };

  const fetchMessages = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const fetchedMessages = await messageRequest.current?.fetchPrevious();
      if (!fetchedMessages || fetchedMessages.length === 0) {
        setHasMore(false);
        return;
      }

      if (!user) return;

      const mapped: IMessage[] = fetchedMessages.flatMap((m) => {
        const parsedMessage = parseCometChatMessageToGiftedChat(user, m);
        return parsedMessage ? parsedMessage : [];
      });

      setMessages((prevMessages) => [...prevMessages, ...mapped.reverse()]);
    } catch (err) {
      setError(err as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  }, [hasMore, messageRequest]);

  useEffect(() => {
    initializeMessageRequest();
    fetchMessages();
  }, []);

  return { messages, error, loading, hasMore, fetchMessages, setMessages, isTyping };
};

export const useSendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [message, setMessage] = useState<
    | CometChat.BaseMessage
    | CometChat.TextMessage
    | CometChat.MediaMessage
    | CometChat.CustomMessage
    | CometChat.InteractiveMessage
    | null
  >(null);

  const sendMessage = async (
    receiverID: string,
    messageText: string,
    organisationFrom?: string,
    organisationTo?: string,
    metadata?: Record<string, string | number | undefined>
  ) => {
    setLoading(true);
    setError(null);

    const textMessage = new CometChat.TextMessage(receiverID, messageText, "user");
    textMessage.setMetadata({
      organisation_from: organisationFrom,
      organisation_to: organisationTo,
      ...metadata,
    });

    try {
      const response = await CometChat.sendMessage(textMessage);
      setMessage(response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Message sending failed with error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMediaMessageToMultiple = async (
    receiverID: string[],
    files: {
      name: string | null;
      uri: string;
      type: string | undefined;
      size: number | undefined;
    }[],
    organisationFrom?: string,
    organisationTo?: string,
    metadata?: Record<string, string | number | undefined>
  ) => {
    setLoading(true);
    setError(null);

    try {
      for (let id of receiverID) {
        const mediaMessage = new CometChat.MediaMessage(id, files, "image", "user");
        mediaMessage.setMetadata({
          organisation_from: organisationFrom,
          organisation_to: organisationTo,
          ...metadata,
        });

        try {
          await CometChat.sendMessage(mediaMessage);
        } catch (error) {
          setError(error as CometChat.CometChatException);
          console.log("Message sending failed with error:", error);
        }
      }
    } catch (error) {
      setError(error as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  };

  const sendMediaMessage = async (
    receiverID: string,
    files: {
      name: string | null;
      uri: string;
      type: string | undefined;
      size: number | undefined;
    }[],
    organisationFrom?: string,
    organisationTo?: string
  ) => {
    setLoading(true);
    setError(null);

    const mediaMessage = new CometChat.MediaMessage(receiverID, files, "image", "user");
    mediaMessage.setMetadata({
      organisation_from: organisationFrom,
      organisation_to: organisationTo,
    });

    try {
      const response = await CometChat.sendMediaMessage(mediaMessage);
      setMessage(response);
      // console.log("Media message sent successfully", response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      showToast(
        "Error sending message",
        `${(error as CometChat.CometChatException)?.message ?? ""}`,
        "error"
      );
      console.log("Media message sending failed with error", error);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error, message, sendMediaMessage, sendMediaMessageToMultiple };
};

export const useGetGroupMessages = (toId: string) => {
  const { user } = useAuth();
  const messageRequest = useRef<CometChat.MessagesRequest | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const { markAsRead } = useMarkMessageAsRead();

  useEffect(() => {
    let listenerID: string = `${toId}-listener`;

    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage: CometChat.TextMessage) => {
          const receiverType = textMessage.getReceiverType();
          const receiverID = textMessage.getReceiverId();
          if (!user || receiverType === "user" || receiverID !== toId) return;
          const parsedMessage = parseCometChatMessageToGiftedChat(user, textMessage);

          if (!parsedMessage || Array.isArray(parsedMessage)) return;
          setMessages((prevMessages) => [parsedMessage, ...prevMessages]);
          markAsRead(textMessage);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
          const receiverID = mediaMessage.getReceiverId();
          const receiverType = mediaMessage.getReceiverType();
          if (!user || receiverType === "user" || receiverID !== toId) return;
          const parsedMessages = parseCometChatMessageToGiftedChat(user, mediaMessage);

          if (!parsedMessages || !Array.isArray(parsedMessages)) return;
          setMessages((prevMessages) => [...parsedMessages, ...prevMessages]);
          markAsRead(mediaMessage);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onTypingStarted: (typingIndicator: CometChat.TypingIndicator) => {
          const senderUID = typingIndicator.getSender().getUid();
          const receiverId = typingIndicator.getReceiverId();
          if (senderUID !== receiverId) return;
          setIsTyping(true);
        },
        onTypingEnded: (typingIndicator: CometChat.TypingIndicator) => {
          const receiverId = typingIndicator.getReceiverId();
          const senderUID = typingIndicator.getSender().getUid();
          if (senderUID !== receiverId) return;
          setIsTyping(false);
        },
      })
    );

    return () => {
      CometChat.removeMessageListener(listenerID);
    };
  }, []);

  const initializeMessageRequest = () => {
    if (messageRequest.current) return;

    messageRequest.current = new CometChat.MessagesRequestBuilder()
      .setGUID(toId)
      .setTypes(["text", "image", "video"])
      .hideDeletedMessages(true)
      .setLimit(30)
      .build();
  };

  const fetchMessages = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const fetchedMessages = await messageRequest.current?.fetchPrevious();
      if (!fetchedMessages || fetchedMessages.length === 0) {
        setHasMore(false);
        return;
      }

      if (!user) return;

      const mapped: IMessage[] = fetchedMessages.flatMap((m) => {
        const parsedMessage = parseCometChatMessageToGiftedChat(user, m);
        return parsedMessage ? parsedMessage : [];
      });

      setMessages((prevMessages) => [...prevMessages, ...mapped.reverse()]);
    } catch (err) {
      setError(err as CometChat.CometChatException);
    } finally {
      setLoading(false);
    }
  }, [hasMore, messageRequest]);

  useEffect(() => {
    initializeMessageRequest();
    fetchMessages();
  }, []);

  return { messages, error, loading, hasMore, fetchMessages, setMessages, isTyping };
};

export const useSendGroupMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [message, setMessage] = useState<
    | CometChat.BaseMessage
    | CometChat.TextMessage
    | CometChat.MediaMessage
    | CometChat.CustomMessage
    | CometChat.InteractiveMessage
    | null
  >(null);

  const sendMessage = async (
    receiverID: string,
    messageText: string,
    organisationFrom?: string,
    organisationTo?: string,
    groupMember?: CometChat.User | null
  ) => {
    setLoading(true);
    setError(null);

    const textMessage = new CometChat.TextMessage(receiverID, messageText, "group");
    textMessage.setMetadata({
      organisation_from: organisationFrom,
      organisation_to: organisationTo,
    });

    try {
      const response = await CometChat.sendGroupMessage(textMessage);
      setMessage(response);
      // console.log("Message sent successfully:", response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Message sending failed with error:", error);
    } finally {
      setLoading(false);
      try {
        if (groupMember) {
          const customMsg = new CometChat.CustomMessage(groupMember?.getUid(), "user", "custom", {
            text: "You have a car message",
          });
          CometChat.sendCustomMessage(customMsg);
        }
      } catch (error) {}
    }
  };

  const sendMediaMessage = async (
    receiverID: string,
    files: {
      name: string | null;
      uri: string;
      type: string | undefined;
      size: number | undefined;
    }[],
    organisationFrom?: string,
    organisationTo?: string,
    groupMember?: CometChat.User | null
  ) => {
    setLoading(true);
    setError(null);

    const mediaMessage = new CometChat.MediaMessage(receiverID, files, "image", "group");
    mediaMessage.setMetadata({
      organisation_from: organisationFrom,
      organisation_to: organisationTo,
    });

    try {
      const response = await CometChat.sendMediaMessage(mediaMessage);
      setMessage(response);
      // console.log("Media message sent successfully", response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Media message sending failed with error", error);
    } finally {
      setLoading(false);
      try {
        if (groupMember) {
          const customMsg = new CometChat.CustomMessage(groupMember?.getUid(), "user", "custom", {
            text: "You have a car message",
          });
          CometChat.sendCustomMessage(customMsg);
        }
      } catch (error) {}
    }
  };

  return { sendMessage, loading, error, message, sendMediaMessage };
};

export const useMarkMessageAsRead = () => {
  const { getUnreadMessages } = useGetUnreadMessages();
  const markAsRead = async (message: CometChat.BaseMessage) => {
    try {
      await CometChat.markAsRead(message);
      getUnreadMessages();
    } catch (error) {
      console.log("Error marking message as read:", error);
    }
  };

  return { markAsRead };
};

export const useTypingIndicator = () => {
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const startTyping = useCallback(
    (receiverId: string, receiverType: string) => {
      if (!isTyping) {
        let typingNotification: CometChat.TypingIndicator = new CometChat.TypingIndicator(
          receiverId,
          receiverType
        );
        CometChat.startTyping(typingNotification);
        setIsTyping(true);
      }
    },
    [isTyping]
  );

  const endTyping = useCallback(
    (receiverId: string, receiverType: string) => {
      if (isTyping) {
        let typingNotification: CometChat.TypingIndicator = new CometChat.TypingIndicator(
          receiverId,
          receiverType
        );
        CometChat.endTyping(typingNotification);
        setIsTyping(false);
      }
    },
    [isTyping]
  );

  return { startTyping, endTyping, isCurrentUserTyping: isTyping };
};

export const useGetUnreadMessages = () => {
  const { logout } = useAuth();
  const { setUnreadCount } = useMessageContext();

  const getUnreadMessages = async () => {
    try {
      const data = (await CometChat.getUnreadMessageCount()) as {
        groups: Record<string, number>;
        users: Record<string, number>;
      };
      let totalCount = 0;
      for (let key of Object.keys(data.users)) {
        totalCount += data.users[key];
      }

      for (let key of Object.keys(data.groups)) {
        totalCount += data.groups[key];
      }
      setUnreadCount(totalCount);
    } catch (error) {
      console.log("Error fetching unread messages:", error);
      if ((error as any).code === "USER_NOT_LOGED_IN") {
        showToast("Session expired", "Please login again", "error");
        logout();
      }
    }
  };

  useEffect(() => {
    getUnreadMessages();
  }, []);

  return { getUnreadMessages };
};
