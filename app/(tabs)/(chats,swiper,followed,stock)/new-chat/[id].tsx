import { View, Pressable, Platform, ActivityIndicator, Alert } from "react-native";
import React, { useCallback } from "react";
import { GiftedChat, IMessage } from "react-native-gifted-chat";
import { useGetGroupMessages, useSendGroupMessage } from "@/hooks/cometchat/messages";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import Avatar from "@/components/Avatar";
import * as ImagePicker from "expo-image-picker";
import Text from "@/components/Text";
import { useGetGroup } from "@/hooks/cometchat/groups";
import { formatNumberWithCommas } from "@/utils";
import ChatComponent from "@/components/ChatScreen";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

export default function NewGroupChatPage() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const {
    messages: chatMessages,
    error: fetchMessagesErr,
    loading,
    fetchMessages,
    hasMore,
    setMessages,
    isTyping,
  } = useGetGroupMessages(id as string);
  const { sendMessage, sendMediaMessage } = useSendGroupMessage();

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
                name: user?.name,
              },
            },
          ],
          ""
        );
      }

      sendMediaMessage(id as string, files);
    }
  };

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
      pickImage={pickImage}
      userId={id as string}
      Header={() => <Header groupUID={id as string} />}
      isTyping={isTyping}
      context="group"
    />
  );
}

const Header = React.memo(({ groupUID }: { groupUID: string }) => {
  const segments = useSegments();
  const { group, isGroupLoading } = useGetGroup(groupUID);
  if (!group || isGroupLoading) return <ActivityIndicator size="small" color={Colors.primary} />;

  const groupName = group.getName();
  const icon = group.getIcon();
  const metadata = group.getMetadata() as { carId: string; odometer: number; price: number };

  const onPress = () => {
    if (!metadata?.carId) return;

    router.push({
      pathname: `/(tabs)/${segments[1]}/car/[id]`,
      params: { id: metadata?.carId },
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
        <Avatar source={icon} />
      </View>
      <View style={{ flexDirection: "column" }}>
        <Text
          style={{ fontSize: 16, fontFamily: "SF_Pro_Display_Medium" }}
          allowFontScaling={false}
        >
          {groupName}
        </Text>
        <Text
          allowFontScaling={false}
          style={{ fontSize: 14, fontFamily: "SF_Pro_Display_Medium" }}
        >{`${formatNumberWithCommas(metadata.odometer)}KM - $${formatNumberWithCommas(
          metadata.price
        )}`}</Text>
      </View>
    </Pressable>
  );
});
