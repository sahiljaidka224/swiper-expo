import {
  ImageBackground,
  StyleSheet,
  View,
  Pressable,
  Platform,
  FlatList,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import React, { memo, useEffect, useState } from "react";
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
  MessageText as GiftedChatMessageText,
} from "react-native-gifted-chat";
import TypingIndicator from "react-native-gifted-chat/lib/TypingIndicator";
import { Image } from "expo-image";
import dayjs from "dayjs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { ResizeMode, Video } from "expo-av";
import Text from "@/components/Text";
import { format } from "date-fns";
import { useChatContext } from "react-native-gifted-chat/lib/GiftedChatContext";
import { useAssets } from "expo-asset";
import { useAuth } from "@/context/AuthContext";
import {
  useSendGroupMessage,
  useSendMessage,
  useTypingIndicator,
} from "@/hooks/cometchat/messages";
import * as Linking from "expo-linking";

import * as ImagePicker from "expo-image-picker";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Avatar from "./Avatar";
import { showToast } from "./Toast";
import Gallery from "./Gallery";
import * as MediaLibrary from "expo-media-library";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useHeaderHeight } from "@react-navigation/elements";
import { ScrollView, SheetManager } from "react-native-actions-sheet";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const backroundPattern = require("@/assets/images/pattern.png");
const audioAsset = require("@/assets/audio/pop-alert.mp3");
const garageAsset = require("@/assets/audio/car-garage.wav");

