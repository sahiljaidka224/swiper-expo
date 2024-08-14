import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useEffect, useState } from "react";
import { IMessage } from "react-native-gifted-chat";

export const useGetMessages = (toId: string) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMessages = async () => {
      const messageRequest = new CometChat.MessagesRequestBuilder()
        .setUID(toId)
        .setTypes(["text", "image", "video"])
        .hideDeletedMessages(true)
        .setLimit(20)
        .build();

      try {
        const messages = await messageRequest.fetchPrevious();
        const mapped: IMessage[] = messages.map((m) => {
          const sender = m.getSender();
          const messageType = m.getType();
          const data = m.getData();
          let messageText = "";
          let imageUrl = "";
          let videoUrl = "";
          const from = "4d306670-e733-11ee-95bb-d90b8dbd243d" === sender.getUid();

          if (messageType === "image") {
            imageUrl = data.attachments[0].url;
          } else if (messageType === "video") {
            videoUrl = data.attachments[0].url;
          } else if (messageType === "text") {
            try {
              const jsonContent = JSON.parse(data.text);
              if (typeof jsonContent !== "object") throw new Error("Bad json");
              messageText = jsonContent.message;
            } catch {
              messageText = data.text || data.action;
            }
          }

          return {
            _id: m.getId(),
            from: from ? 1 : 0,
            createdAt: new Date(m.getSentAt() * 1000),
            sent: Boolean(m.getSentAt()),
            received: Boolean(m.getReadAt()),
            text: messageText ?? "",
            user: {
              _id: from ? 1 : 0,
              name: from ? "You" : "Bob",
            },
            image: imageUrl,
            video: videoUrl,
          };
        });
        setMessages(mapped);
      } catch (err) {
        setError(err as CometChat.CometChatException);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  return { messages, error, loading };
};
