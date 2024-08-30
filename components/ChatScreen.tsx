import { ImageBackground, StyleSheet, View, Pressable } from "react-native";
import React, { useState } from "react";
import {
  Bubble,
  Composer,
  DATE_FORMAT,
  DayProps,
  GiftedChat,
  IMessage,
  InputToolbar,
  isSameDay,
  MessageImageProps,
  MessageTextProps,
  Send,
  SystemMessageProps,
  TimeProps,
  MessageImage as GiftedChatMessageImage,
} from "react-native-gifted-chat";
import TypingIndicator from "react-native-gifted-chat/lib/TypingIndicator";

import dayjs from "dayjs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image } from "expo-image";

import { ResizeMode, Video } from "expo-av";
import Text from "@/components/Text";
import { format } from "date-fns";
import { useChatContext } from "react-native-gifted-chat/lib/GiftedChatContext";
import { useAssets } from "expo-asset";
import { useAuth } from "@/context/AuthContext";
import { useTypingIndicator } from "@/hooks/cometchat/messages";

const backroundPattern = require("@/assets/images/pattern.png");

interface ChatComponentProps {
  userId: string;
  messages: IMessage[] | undefined;
  onSend: (messages: IMessage[], text: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  fetchMessages: () => void;
  pickImage: () => void;
  Header: () => React.ReactNode;
  isTyping: boolean;
  context: "user" | "group";
}

export default function ChatComponent({
  pickImage,
  userId,
  messages,
  onSend,
  hasMore,
  loadingMore,
  fetchMessages,
  Header,
  isTyping,
  context,
}: ChatComponentProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([backroundPattern]);
  const [text, setText] = useState<string>("");
  const { startTyping, endTyping } = useTypingIndicator();

  return (
    <ImageBackground
      source={assets ? assets[0] : backroundPattern}
      style={{ flex: 1, marginBottom: insets.bottom, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          headerTitle: () => <Header />,
        }}
      />
      <GiftedChat
        isTyping={isTyping}
        messages={messages}
        alignTop
        scrollToBottom
        scrollToBottomComponent={() => <Text>V</Text>}
        onSend={(messages: IMessage[]) => onSend(messages, text)}
        user={{ _id: 1, name: user?.name }}
        onInputTextChanged={(text) => {
          setText(text);
          if (text.length > 0) {
            startTyping(userId, context);
          } else if (text.length === 0) {
            endTyping(userId, context);
          }
        }}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        minInputToolbarHeight={50}
        maxComposerHeight={100}
        infiniteScroll
        loadEarlier={hasMore}
        isLoadingEarlier={loadingMore}
        renderMessageImage={MessageImage}
        renderMessageVideo={MessageVideo}
        onLoadEarlier={() => {
          fetchMessages();
        }}
        keyboardShouldPersistTaps="handled"
        renderSystemMessage={SystemMessageText}
        renderBubble={(props) => {
          return <Bubble {...props} />;
        }}
        renderDay={(props: DayProps<IMessage>) => <Day {...props} />}
        renderMessageText={MessageText}
        renderSend={(props) => (
          <View style={styles.sendContainer}>
            {text.length > 0 && (
              <Send {...props} containerStyle={{ justifyContent: "center" }}>
                <Ionicons name="send" color={Colors.primary} size={28} />
              </Send>
            )}
            {text.length === 0 && (
              <>
                <Pressable onPress={pickImage}>
                  <Ionicons name="camera-outline" color={Colors.primary} size={28} />
                </Pressable>
                <Ionicons name="mic-outline" color={Colors.primary} size={28} />
              </>
            )}
          </View>
        )}
        // It's there in the docs and it works, but it's not in the types
        renderTicks={RenderTicks}
        textInputProps={styles.composer}
        renderTime={RenderTime}
        listViewProps={{ keyboardDismissMode: "on-drag" }}
        renderInputToolbar={(props) => (
          <InputToolbar
            {...props}
            containerStyle={{ backgroundColor: Colors.background }}
            renderComposer={(props) => (
              <Composer
                {...props}
                textInputProps={{
                  ...props,
                  maxFontSizeMultiplier: 2,
                }}
                textInputStyle={{
                  borderRadius: 15,
                  borderWidth: 1,
                  borderColor: Colors.lightGray,
                  paddingHorizontal: 10,
                  fontSize: 16,
                  marginVertical: 10,
                  paddingTop: 8,
                  fontFamily: "SF_Pro_Display_Regular",
                }}
              />
            )}
          />
        )}
        renderFooter={() => <TypingIndicator isTyping={isTyping} />}
      />
    </ImageBackground>
  );
}

const MessageVideo = (props: any) => {
  const { currentMessage } = props;
  return (
    <View style={styles.mediaContainer}>
      <Video
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls
        shouldPlay={false}
        source={{ uri: currentMessage.video }}
        style={styles.video}
      />
    </View>
  );
};

const RenderTicks = (props: any) => {
  if (!props.from) return;

  if (props.sent)
    return (
      <View style={{ margin: 4, justifyContent: "center" }}>
        <Ionicons name="checkmark-done" size={18} color="#fff" />
      </View>
    );

  if (props.received)
    return (
      <View style={{ margin: 4 }}>
        <Ionicons name="checkmark" size={18} color="#fff" />
      </View>
    );

  return null;
};

const RenderTime = (props: TimeProps<IMessage>) => {
  if (!props.currentMessage?.createdAt) return;
  return (
    <Text
      style={{
        color: props.position === "left" ? Colors.textDark : "#fff",
        fontSize: 12,
        textAlign: "center",
        padding: 5,
      }}
    >
      {format(props.currentMessage?.createdAt, "hh:mm a")}
    </Text>
  );
};

const SystemMessageText = (props: SystemMessageProps<IMessage>) => {
  return (
    <Text
      {...props}
      style={{ textAlign: "center", color: Colors.gray, fontSize: 10, paddingVertical: 12 }}
    >
      {props.currentMessage?.text}
    </Text>
  );
};

const MessageText = (messageText: MessageTextProps<IMessage>) => {
  return (
    <View style={styles.messageTextWrapper}>
      <Text
        {...messageText}
        style={[
          styles.messageText,
          {
            color: messageText.position === "left" ? Colors.textDark : "#fff",
          },
        ]}
      >
        {messageText.currentMessage?.text}
      </Text>
    </View>
  );
};

const MessageImage = (props: MessageImageProps<IMessage>) => {
  return (
    <View style={styles.mediaContainer}>
      <GiftedChatMessageImage
        {...props}
        imageProps={{
          resizeMode: "cover",

          loadingIndicatorSource: { uri: props.currentMessage?.image },
        }}
        imageStyle={[props.imageStyle, { width: "98%", height: "97%", borderRadius: 5 }]}
      />
    </View>
  );
};

const Day = ({
  dateFormat = DATE_FORMAT,
  currentMessage,
  previousMessage,
  containerStyle,
  wrapperStyle,
  textStyle,
}: DayProps<IMessage>) => {
  const { getLocale } = useChatContext();
  if (currentMessage == null || isSameDay(currentMessage, previousMessage)) {
    return null;
  }
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={wrapperStyle}>
        <Text style={[styles.text, textStyle]}>
          {dayjs(currentMessage.createdAt).locale(getLocale()).format(dateFormat)}
        </Text>
      </View>
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
  video: { width: "100%", height: "100%", borderRadius: 5 },
  mediaContainer: { borderRadius: 30, padding: 5, height: 175, width: 250 },
  messageTextWrapper: {
    padding: 8,
  },
  messageText: {
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 16,
    color: "#fff",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  text: {
    backgroundColor: "transparent",
    color: Colors.gray,
    fontSize: 12,
    fontWeight: "600",
  },
});
