import { ImageBackground, StyleSheet, View, Pressable, Platform, TextInput } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Bubble,
  DayProps,
  GiftedChat,
  IMessage,
  InputToolbar,
  MessageImageProps,
  MessageTextProps,
  Send,
  SendProps,
  SystemMessageProps,
  TimeProps,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useGetMessages, useSendMessage } from "@/hooks/cometchat/messages";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { Image } from "expo-image";
import { useGetUserDetails } from "@/api/hooks/user";
import { useAssets } from "expo-asset";
import * as ImagePicker from "expo-image-picker";
import { ResizeMode, Video } from "expo-av";
import Text from "@/components/Text";
import { format } from "date-fns";

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
  const { sendMessage, sendMediaMessage } = useSendMessage();
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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      let files = [];
      for (let file of result.assets) {
        const uri = file.uri;
        let name: string | null = "";
        let type: string | undefined = "";

        if (Platform.OS === "ios" && file.fileName !== undefined) {
          name = file.fileName;
          type = file.type;
        } else {
          type = file.type;
          name = "Camera_001.jpeg";
        }

        if (type === "video") {
          type = "video/quicktime";
          name = "Camera_002.mov";
        }
        // TODO: handle video

        let tempFile = {
          name: name,
          type: Platform.OS === "android" ? file.type : type,
          uri: Platform.OS === "android" ? file.uri : file.uri.replace("file://", ""),
          size: file.fileSize,
        };

        files.push(tempFile);

        onSend(
          [
            {
              _id: file.fileName ?? file.assetId ?? Math.floor(Math.random() * 1000),
              text: "",
              image: type === "image" ? uri : undefined,
              video: type === "video" ? uri : undefined,
              createdAt: new Date(),
              user: {
                _id: 1,
                name: "Bob",
              },
            },
          ],
          ""
        );
      }

      sendMediaMessage(id as string, files);
    }
  };

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

  const onSend = useCallback((messages: IMessage[], text: string) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    if (text.trimEnd().length > 0) sendMessage(id as string, text);
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
        // scrollToBottom
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
        renderDay={(props: DayProps<IMessage>) => null}
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
        renderTicks={RenderTicks}
        textInputProps={styles.composer}
        renderTime={RenderTime}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={{ backgroundColor: Colors.background }} />
        )}
      />
    </ImageBackground>
  );
}

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

const Header = ({ userId }: { userId: string }) => {
  const { user, isLoading } = useGetUserDetails(userId);
  if (!user || isLoading) return;

  const onPress = () => {
    router.push({
      pathname: `/(tabs)/(chats)/user/${userId}`,
      params: { id: userId },
    });
  };

  return (
    <Pressable
      style={{
        flexDirection: "row",
        gap: 10,
        paddingBottom: 4,
        alignItems: "center",
        flex: 1,
      }}
      onPress={onPress}
    >
      <View style={{ width: 40, height: 40 }}>
        <Avatar userId={userId} />
      </View>
      <Text style={{ fontSize: 16, fontWeight: "500" }}>{user?.displayName}</Text>
    </Pressable>
  );
};

const MessageImage = (props: MessageImageProps<IMessage>) => {
  return (
    <View style={styles.mediaContainer}>
      <Image
        priority="high"
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
});
