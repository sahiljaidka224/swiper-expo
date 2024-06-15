import { ImageBackground, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import messageData from "@/assets/data/messages.json";
import {
  Bubble,
  GiftedChat,
  IMessage,
  InputToolbar,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ChatDetailsPage() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const insets = useSafeAreaInsets();
  const [text, setText] = useState<string>("");

  useEffect(() => {
    setMessages([
      ...messageData.map((message) => {
        return {
          _id: message.id,
          text: message.msg,
          createdAt: new Date(message.date),
          user: {
            _id: message.from,
            name: message.from ? "You" : "Bob",
          },
        };
      }),
      {
        _id: 0,
        system: true,
        text: "All your base are belong to us",
        createdAt: new Date(),
        user: {
          _id: 0,
          name: "Bot",
        },
      },
    ]);
  }, []);

  const onSend = useCallback((messages: IMessage[]) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
  }, []);

  return (
    <ImageBackground
      source={require("@/assets/images/pattern.png")}
      style={{ flex: 1, marginBottom: insets.bottom, backgroundColor: Colors.background }}
    >
      <GiftedChat
        messages={messages}
        onSend={(messages: IMessage[]) => onSend(messages)}
        user={{ _id: 1 }}
        onInputTextChanged={setText}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        maxComposerHeight={100}
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: Colors.gray }} />
        )}
        renderBubble={(props) => {
          return <Bubble {...props} />;
        }}
        renderSend={(props) => (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              height: 44,
              gap: 14,
              justifyContent: "center",
              paddingHorizontal: 14,
            }}
          >
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
});
