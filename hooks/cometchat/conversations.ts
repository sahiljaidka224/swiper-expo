import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useCallback, useEffect, useState } from "react";
import * as Haptics from "expo-haptics";
import { useGetUnreadMessages } from "./messages";
import { showToast } from "@/components/Toast";
import { usePathname } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useHideSenderContext } from "@/context/HideSenderContext";

export const useGetConversations = (type: "user" | "group" = "user") => {
  const { getUnreadMessages } = useGetUnreadMessages();
  const { setUsers, users } = useHideSenderContext();

  const { user: currentUser } = useAuth();
  const pathname = usePathname();

  const [conversationList, setConversationList] = useState<CometChat.Conversation[]>([]);
  const [error, setError] = useState<CometChat.CometChatException | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchConversations = async () => {
    const conversationsRequest = new CometChat.ConversationsRequestBuilder()
      .setConversationType(type)
      .setLimit(50)
      .build();

    try {
      const conversations = await conversationsRequest.fetchNext();
      setConversationList(conversations);

      if (conversations && conversations.length) {
        if (type === "group") {
          const groupConversations = conversations.filter((c) => {
            const unreadCount = c.getUnreadMessageCount();
            return unreadCount > 0;
          });

          const groupedByUser = groupConversations.reduce((acc, group) => {
            const conversationWith = group.getConversationWith();
            if (conversationWith instanceof CometChat.User) return acc;
            const groupId = conversationWith.getGuid();
            const unreadCount = group.getUnreadMessageCount();
            const metadata = conversationWith.getMetadata() as { members: string[] };
            const members = metadata?.members || [];

            const otherMember = members.find((member: string) => member !== currentUser?.id);
            if (!otherMember) return acc;

            if (!acc.has(otherMember)) acc.set(otherMember, []);
            acc.get(otherMember)?.push({ groupId, unreadCount });

            return acc;
          }, new Map<string, { groupId: string; unreadCount: number }[]>());

          const newUsers = new Map(users);

          Array.from(newUsers.keys()).forEach((memberId) => {
            if (!groupedByUser.has(memberId)) {
              newUsers.delete(memberId);
            }
          });

          groupedByUser.forEach((groups, memberId) => {
            const userGroups = newUsers.get(memberId) || new Map<string, { read: boolean }>();
            groups.forEach(({ groupId, unreadCount }) => {
              // if (unreadCount > 0) {
              userGroups.set(groupId, { read: false });
              // }
            });

            // const existingGroups = newUsers.get(memberId);
            // console.log("existingGroups", existingGroups);
            // if (existingGroups) {
            //   for (const [groupId, groupData] of existingGroups) {
            //     const existing = groups.find((g) => g.groupId === groupId);
            //     // console.log("existing", existing);
            //     if (userGroups.has(groupId) && !existing) {
            //       userGroups.set(groupId, { read: true });
            //     }
            //   }
            // }

            // Step 2c: Keep user in state if they have any groups
            if (userGroups.size > 0) {
              newUsers.set(memberId, userGroups);
            }
          });

          setUsers(newUsers);

          // for (let conversation of groupConversations) {
          //   const conversationWith = conversation.getConversationWith();
          //   if (conversationWith instanceof CometChat.Group) {
          //     const groupId = conversationWith.getGuid();
          //     const unreadCount = conversation.getUnreadMessageCount();
          //     const metadata = conversationWith.getMetadata() as { members: string[] };
          //     const members = metadata?.members || [];

          //     const otherMembers = members.filter((member: string) => member !== currentUser?.id);

          //     if (unreadCount > 0) {
          //       const memberId = otherMembers[0];
          //       if (!memberId) {
          //         continue;
          //       }
          //       let userGroups = newUsers.get(memberId);

          //       if (!userGroups) {
          //         userGroups = new Map<string, { read: boolean }>();
          //         newUsers.set(memberId, userGroups);
          //       }

          //       // if (userGroups.size !== 0 && userGroups.entries().some(([key, value]) => value.read)) {
          //       //   // add new group but keep old as well
          //       //   for (let [key, value] of userGroups.entries()) {
          //       //     if (key !== groupId) {
          //       //       userGroups.set(groupId, { read: false });
          //       //     }
          //       //   }

          //       // }

          //       // Add or update the group
          //       if (unreadCount > 0 && !userGroups.has(groupId)) {
          //         userGroups.set(groupId, { read: false });
          //       }
          //     }
          //   }
          // }
          // setUsers(newUsers);
        }
      }

      // if (type === "user") {
      //   if (conversations && conversations.length) {
      //     const newUsers = new Map<string, Map<string, { read: boolean }>>();
      //     for (let conversation of conversations) {
      //       const conversationWith = conversation.getConversationWith();
      //       if (conversationWith instanceof CometChat.User) {
      //         const UID = conversationWith.getUid();
      //         let userGroups = newUsers.get(UID);

      //         if (!userGroups) {
      //           userGroups = new Map<string, { read: boolean }>();
      //           newUsers.set(UID, userGroups);
      //         }
      //       }
      //     }
      //     setUsers(newUsers);
      //   }
      // }
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
          getUnreadMessages();
          const sender = textMessage.getSender();
          const senderUID = sender.getUid();

          if (!pathname.includes(senderUID) && senderUID !== currentUser?.id) {
            showToast(sender.getName(), textMessage.getText().substring(0, 40), "info");
          }
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        onMediaMessageReceived: (mediaMessage: CometChat.MediaMessage) => {
          fetchConversations();
          getUnreadMessages();

          const sender = mediaMessage.getSender();
          const senderUID = sender.getUid();
          if (!pathname.includes(senderUID) && senderUID !== currentUser?.id) {
            showToast(sender.getName(), "New Media", "info");
          }
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
        .setLimit(50)
        .withTags(true)
        .setConversationType("group")
        .setGroupTags(tags)
        .build();

      const conversations = await conversationsRequest.fetchNext();

      const sortedConversations = conversations.sort((a, b) => {
        const sentAtA = a?.getLastMessage()?.getSentAt();
        const sentAtB = b?.getLastMessage()?.getSentAt();
        const unreadCountA = a.getUnreadMessageCount();
        const unreadCountB = b.getUnreadMessageCount();

        if (unreadCountA !== unreadCountB) {
          return unreadCountB - unreadCountA;
        }

        return sentAtB - sentAtA;
      });

      setGroups(sortedConversations);
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
