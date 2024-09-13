import {
  View,
  ScrollView,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  Pressable,
} from "react-native";
import { defaultStyles } from "@/constants/Styles";
import { useGetConversations } from "@/hooks/cometchat/conversations";
import ChatRowLoader from "@/components/SkeletonLoaders/ChatRowLoader";
import ErrorView from "@/components/Error";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect } from "react";
import Colors from "@/constants/Colors";
import ChatRow from "@/components/ChatRow";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FontAwesome6 } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import Text from "@/components/Text";
import { useMarkMessageAsRead } from "@/hooks/cometchat/messages";

import * as Notifications from "expo-notifications";

const transition = CurvedTransition.delay(100);

function useNotificationObserver(fetchConversations: () => void) {
  useEffect(() => {
    let isMounted = true;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      console.log("index.tsx: getLastNotificationResponseAsync", {
        response: response?.notification.request,
      });
      if (!isMounted || !response?.notification) {
        return;
      }
      fetchConversations();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("index.tsx: addNotificationResponseReceivedListener", {
        response: response.notification.request,
      });
      fetchConversations();
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
export default function Chats() {
  const { conversationList, error, loading, fetchConversations } = useGetConversations();
  const { markAsRead } = useMarkMessageAsRead();
  useNotificationObserver(fetchConversations);

  const groups = conversationList.filter((c) => {
    const unreadCount = c.getUnreadMessageCount();
    return unreadCount > 0 && c.getConversationType() === "group";
  });

  const userConversations = conversationList.filter((c) => c.getConversationType() === "user");

  useFocusEffect(
    useCallback(() => {
      fetchConversations();

      return () => {};
    }, [])
  );

  const onProfilePress = () => {
    router.push("/(chats)/settings");
  };

  const onFeedPress = () => {
    router.push("/(chats)/feed");
  };

  const renderItem: ListRenderItem<unknown> = useCallback(
    ({ item, index }) => {
      return (
        <ChatRow
          conversation={item as CometChat.Conversation}
          index={index}
          refetch={fetchConversations}
        />
      );
    },
    [userConversations]
  );

  const horizontalRenderItem: ListRenderItem<CometChat.Conversation> = useCallback(
    ({ item }: { item: CometChat.Conversation }) => {
      const conversationWith = item.getConversationWith();
      const icon =
        conversationWith instanceof CometChat.Group ? conversationWith.getIcon() : undefined;
      const name = conversationWith.getName();
      const groupUID =
        conversationWith instanceof CometChat.Group ? conversationWith.getGuid() : undefined;

      const unreadCount = item.getUnreadMessageCount();
      if (unreadCount === 0) return null;

      return (
        <Pressable
          style={{ maxWidth: 80, alignItems: "center", marginRight: 10 }}
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
            <Avatar source={icon} />
          </View>
          <Text numberOfLines={3} style={{ textAlign: "center" }}>
            {name}
          </Text>
        </Pressable>
      );
    },
    [groups]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          title: "Chats",
          headerLeft: () => (
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <TouchableOpacity onPress={onProfilePress}>
                <AntDesign name="user" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onFeedPress}>
                <FontAwesome name="newspaper-o" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={() => router.push("/(tabs)/(chats)/users-list")}>
              <FontAwesome6 name="user-plus" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      {loading && (
        <>
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
        </>
      )}
      {error && <ErrorView />}
      {/* <View style={{ alignItems: "center", marginVertical: 10 }}>
        <SegmentedControl
          options={["Chats", "Groups"]}
          selectedOption={selectedOption}
          onOptionPress={setSelectedOption}
          width={275}
        />
      </View> */}
      {groups && groups.length > 0 ? (
        <View
          style={{
            backgroundColor: "white",
            marginTop: 10,
            width: "95%",
            alignSelf: "center",
            zIndex: 100,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <FlatList<CometChat.Conversation>
            data={groups}
            style={{ paddingHorizontal: 10, paddingVertical: 10 }}
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

      <Animated.View layout={transition}>
        <Animated.FlatList
          contentInsetAdjustmentBehavior="automatic"
          skipEnteringExitingAnimations
          scrollEnabled={false}
          data={userConversations}
          refreshing={loading}
          itemLayoutAnimation={transition}
          keyExtractor={(item: unknown) => {
            const conversation = item as CometChat.Conversation;
            return conversation.getConversationId();
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderItem}
        />
      </Animated.View>
    </ScrollView>
  );
}

function ItemSeparator() {
  return <View style={[defaultStyles.separator, { marginLeft: 90 }]} />;
}
