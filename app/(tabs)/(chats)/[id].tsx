import { View, Pressable, Platform, Alert } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";

import { useGetMessages, useSendMessage } from "@/hooks/cometchat/messages";
import { router, useLocalSearchParams } from "expo-router";
import Avatar from "@/components/Avatar";
import { useGetUserDetails } from "@/api/hooks/user";
import * as ImagePicker from "expo-image-picker";
import Text from "@/components/Text";
import ChatComponent from "@/components/ChatScreen";
import { useAuth } from "@/context/AuthContext";

export default function ChatDetailsPage() {
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();

  const { user, isLoading: isUserLoading } = useGetUserDetails(id as string);

  const {
    messages: chatMessages,
    error: fetchMessagesErr,
    loading,
    fetchMessages,
    hasMore,
  } = useGetMessages(id as string);
  const { sendMessage, sendMediaMessage } = useSendMessage();
  const [messages, setMessages] = useState<IMessage[]>();

  useEffect(() => {
    if (fetchMessagesErr && !loading) {
      Alert.alert("Error", "Failed to fetch messages", [{ text: "OK" }]);
      router.back();
    }
  }, [fetchMessagesErr, loading]);

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

      sendMediaMessage(
        id as string,
        files,
        currentUser?.org?.name ?? undefined,
        user?.organisations[0]?.name ?? undefined
      );
    }
  };

  const onSend = useCallback((messages: IMessage[], text: string) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages));
    if (text.trimEnd().length > 0)
      sendMessage(
        id as string,
        text,
        currentUser?.org?.name ?? undefined,
        user?.organisations[0]?.name ?? undefined
      );
  }, []);

  return (
    <ChatComponent
      fetchMessages={fetchMessages}
      messages={messages}
      onSend={onSend}
      hasMore={hasMore}
      loadingMore={loading}
      pickImage={pickImage}
      userId={id as string}
      Header={() => (
        <Header userId={id as string} isLoading={isUserLoading} name={user?.displayName} />
      )}
    />
  );
}

const Header = ({
  userId,
  isLoading,
  name,
}: {
  isLoading: boolean;
  userId: string;
  name: string;
}) => {
  if (isLoading) return;

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
      <Text style={{ fontSize: 16, fontFamily: "SF_Pro_Display_Medium" }} allowFontScaling={false}>
        {name}
      </Text>
    </Pressable>
  );
};
