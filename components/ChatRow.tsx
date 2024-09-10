import Colors from "@/constants/Colors";
import { Link } from "expo-router";
import {
  TouchableHighlight,
  View,
  Animated as RNAnimated,
  StyleSheet,
  I18nManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { Component, PropsWithChildren } from "react";

import { RectButton } from "react-native-gesture-handler";
import Text from "@/components/Text";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Avatar from "./Avatar";
import { formatTimestamp, isOutgoingMessage } from "@/utils/cometchat";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { useMarkMessageAsRead } from "@/hooks/cometchat/messages";

interface ChatRowProps {
  conversation: CometChat.Conversation;
  index: number;
}

export default function ChatRow({ conversation, index }: ChatRowProps) {
  const { user } = useAuth();
  const { markAsRead } = useMarkMessageAsRead();
  const conversationWith = conversation.getConversationWith();
  const unreadMessageCount = conversation.getUnreadMessageCount();

  const lastMessage: CometChat.TextMessage | CometChat.MediaMessage | CometChat.CustomMessage =
    conversation?.getLastMessage();
  if (!lastMessage) return null;

  const userUID =
    conversationWith instanceof CometChat.User ? conversationWith.getUid() : undefined;
  const groupUID =
    conversationWith instanceof CometChat.Group ? conversationWith.getGuid() : undefined;
  const userName = conversationWith.getName();

  let icon = undefined;
  if (conversationWith instanceof CometChat.Group) {
    icon = conversationWith.getIcon();
  }
  const lastMessageSentAt = lastMessage.getSentAt();
  const sender = lastMessage.getSender();
  const senderUID = sender.getUid();
  const isRead = Boolean(lastMessage.getReadAt());
  const isSent = Boolean(lastMessageSentAt);
  const isOutgoingMsg = user ? isOutgoingMessage(senderUID, user?.id) : undefined;

  const metadata = lastMessage.getMetadata() as {
    organisation_from: string;
    organisation_to: string;
  };
  let organisationFromName = "";
  if (metadata) {
    organisationFromName = isOutgoingMsg
      ? metadata["organisation_to"]
      : metadata["organisation_from"];
  }

  const onPress = () => {
    if (unreadMessageCount > 0) {
      markAsRead(lastMessage);
    }
  };

  return (
    <AppleStyleSwipeableRow>
      <Animated.View entering={FadeInUp.delay(index * 10)} exiting={FadeOutUp}>
        <Link
          href={userUID ? `/(tabs)/(chats)/${userUID}` : `/(tabs)/(chats)/new-chat/${groupUID}`}
          asChild
          onPress={onPress}
        >
          <TouchableHighlight activeOpacity={0.25} underlayColor={Colors.lightGrayBackground}>
            <View style={styles.container}>
              <View style={styles.avatarContainer}>
                <Avatar userId={userUID} source={icon} borderRadius={userUID ? 99999 : 12} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.nameText}>{userName}</Text>
                <Text style={styles.orgNameText}>
                  {organisationFromName && organisationFromName !== "undefined"
                    ? organisationFromName
                    : ""}
                </Text>
                <View style={styles.msgContainer}>
                  {isSent && isOutgoingMsg && (
                    <Ionicons
                      name={isRead || isSent ? "checkmark-done-outline" : "checkmark-outline"}
                      size={18}
                      color={isRead ? Colors.primary : Colors.iconGray}
                    />
                  )}
                  <MessageText lastMessage={lastMessage} />
                </View>
              </View>
              <View style={styles.timeStampContainer}>
                <Text
                  style={[
                    styles.timestamp,
                    { color: unreadMessageCount > 0 ? Colors.primary : Colors.gray },
                  ]}
                >
                  {formatTimestamp(lastMessageSentAt)}
                </Text>
                {unreadMessageCount > 0 ? (
                  <View style={styles.unreadCountContainer}>
                    <Text style={styles.unreadCount}>{unreadMessageCount}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableHighlight>
        </Link>
      </Animated.View>
    </AppleStyleSwipeableRow>
  );
}

function MessageText({
  lastMessage,
}: {
  lastMessage: CometChat.TextMessage | CometChat.MediaMessage | CometChat.CustomMessage;
}) {
  const lastMessageType = lastMessage.getType();
  let messageText = "";
  switch (lastMessageType) {
    case "image":
      messageText = "Image";
      return (
        <>
          <Ionicons name="image-outline" size={18} color="black" />
          <Text style={styles.msgText}>{messageText}</Text>
        </>
      );
    case "video":
      messageText = "Video";
      return (
        <>
          <Ionicons name="videocam-outline" size={18} color="black" />
          <Text style={styles.msgText}>{messageText}</Text>
        </>
      );
    default:
      if (lastMessage instanceof CometChat.TextMessage) {
        messageText = lastMessage.getText();
      }

      if (!messageText || !messageText.length) return;

      return (
        <>
          <Text style={styles.msgText} numberOfLines={1} ellipsizeMode="tail" lineBreakMode="clip">
            {messageText?.length > 40 ? `${messageText.slice(0, 40)}...` : messageText}
          </Text>
        </>
      );
  }
}

class AppleStyleSwipeableRow extends Component<PropsWithChildren<unknown>> {
  private renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: RNAnimated.AnimatedInterpolation<number>
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
    });
    const pressHandler = () => {
      this.close();
      // eslint-disable-next-line no-alert
      window.alert(text);
    };

    return (
      <RNAnimated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton style={[styles.rightAction, { backgroundColor: color }]} onPress={pressHandler}>
          <Ionicons
            name={text === "More" ? "ellipsis-horizontal" : "archive"}
            size={24}
            color={"#fff"}
            style={{ paddingTop: 10 }}
          />
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </RNAnimated.View>
    );
  };

  private renderRightActions = (
    progress: RNAnimated.AnimatedInterpolation<number>,
    _dragAnimatedValue: RNAnimated.AnimatedInterpolation<number>
  ) => (
    <View
      style={{
        width: 192,
        flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
      }}
    >
      {this.renderRightAction("Delete", Colors.muted, 192, progress)}
    </View>
  );

  private swipeableRow?: Swipeable;

  private updateRef = (ref: Swipeable) => {
    this.swipeableRow = ref;
  };
  private close = () => {
    this.swipeableRow?.close();
  };
  render() {
    const { children } = this.props;
    return (
      <Swipeable
        ref={this.updateRef}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={this.renderRightActions}
      >
        {children}
      </Swipeable>
    );
  }
}

const styles = StyleSheet.create({
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  avatarContainer: {
    width: 55,
    height: 55,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 10,
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  nameText: {
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Medium",
    color: Colors.textDark,
    lineHeight: 21,
    textTransform: "capitalize",
    maxWidth: "80%",
  },
  orgNameText: {
    fontSize: 16,
    color: Colors.textLight,
    fontFamily: "SF_Pro_Display_Light",
    textTransform: "capitalize",
  },
  msgText: {
    fontSize: 16,
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Regular",
    flex: 1,
    marginRight: 10,
  },
  msgContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 3,
  },
  timeStampContainer: {
    position: "absolute",
    flex: 1,
    right: 5,
    top: 5,
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 10,
  },
  unreadCountContainer: {
    backgroundColor: Colors.primary,
    borderRadius: 9999,
    padding: 5,
    paddingHorizontal: 10,
  },
  timestamp: {
    fontSize: 14,
    fontFamily: "SF_Pro_Display_Regular",
  },
  unreadCount: {
    color: "white",
    fontSize: 14,
    fontFamily: "SF_Pro_Display_Bold",
  },
});
