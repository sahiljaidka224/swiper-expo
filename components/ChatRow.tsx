import Colors from "@/constants/Colors";
import { Link } from "expo-router";
import { TouchableHighlight, View, Animated, StyleSheet, I18nManager } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { Component, PropsWithChildren } from "react";

import { RectButton } from "react-native-gesture-handler";
import Text from "@/components/Text";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Avatar from "./Avatar";
import { formatTimestamp, isOutgoingMessage } from "@/utils/cometchat";

interface ChatRowProps {
  conversation: CometChat.Conversation;
}

export default function ChatRow({ conversation }: ChatRowProps) {
  const conversationWith = conversation.getConversationWith() as CometChat.User;
  const lastMessage: CometChat.TextMessage | CometChat.MediaMessage | CometChat.CustomMessage =
    conversation?.getLastMessage();
  const userUID = conversationWith.getUid();
  const userName = conversationWith.getName();
  const lastMessageSentAt = lastMessage.getSentAt();
  const sender = lastMessage.getSender();
  const senderUID = sender.getUid();
  const isRead = Boolean(lastMessage.getReadAt());
  const isDelivered = Boolean(lastMessage.getDeliveredAt());
  const isSent = Boolean(lastMessageSentAt);
  const isOutgoingMsg = isOutgoingMessage(senderUID, userUID);

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

  return (
    <AppleStyleSwipeableRow>
      <Link href={`/(tabs)/chats/${userUID}`} asChild>
        <TouchableHighlight activeOpacity={0.25} underlayColor={Colors.lightGrayBackground}>
          <View style={styles.container}>
            <View style={styles.avatarContainer}>
              <Avatar userId={userUID} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.nameText}>{userName}</Text>
              <Text style={styles.orgNameText}>{organisationFromName}</Text>
              <View style={styles.msgContainer}>
                {isSent && isOutgoingMsg && (
                  <Ionicons
                    name={isRead || isDelivered ? "checkmark-done-outline" : "checkmark-outline"}
                    size={18}
                    color={isRead ? Colors.primary : Colors.iconGray}
                  />
                )}
                <MessageText lastMessage={lastMessage} />
              </View>
            </View>
            <Text style={styles.timeStampContainer}>{formatTimestamp(lastMessageSentAt)}</Text>
          </View>
        </TouchableHighlight>
      </Link>
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

      return (
        <>
          <Text style={styles.msgText} numberOfLines={1}>
            {messageText}
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
    progress: Animated.AnimatedInterpolation<number>
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
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton style={[styles.rightAction, { backgroundColor: color }]} onPress={pressHandler}>
          <Ionicons
            name={text === "More" ? "ellipsis-horizontal" : "archive"}
            size={24}
            color={"#fff"}
            style={{ paddingTop: 10 }}
          />
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  private renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>
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
  leftAction: {
    flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center",
  },
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
    color: Colors.gray,
    top: 10,
    alignSelf: "flex-start",
    position: "absolute",
    right: 10,
  },
});
