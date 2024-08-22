import { useAuth } from "@/context/AuthContext";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { IMessage } from "react-native-gifted-chat";

export const useGetMessages = (toId: string) => {
  const { user } = useAuth();
  const messageRequest = useRef<CometChat.MessagesRequest | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

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

      const mapped: IMessage[] = fetchedMessages.flatMap((m) => {
        const sender = m.getSender();
        const messageType = m.getType();
        const data = m.getData();
        const from = user?.id === sender.getUid();
        const sentAt = m.getSentAt();
        const received = m.getReadAt();

        const baseMessage = {
          _id: m.getId(),
          from: from ? 1 : 0,
          createdAt: new Date(sentAt * 1000),
          sent: Boolean(sentAt),
          received: Boolean(received),
          user: {
            _id: from ? 1 : 0,
            name: from ? "You" : "Bob",
          },
        };

        if (messageType === "image" || messageType === "video") {
          // Return multiple messages for each attachment
          return data.attachments.map((attachment: { url: string }) => ({
            ...baseMessage,
            _id: m.getId() + Math.floor(Math.random() * 1000),
            image: messageType === "image" ? attachment.url : undefined,
            video: messageType === "video" ? attachment.url : undefined,
            text: "",
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

        // If the message type is not handled, return an empty array (no message)
        return [];
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

  return { messages, error, loading, hasMore, fetchMessages };
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

  const sendMessage = async (receiverID: string, messageText: string) => {
    setLoading(true);
    setError(null);

    const textMessage = new CometChat.TextMessage(receiverID, messageText, "user");

    try {
      const response = await CometChat.sendMessage(textMessage);
      setMessage(response);
      // console.log("Message sent successfully:", response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Message sending failed with error:", error);
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
    }[]
  ) => {
    setLoading(true);
    setError(null);

    const mediaMessage = new CometChat.MediaMessage(receiverID, files, "image", "user");

    try {
      const response = await CometChat.sendMediaMessage(mediaMessage);
      setMessage(response);
      // console.log("Media message sent successfully", response);
    } catch (error) {
      setError(error as CometChat.CometChatException);
      console.log("Media message sending failed with error", error);
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading, error, message, sendMediaMessage };
};