interface ChatComponentProps {
  userId: string;
  messages: IMessage[] | undefined;
  onSend: (messages: IMessage[], text: string) => void;
  hasMore: boolean;
  loadingMore: boolean;
  fetchMessages: () => void;
  Header?: () => React.ReactNode;
  GroupInfo?: () => React.ReactNode;
  isTyping: boolean;
  context: "user" | "group";
  userOrgName?: string;
  carGroups?: CometChat.Conversation[] | null;
  group?: CometChat.Group | null;
  groupMembers?: CometChat.User[] | null;
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
  groupMembers,
  GroupInfo,
}: ChatComponentProps) {
  const headerHeight = useHeaderHeight();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([backroundPattern]);
  const [text, setText] = useState<string>("");
  const [isGalleryVisible, setGalleryVisible] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { startTyping, endTyping } = useTypingIndicator();
  const {
    sendMediaMessage,
    loading: isSendMsgInProgress,
    error,
    message: sentMessage,
  } = useSendMessage();
  const { sendMediaMessage: sendGroupMediaMessage } = useSendGroupMessage();
  const [cameraStatus, requestCameraPermission] = ImagePicker.useCameraPermissions();
  const [sound, setSound] = useState<Sound>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [garageSound, setGarageSound] = useState<Sound>();

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    return garageSound
      ? () => {
          garageSound.unloadAsync();
        }
      : undefined;
  }, [garageSound]);

  async function playGarageSound() {
    try {
      if (isPlaying) return;
      setIsPlaying(true);
      const { sound } = await Audio.Sound.createAsync(garageAsset);
      setGarageSound(sound);

      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) {
          if (status.error) {
            console.log(`Encountered a fatal error during playback: ${status.error}`);
          }
        } else {
          if (status.didJustFinish) {
            setIsPlaying(false);
            sound.unloadAsync();
          }
        }
      });
    } catch (error) {
      console.log("error", error);
    }
  }

  async function playSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(audioAsset);
      setSound(sound);

      await sound.playAsync();
    } catch (error) {
      console.log("error", error);
    }
  }

  const triggerSendMediaMessage = (
    result: ImagePicker.ImagePickerSuccessResult,
    source: "camera" | "gallery" = "gallery"
  ) => {
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

      if (source === "camera") {
        MediaLibrary.saveToLibraryAsync(uri)
          .then()
          .catch(() => showToast("Error", "Please allow Swiper to save images.", "error"));
      }

      let tempFile = {
        name: name,
        type: Platform.OS === "android" && type !== "video" ? `image/${file.type}` : type,
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
      playSound();
    }
    if (context === "group")
      sendGroupMediaMessage(
        userId,
        files,
        undefined,
        undefined,
        groupMembers ? groupMembers[0] : null
      );
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
          triggerSendMediaMessage(result, "camera");
        }
      }
    } catch (error) {
      console.log(error);
      showToast("Error", "Failed to send image from camera", "error");
    }
  };

  const onShowActionSheet = () => {
    SheetManager.show("camera-sheet").then((result) => {
      setTimeout(() => {
        if (!result) return;
        if (result === "camera") {
          onPickImageFromCamera();
          return;
        }

        onPickImageFromGallery();
      }, 100);
    });
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

  const onGalleryOpen = (url: string) => {
    setSelectedImage(url);
    setGalleryVisible(true);
  };

  const onGalleryClose = () => {
    setGalleryVisible(false);
    setSelectedImage(null);
  };

  const onQuickReply = (text: string) => {
    if (text.length === 0) return;
    onSend(
      [
        {
          _id: Math.floor(Math.random() * 100000),
          text: text,
          image: undefined,
          video: undefined,
          createdAt: new Date(),
          user: {
            _id: 1,
            name: user?.name,
          },
          pending: isSendMsgInProgress,
        },
      ],
      text
    );
    playSound();
  };

  return (
    <ImageBackground
      source={assets ? assets[0] : backroundPattern}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      {Header ? (
        <Stack.Screen
          options={{
            headerTitle: () => <Header />,
          }}
        />
      ) : null}
      {carGroups && carGroups.length > 0 ? (
        <View style={styles.carGroupWrapper}>
          <FlatList<CometChat.Conversation>
            data={carGroups}
            style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            keyExtractor={(item: unknown) => {
              const conversation = item as CometChat.Conversation;
              return conversation.getConversationId();
            }}
            renderItem={({ item, index }) => <HorizontalItem item={item} index={index} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => {
              playGarageSound();
            }}
          />
        </View>
      ) : null}
      {GroupInfo ? <GroupInfo /> : null}
      {isGalleryVisible && selectedImage && (
        <Gallery
          images={[{ url: selectedImage, imageIndex: 0 }]}
          isVisible={isGalleryVisible}
          onClose={onGalleryClose}
          setSelectedIndex={() => {}}
          selectedIndex={0}
        />
      )}
      <View
        style={{
          position: "absolute",
          bottom: 60,
          paddingHorizontal: 10,
          width: "100%",
          zIndex: 100,
        }}
      >
        <ScrollView
          horizontal
          scrollEnabled={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={styles.quickReplyContainer}
            onPress={() => {
              onQuickReply("👍");
            }}
          >
            <Text style={styles.quickReplyText}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickReplyContainer}
            onPress={() => {
              onQuickReply("I'm interested");
            }}
          >
            <Text style={styles.quickReplyText}>I'm interested</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickReplyContainer}
            onPress={() => {
              onQuickReply("I'll get back to you");
            }}
          >
            <Text style={styles.quickReplyText}>I'll get back to you</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <GiftedChat
        isKeyboardInternallyHandled={false}
        isTyping={isTyping}
        messages={
          messages
            ? [
                ...messages,
                {
                  _id: "1",
                  text: "Swiper provides end-to-end encryption for all messages sent and received.",
                  createdAt: 0,
                  user: { _id: 1, name: "User" },
                  system: true,
                },
              ]
            : []
        }
        alignTop
        scrollToBottom
        scrollToBottomComponent={() => <Text>V</Text>}
        onSend={(messages: IMessage[]) => {
          onSend(messages, text);
          playSound();
        }}
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
          paddingTop: carGroups && carGroups.length > 0 ? 100 : 0,
          paddingBottom: 40,
        }}
        bottomOffset={0}
        renderAvatar={null}
        minInputToolbarHeight={50}
        maxComposerHeight={100}
        infiniteScroll
        loadEarlier={hasMore}
        isLoadingEarlier={loadingMore}
        renderMessageImage={(props) => (
          <MessageImage
            {...props}
            isVisible={isGalleryVisible}
            onOpen={() => {
              if (props.currentMessage?.image) onGalleryOpen(props.currentMessage?.image);
            }}
            onClose={onGalleryClose}
          />
        )}
        renderMessageVideo={MessageVideo}
        onLoadEarlier={() => {
          fetchMessages();
        }}
        keyboardShouldPersistTaps="handled"
        renderSystemMessage={SystemMessageText}
        renderBubble={(props) => {
          if (props.currentMessage?.image || props.currentMessage?.video) {
            return (
              <Bubble
                {...props}
                bottomContainerStyle={{
                  left: {
                    position: "absolute",
                    left: 2,
                    bottom: 2,
                    paddingHorizontal: 5,
                  },
                  right: {
                    position: "absolute",
                    left: 2,
                    bottom: 2,
                    width: "100%",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    paddingHorizontal: 5,
                  },
                }}
              />
            );
          }
          return <Bubble {...props} />;
        }}
        renderDay={(props: DayProps<IMessage>) => <Day {...props} />}
        renderMessageText={MessageText}
        renderSend={(props) => (
          <View style={styles.sendContainer}>
            {text.length > 0 && (
              <Send
                {...props}
                containerStyle={{
                  justifyContent: "center",
                  backgroundColor: Colors.primary,
                  borderRadius: 18,
                  height: 36,
                  width: 36,
                  alignItems: "center",
                  paddingLeft: 3,
                }}
              >
                <Ionicons name="send-sharp" color={Colors.background} size={22} />
              </Send>
            )}
            {text.length === 0 && (
              <Pressable onPress={onShowActionSheet}>
                <Ionicons name="camera-outline" color={Colors.primary} size={28} />
              </Pressable>
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
            containerStyle={{
              backgroundColor: Colors.background,
            }}
            primaryStyle={{
              display: "flex",
              alignItems: "center",
            }}
            renderComposer={(props) => (
              <Composer
                {...props}
                textInputProps={{
                  ...props,
                  maxFontSizeMultiplier: 1.3,
                }}
                textInputStyle={styles.inputStyle}
              />
            )}
          />
        )}
        parsePatterns={(linkStyle) => [
          {
            type: "url",
            style: { ...linkStyle, textDecorationLine: "underline" },
            onPress: (url: string) => Linking.openURL(url),
          },
        ]}
        renderFooter={() => <TypingIndicator isTyping={isTyping} />}
      />
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : headerHeight}
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
        <Ionicons name="checkmark-done-sharp" size={20} color={Colors.background} />
      </View>
    );

  if (props.received)
    return (
      <View style={{ margin: 4 }}>
        <Ionicons name="checkmark-sharp" size={20} color={Colors.background} />
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
        fontSize: 14,
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
      style={{
        textAlign: "center",
        color: Colors.muted,
        fontSize: 12,
        paddingVertical: 12,
        paddingHorizontal: 18,
        letterSpacing: 0.1,
      }}
      maxFontSizeMultiplier={1.2}
    >
      {props.currentMessage?.text}
    </Text>
  );
};

