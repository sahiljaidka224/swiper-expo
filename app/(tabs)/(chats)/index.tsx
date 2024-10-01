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
import { useCallback, useEffect, useState } from "react";
import Colors from "@/constants/Colors";
import ChatRow from "@/components/ChatRow";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { FontAwesome5 } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import Text from "@/components/Text";
import { useMarkMessageAsRead } from "@/hooks/cometchat/messages";

import * as Notifications from "expo-notifications";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { User } from "../(chats,swiper,followed,stock,add-stock)/users-list";
import NoConversations from "@/components/NoConversations";

const transition = CurvedTransition.delay(100);

function useNotificationObserver(fetchConversations: () => void) {
  useEffect(() => {
    let isMounted = true;

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      fetchConversations();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      fetchConversations();
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
export default function Chats() {
  const { users } = useGetCometChatUsers();
  const {
    conversationList: userConversations,
    error,
    loading,
    fetchConversations,
  } = useGetConversations("user");
  const { conversationList: groupConversationList, fetchConversations: fetchGroupConversations } =
    useGetConversations("group");
  const { markAsRead } = useMarkMessageAsRead();
  const [searchText, setSearchText] = useState<string | null>(null);
  useNotificationObserver(fetchConversations);

  const groups = groupConversationList.filter((c) => {
    const unreadCount = c.getUnreadMessageCount();
    return unreadCount > 0;
  });

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
      fetchGroupConversations();

      return () => {};
    }, [])
  );

  const filteredUserConversations = userConversations.filter((c) => {
    const conversationWith = c.getConversationWith();
    if (!searchText) return true;

    if (conversationWith instanceof CometChat.User) {
      const user = conversationWith as CometChat.User;

      const searchLower = searchText.toLowerCase().trimEnd();
      const [firstName, lastName] = user.getName().toLowerCase().replace(/\s+/g, " ").split(" ");

      return (
        firstName.startsWith(searchLower) ||
        lastName.startsWith(searchLower) ||
        `${firstName} ${lastName}`.startsWith(searchLower)
      );
    }
    return false;
  });

  const filteredUsers = users.filter((user) => {
    if (!searchText) return false;
    if (
      filteredUserConversations.some((c) => {
        const conversationWith = c.getConversationWith();
        if (conversationWith instanceof CometChat.User) {
          return conversationWith.getUid() === user.getUid();
        }

        return false;
      })
    ) {
      return false;
    }

    const searchLower = searchText.toLowerCase().trimEnd();
    const [firstName, lastName] = user.getName().toLowerCase().replace(/\s+/g, " ").split(" ");

    return (
      firstName.startsWith(searchLower) ||
      lastName.startsWith(searchLower) ||
      `${firstName} ${lastName}`.startsWith(searchLower)
    );
  });

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
    [filteredUserConversations]
  );

  const renderUserItem: ListRenderItem<unknown> = useCallback(
    ({ item }) => {
      const onPress = () => {
        const userUID = (item as CometChat.User).getUid();
        router.push(`/(tabs)/(chats)/${userUID}`);
      };

      return (
        <User
          user={item as CometChat.User}
          onPress={onPress}
          selected={false}
          multipleSelectionAllowed={false}
        />
      );
    },
    [filteredUsers]
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
            <Avatar source={icon} isCar />
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
      contentContainerStyle={{
        paddingBottom: 20,
        backgroundColor: Colors.background,
      }}
    >
      <Stack.Screen
        options={{
          title: "Chats",
          headerSearchBarOptions: {
            placeholder: "Search Users",
            onChangeText: (e) => {
              setSearchText(e.nativeEvent.text);
            },
            onCancelButtonPress: () => {
              setSearchText(null);
            },
            onSearchButtonPress: (e) => {
              setSearchText(e.nativeEvent.text);
            },
          },
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/(chats)/users-list")}
              style={{ flexDirection: "row" }}
            >
              <FontAwesome5 name="user-friends" size={24} color={Colors.primary} />
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
          data={filteredUserConversations}
          refreshing={loading}
          itemLayoutAnimation={transition}
          keyExtractor={(item: unknown) => {
            const conversation = item as CometChat.Conversation;
            return conversation.getConversationId();
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderItem}
          ListFooterComponent={
            filteredUserConversations.length <= 3 && !searchText ? <NoConversations /> : null
          }
        />
        <Animated.FlatList
          contentInsetAdjustmentBehavior="automatic"
          skipEnteringExitingAnimations
          scrollEnabled={false}
          data={filteredUsers}
          refreshing={loading}
          itemLayoutAnimation={transition}
          keyExtractor={(item: unknown) => {
            const user = item as CometChat.User;
            return user.getUid();
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderUserItem}
        />
      </Animated.View>
    </ScrollView>
  );
}

function ItemSeparator() {
  return <View style={[defaultStyles.separator, { marginLeft: 90 }]} />;
}
