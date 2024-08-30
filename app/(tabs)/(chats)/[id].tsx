import { View, Pressable, Platform, Alert } from "react-native";
import React, { useCallback, useEffect } from "react";
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
    setMessages,
    isTyping,
  } = useGetMessages(id as string);
  const { sendMessage, sendMediaMessage } = useSendMessage();

  useEffect(() => {
    if (fetchMessagesErr && !loading) {
      Alert.alert("Error", "Failed to fetch messages", [{ text: "OK" }]);
      router.back();
    }
  }, [fetchMessagesErr, loading]);

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
      for (let [index, file] of result.assets.entries()) {
        const uri = file.uri;
        let name: string | null = "";
        let type: string | undefined = "";

        if (Platform.OS === "ios" && file.fileName !== undefined) {
          name = file.fileName;
          type = file.type;
        } else {
          type = file.type;
          name = `Camera_0${index}.jpeg`;
        }

        if (type === "video") {
          type = "video/quicktime";
          name = `Camera_0${index}.mov`;
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
                name: user?.displayName,
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
    <ChatComponent
      fetchMessages={fetchMessages}
      messages={chatMessages}
      onSend={onSend}
      hasMore={hasMore}
      loadingMore={loading}
      pickImage={pickImage}
      userId={id as string}
      Header={() => (
        <Header userId={id as string} isLoading={isUserLoading} name={user?.displayName} />
      )}
      isTyping={isTyping}
      context="user"
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