const MessageText = (props: MessageTextProps<IMessage>) => {
  return (
    <GiftedChatMessageText
      {...props}
      textProps={{ maxFontSizeMultiplier: 1.3 }}
      linkStyle={{
        right: {
          color: "#fff",
        },
        left: {
          color: Colors.primary,
        },
      }}
      textStyle={{
        left: { ...styles.messageText, color: Colors.textDark },
        right: { ...styles.messageText, color: "#fff" },
      }}
    />
  );
};

const MessageImage = (
  props: MessageImageProps<IMessage> & {
    isVisible: boolean;
    onClose: () => void;
    onOpen: () => void;
  }
) => {
  if (!props.currentMessage?.image) return null;

  return (
    <>
      <Pressable
        onPress={() =>
          router.push(
            "/(tabs)/(chats)/users-list?allowMultiple=true&uri=" + props.currentMessage?.image
          )
        }
        style={[
          styles.forwardContainer,
          {
            left: props.currentMessage?.user?._id === 1 ? -40 : null,
            right: props.currentMessage?.user?._id === 0 ? -40 : null,
          },
        ]}
      >
        <FontAwesome name="mail-forward" size={14} color={Colors.background} />
      </Pressable>
      <TouchableOpacity
        style={styles.mediaContainer}
        onPress={() => {
          props.onOpen();
        }}
      >
        <Image
          allowDownscaling
          recyclingKey={props.currentMessage?.image}
          alt="image"
          contentFit="cover"
          source={{ uri: props?.currentMessage?.image }}
          style={[props.imageStyle, styles.image]}
          priority="high"
          cachePolicy="memory-disk"
        />
        <LinearGradient
          colors={["transparent", "rgba(3, 3, 3, 0.4)"]} // Adjust end color for shadow intensity
          style={styles.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </TouchableOpacity>
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
          {dayjs(currentMessage.createdAt).locale(getLocale()).format("D MMM, YYYY")}
        </Text>
      </View>
    </View>
  );
};

const HorizontalItem = memo(({ item, index }: { item: CometChat.Conversation; index: number }) => {
  const conversationWith = item.getConversationWith();
  const icon = conversationWith instanceof CometChat.Group ? conversationWith.getIcon() : undefined;
  const name = conversationWith.getName();
  const groupUID =
    conversationWith instanceof CometChat.Group ? conversationWith.getGuid() : undefined;
  const lastMessage = item.getLastMessage();
  const unreadCount = item.getUnreadMessageCount();

  if (lastMessage instanceof CometChat.Action && lastMessage.getAction() === "added") {
    return null;
  }

  const translateY = useSharedValue(-75);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  React.useEffect(() => {
    translateY.value = translateY.value = withDelay(
      index * 100,
      withSpring(0, {
        damping: 10,
        stiffness: 100,
        mass: 1,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
      })
    );
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 500 }));
  }, []);

  return (
    <Animated.View style={[animatedStyle, { maxWidth: 70, alignItems: "center", marginRight: 8 }]}>
      <Pressable
        onPress={() => {
          router.navigate(`/(tabs)/(chats)/new-chat/${groupUID}`);
        }}
      >
        <View
          style={{
            height: 60,
            width: 60,
            borderWidth: unreadCount > 0 ? 2 : 0,
            borderColor: unreadCount > 0 ? Colors.primary : undefined,
            padding: 2,
            borderRadius: 10,
          }}
        >
          <Avatar
            source={icon}
            isCar={Boolean(conversationWith instanceof CometChat.Group)}
            borderRadius={12}
          />
        </View>
        <Text
          numberOfLines={1}
          style={{
            textAlign: "center",
            fontFamily: "SF_Pro_Display_Regular",
            fontSize: 14,
          }}
        >
          {name}
        </Text>
      </Pressable>
    </Animated.View>
  );
});

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
  mediaContainer: { borderRadius: 30, height: 250, width: 280, padding: 2 },
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
  forwardContainer: {
    position: "absolute",
    top: "50%",
    backgroundColor: Colors.iconGray,
    padding: 6,
    borderRadius: 50,
  },
  image: { width: "100%", height: "100%", borderRadius: 15, padding: 1 },
  inputStyle: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: 10,
    fontSize: 18,
    marginVertical: 10,
    paddingTop: 8,
    fontFamily: "SF_Pro_Display_Regular",
    lineHeight: 18,
    minHeight: 42,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 50,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  quickReplyContainer: {
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    minWidth: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: `rgba(255 255 255 / 0.8)`,
  },
  quickReplyText: {
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Medium",
    color: Colors.textDark,
  },
});
