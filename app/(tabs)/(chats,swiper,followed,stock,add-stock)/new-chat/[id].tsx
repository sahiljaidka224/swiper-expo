import { View, Pressable, ActivityIndicator, Alert, StyleSheet } from "react-native";
import React, { useCallback, useEffect } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useGetGroupMessages, useSendGroupMessage } from "@/hooks/cometchat/messages";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import Avatar from "@/components/Avatar";
import Text from "@/components/Text";
import { useGetGroup, useLeaveGroup } from "@/hooks/cometchat/groups";
import { formatNumberWithCommas } from "@/utils";
import ChatComponent from "@/components/ChatScreen";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { CometChat } from "@cometchat/chat-sdk-react-native";

export default function NewGroupChatPage() {
  const { id } = useLocalSearchParams();
  const { group, isGroupLoading } = useGetGroup(id as string);
  const {
    messages: chatMessages,
    error: fetchMessagesErr,
    loading,
    fetchMessages,
    hasMore,
    setMessages,
    isTyping,
  } = useGetGroupMessages(id as string);
  const { sendMessage } = useSendGroupMessage();

  const onSend = useCallback((messages: IMessage[], text: string) => {
    const updatedMessages = messages.map((m) => {
      return { ...m, received: true, from: 1 };
    });

    setMessages((previousMessages) => GiftedChat.append(previousMessages, updatedMessages));
    if (text.trimEnd().length > 0) sendMessage(id as string, text);
  }, []);

  return (
    <ChatComponent
      fetchMessages={fetchMessages}
      messages={chatMessages}
      onSend={onSend}
      hasMore={hasMore}
      loadingMore={loading}
      userId={id as string}
      Header={() => (
        <Header groupUID={id as string} group={group} isGroupLoading={isGroupLoading} />
      )}
      isTyping={isTyping}
      context="group"
      group={group}
    />
  );
}

const Header = ({
  groupUID,
  group,
  isGroupLoading,
}: {
  groupUID: string;
  group: CometChat.Group | null;
  isGroupLoading: boolean;
}) => {
  const segments = useSegments();
  const { leaveGroup, hasLeft, error } = useLeaveGroup();

  useEffect(() => {
    if (hasLeft && !error) {
      router.back();
    }
  }, [hasLeft]);

  if (!group && isGroupLoading) return <ActivityIndicator size="small" color={Colors.primary} />;
  if (!group) return null;

  const groupName = group.getName();
  const icon = group.getIcon();
  const metadata = group.getMetadata() as { carId: string; odometer: number; price: number };
  const memberScope = group.getScope() as CometChat.GroupMemberScope;

  const onPress = () => {
    if (!metadata?.carId) return;

    router.push({
      pathname: `/(tabs)/${segments[1]}/car/[id]`,
      params: { id: metadata?.carId },
    });
  };

  const onLeaveGroup = () => {
    leaveGroup(groupUID, memberScope);
  };

  const onLeaveGroupPress = () => {
    Alert.alert("Delete Chat", "Are you sure? This action cannot be reverted!", [
      { text: "Cancel" },
      { text: "Delete", onPress: onLeaveGroup },
    ]);
  };

  return (
    <Pressable style={styles.headerContainer} onPress={onPress}>
      <View style={styles.leftContainer}>
        <View style={styles.avatarContainer}>
          <Avatar source={icon} borderRadius={10} isCar />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name} allowFontScaling={false}>
            {groupName}
          </Text>
          <Text allowFontScaling={false} style={styles.extraInfo}>{`${formatNumberWithCommas(
            metadata.odometer
          )}KM - $${formatNumberWithCommas(metadata.price)}`}</Text>
        </View>
      </View>
      <Pressable onPress={onLeaveGroupPress}>
        <Ionicons name="exit-outline" size={24} color={Colors.primary} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingBottom: 4,
    alignItems: "center",
    flex: 1,
    maxWidth: "90%",
    alignSelf: "flex-start",
    justifyContent: "space-between",
  },
  leftContainer: { flexDirection: "row", gap: 10 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20 },
  textContainer: { flexDirection: "column" },
  name: { fontSize: 16, fontFamily: "SF_Pro_Display_Medium" },
  extraInfo: { fontSize: 14, fontFamily: "SF_Pro_Display_Medium" },
});
