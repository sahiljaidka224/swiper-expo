import { ImageBackground, StyleSheet, View, Text } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  MessageImageProps,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useGetMessages, useSendMessage } from "@/hooks/cometchat/messages";
import { Stack, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { Image } from "expo-image";
import { useGetUserDetails } from "@/api/hooks/user";
import { useAssets } from "expo-asset";

const backroundPattern = require("@/assets/images/pattern.png");

export default function ChatDetailsPage() {
  const [assets, error] = useAssets([backroundPattern]);
  const { id } = useLocalSearchParams();
  const {
    messages: chatMessages,
    error: fetchMessagesErr,
    loading,
    fetchMessages,
    hasMore,
  } = useGetMessages(id as string);
  const {sendMessage} = useSendMessage();
  const [messages, setMessages] = useState<IMessage[]>();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setMessages([
      ...chatMessages,
      {
        _id: 0,
        system: true,
        text: "All your messages are encrypted and secured",
        createdAt: new Date(),
        user: {
          _id: 0,
          name: "Bot",
        },
      },
    ]);
  }, [chatMessages]);

  const onSend = useCallback((messages: IMessage[], text: string) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    sendMessage(id as string, text)
  }, []);

  return (
    <ImageBackground
      source={assets ? assets[0] : backroundPattern}
      style={{ flex: 1, marginBottom: insets.bottom, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          headerTitle: () => <Header userId={id as string} />,
        }}
      />
      <GiftedChat
        messages={messages}
        alignTop
        scrollToBottom
        onSend={(messages: IMessage[]) => onSend(messages, text)}
        user={{ _id: 1, name: "Domenic" }}
        onInputTextChanged={setText}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        minInputToolbarHeight={50}
        maxComposerHeight={100}
        infiniteScroll
        loadEarlier={hasMore}
        isLoadingEarlier={loading}
        // renderMessageImage={MessageImage}
        onLoadEarlier={() => {
          fetchMessages();
        }}
        keyboardShouldPersistTaps="handled"
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: Colors.gray }} />
        )}
        renderBubble={(props) => {
          return <Bubble {...props} />;
        }}
        renderSend={(props) => (
          <View style={styles.sendContainer}>
            {text.length > 0 && (
              <Send {...props} containerStyle={{ justifyContent: "center" }}>
                <Ionicons name="send" color={Colors.primary} size={28} />
              </Send>
            )}
            {text.length === 0 && (
              <>
                <Ionicons name="camera-outline" color={Colors.primary} size={28} />
                <Ionicons name="mic-outline" color={Colors.primary} size={28} />
              </>
            )}
          </View>
        )}
        textInputProps={styles.composer}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{ backgroundColor: Colors.background }}
            renderActions={() => (
              <View style={{ height: 44, justifyContent: "center", alignItems: "center", left: 5 }}>
                <Ionicons name="add" color={Colors.primary} size={28} />
              </View>
            )}
          />
        )}
      />
    </ImageBackground>
  );
}

const Header = ({ userId }: { userId: string }) => {
  const { user, isLoading } = useGetUserDetails(userId);
  if (!user || isLoading) return;

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 10,
        paddingBottom: 4,
        alignItems: "center",
        flex: 1,
      }}
    >
      <View style={{ width: 40, height: 40 }}>
        <Avatar userId={userId} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: "500" }}>{user?.displayName}</Text>
    </View>
  );
};

const MessageImage = (props: MessageImageProps<IMessage>) => {
  return (
    <View style={{ borderRadius: 20, padding: 2, height: 150, width: 250 }}>
      <Image
        source={props.currentMessage?.image}
        contentFit="cover"
        style={{ width: "100%", height: "100%", borderRadius: 5 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  composer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: 10,
    fontSize: 16,
    marginVertical: 4,
    paddingTop: 8,
  },
  sendContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    gap: 14,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
});
