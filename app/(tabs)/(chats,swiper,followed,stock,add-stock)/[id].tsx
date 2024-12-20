import { View, Pressable, Alert, StyleSheet } from "react-native";
import React, { memo, useCallback, useEffect } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

import { useGetMessages, useSendMessage } from "@/hooks/cometchat/messages";
import { router, Stack, useFocusEffect, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { useGetUserDetails } from "@/api/hooks/user";
import Text from "@/components/Text";
import ChatComponent from "@/components/ChatScreen";
import { useAuth } from "@/context/AuthContext";
import { useGetGroupConversationsWithTags } from "@/hooks/cometchat/conversations";
import Colors from "@/constants/Colors";

export default function ChatDetailsPage() {
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { groupConversations, getGroups } = useGetGroupConversationsWithTags([id as string]);
  const { user, isLoading: isUserLoading } = useGetUserDetails(id as string);

  const {
    messages: chatMessages,
    error: fetchMessagesErr,
    loading,
    fetchMessages,
    hasMore,
    setMessages,
    isTyping,
  } = useGetMessages(id as string);
  const { sendMessage } = useSendMessage();

  useEffect(() => {
    if (fetchMessagesErr && !loading) {
      Alert.alert("Error", "Failed to fetch messages", [{ text: "OK" }]);
      router.back();
    }
  }, [fetchMessagesErr, loading]);

  // To clear unread messages
  useFocusEffect(
    useCallback(() => {
      getGroups();

      return () => {};
    }, [])
  );

  const onSend = useCallback((messages: IMessage[], text: string) => {
    const updatedMessages = messages.map((m) => {
      return { ...m, received: true, from: 1 };
    });

    setMessages((previousMessages) => GiftedChat.append(previousMessages, updatedMessages));
    if (text.trimEnd().length > 0)
      sendMessage(
        id as string,
        text,
        currentUser?.org?.name ?? undefined,
        user?.organisations[0]?.name ?? undefined
      );
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <Header userId={id as string} isLoading={isUserLoading} name={user?.displayName} />
          ),
        }}
      />
      <ChatComponent
        fetchMessages={fetchMessages}
        messages={chatMessages}
        onSend={onSend}
        hasMore={hasMore}
        loadingMore={loading}
        userId={id as string}
        isTyping={isTyping}
        context="user"
        userOrgName={
          user?.organisations && user?.organisations.length > 0
            ? user?.organisations[0]?.name
            : undefined
        }
        carGroups={groupConversations}
        groupMembers={[]}
      />
    </>
  );
}

const Header = memo(
  ({ userId, isLoading, name }: { isLoading: boolean; userId: string; name: string }) => {
    if (isLoading) return null;

    const onPress = useCallback(() => {
      router.push({
        pathname: `/(tabs)/(chats)/user/${userId}`,
        params: { id: userId },
      });
    }, [userId]);

    return (
      <Pressable style={styles.headerContainer} onPress={onPress}>
        <View style={styles.avatarContainer}>
          <Avatar userId={userId} showOnlineIndicator />
        </View>
        <Text style={styles.name} allowFontScaling={false}>
          {name}
        </Text>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    gap: 10,
    paddingBottom: 4,
    alignItems: "center",
    flex: 1,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
    zIndex: 1,
  },
  avatarContainer: { width: 40, height: 40 },
  name: { fontSize: 16, fontFamily: "SF_Pro_Display_Medium" },
});
