import {
  ImageBackground,
  StyleSheet,
  View,
  Pressable,
  Platform,
  FlatList,
  ListRenderItem,
} from "react-native";
import React, { useCallback, useState } from "react";
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
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";

import { ResizeMode, Video } from "expo-av";
import Text from "@/components/Text";
import { format } from "date-fns";
import { useChatContext } from "react-native-gifted-chat/lib/GiftedChatContext";
import { useAssets } from "expo-asset";
import { useAuth } from "@/context/AuthContext";
import {
  useMarkMessageAsRead,
  useSendGroupMessage,
  useSendMessage,
  useTypingIndicator,
} from "@/hooks/cometchat/messages";
import * as Linking from "expo-linking";
import { useActionSheet } from "@expo/react-native-action-sheet";

import * as ImagePicker from "expo-image-picker";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Avatar from "./Avatar";
import { showToast } from "./Toast";
import { useGetGroupMembers } from "@/hooks/cometchat/groups";

const backroundPattern = require("@/assets/images/pattern.png");
const options = ["Gallery", "Camera", "Cancel"];

interface ChatComponentProps {
  userId: string;
  messages: IMessage[] | undefined;
  onSend: (messages: IMessage[], text: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  fetchMessages: () => void;
  Header: () => React.ReactNode;
  isTyping: boolean;
  context: "user" | "group";
  userOrgName?: string;
  carGroups?: CometChat.Conversation[] | null;
  group?: CometChat.Group | null;
}

export default function ChatComponent({
  userId,
  messages,
  onSend,
  hasMore,
  loadingMore,
  fetchMessages,
  Header,
  isTyping,
  context,
  userOrgName,
  carGroups,
}: ChatComponentProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([backroundPattern]);
  const [text, setText] = useState<string>("");
  const { startTyping, endTyping } = useTypingIndicator();
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    sendMediaMessage,
    loading: isSendMsgInProgress,
    error,
    message: sentMessage,
  } = useSendMessage();
  const { sendMediaMessage: sendGroupMediaMessage } = useSendGroupMessage();
  const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();

  const { markAsRead } = useMarkMessageAsRead();
  const { groupMembers } = useGetGroupMembers(context === "group" ? userId : null);

  const triggerSendMediaMessage = (result: ImagePicker.ImagePickerSuccessResult) => {
    let files = [];
    for (let [index, file] of result.assets.entries()) {
      const uri = file.uri;
      let name: string | null = "";
      let type: string | undefined = "";

      if (Platform.OS === "ios" && file.fileName) {
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
            pending: isSendMsgInProgress,
          },
        ],
        ""
      );
    }
    if (context === "group") sendGroupMediaMessage(userId, files);
    else sendMediaMessage(userId, files, user?.org?.name ?? undefined, userOrgName ?? undefined);
  };

  const onPickImageFromCamera = async () => {
    if (cameraStatus) {
      if (
        cameraStatus.status === ImagePicker.PermissionStatus.UNDETERMINED ||
        (cameraStatus.status === ImagePicker.PermissionStatus.DENIED && cameraStatus.canAskAgain)
      ) {
        const permission = await requestCameraPermission();
        if (permission.granted) {
          await handleLaunchCamera();
        }
      } else if (cameraStatus.status === ImagePicker.PermissionStatus.DENIED) {
        await Linking.openSettings();
      } else {
        await handleLaunchCamera();
      }
    }
  };

  const handleLaunchCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [4, 3],
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });
      if (!result.canceled) {
        if (result.assets.length > 0) {
          triggerSendMediaMessage(result);
        }
      }
    } catch (error) {
      console.log(error);
      showToast("Error", "Failed to send image from camera", "error");
    }
  };

  const onShowActionSheet = () => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: any) => {
        if (buttonIndex !== cancelButtonIndex) {
          switch (buttonIndex) {
            case 0:
              onPickImageFromGallery();
              break;

            default:
              onPickImageFromCamera();
              break;
          }
        }
      }
    );
  };

  const onPickImageFromGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      triggerSendMediaMessage(result);
    }
  };

  const horizontalRenderItem: ListRenderItem<CometChat.Conversation> = useCallback(
    ({ item }: { item: CometChat.Conversation }) => {
      const conversationWith = item.getConversationWith();
      const icon =
        conversationWith instanceof CometChat.Group ? conversationWith.getIcon() : undefined;
      const name = conversationWith.getName();
      const groupUID =
        conversationWith instanceof CometChat.Group ? conversationWith.getGuid() : undefined;

      const unreadCount = item.getUnreadMessageCount();

      return (
        <Pressable
          style={{ maxWidth: 70, alignItems: "center", marginRight: 15 }}
          onPress={() => {
            const lastMessage = item.getLastMessage();
            markAsRead(lastMessage);
            router.push(`/(tabs)/(chats)/new-chat/${groupUID}`);
          }}
        >
          <View
            style={{
              height: 54,
              width: 54,
              borderWidth: unreadCount > 0 ? 2 : 0,
              borderColor: unreadCount > 0 ? Colors.primary : undefined,
              borderRadius: 27,
              padding: 2,
            }}
          >
            <Avatar source={icon} isCar={Boolean(conversationWith instanceof CometChat.Group)} />
          </View>
          <Text
            numberOfLines={3}
            style={{ textAlign: "center", fontFamily: "SF_Pro_Display_Regular", fontSize: 13 }}
          >
            {name}
          </Text>
        </Pressable>
      );
    },
    [carGroups]
  );

  return (
    <ImageBackground
      source={assets ? assets[0] : backroundPattern}
      style={{ flex: 1, marginBottom: insets.bottom, backgroundColor: Colors.background }}
    >
      {carGroups && carGroups.length > 0 ? (
        <View style={styles.carGroupWrapper}>
          <FlatList<CometChat.Conversation>
            data={carGroups}
            style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            keyExtractor={(item: unknown) => {
              const conversation = item as CometChat.Conversation;
              return conversation.getConversationId();
            }}
            renderItem={horizontalRenderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      ) : null}
      {groupMembers && groupMembers.length > 0 ? (
        <View style={styles.carGroupWrapper}>
          {groupMembers.map((member) => {
            const memberUID = member.getUid();
            if (memberUID === user?.id) {
              return null;
            }
            return (
              <Pressable style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
                <View style={{ width: 40, height: 40 }}>
                  <Avatar userId={member.getUid()} />
                </View>
                <Text style={{ marginLeft: 10 }}>{member.getName()}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
        messagesContainerStyle={{
          paddingTop:
            carGroups && carGroups.length > 0
              ? 100
              : groupMembers && groupMembers.length > 0
              ? 60
              : 0,
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
                <Pressable onPress={onShowActionSheet}>
                  <Ionicons name="camera-outline" color={Colors.primary} size={28} />
                </Pressable>
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
    <>
      <Pressable
        onPress={() =>
          router.push(
            "/(tabs)/(chats)/users-list?allowMultiple=true&uri=" + props.currentMessage?.image
          )
        }
        style={{
          position: "absolute",
          left: props.currentMessage?.user?._id === 1 ? -40 : null,
          right: props.currentMessage?.user?._id === 0 ? -40 : null,
          top: "50%",
          backgroundColor: Colors.iconGray,
          padding: 6,
          borderRadius: 50,
        }}
      >
        <FontAwesome name="mail-forward" size={14} color={Colors.background} />
      </Pressable>
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
    </>
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
  carGroupWrapper: {
    position: "absolute",
    backgroundColor: "white",
    width: "100%",
    alignSelf: "center",
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
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
