import {
  View,
  ScrollView,
  TouchableOpacity,
  ListRenderItem,
  FlatList,
  Pressable,
  StyleSheet,
  AppState,
  SafeAreaView,
} from "react-native";
import { defaultStyles } from "@/constants/Styles";
import { useGetConversations } from "@/hooks/cometchat/conversations";
import ChatRowLoader from "@/components/SkeletonLoaders/ChatRowLoader";
import ErrorView from "@/components/Error";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import Colors from "@/constants/Colors";
import ChatRow from "@/components/ChatRow";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Animated, {
  CurvedTransition,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import Avatar from "@/components/Avatar";
import Text from "@/components/Text";
import { useMarkMessageAsRead } from "@/hooks/cometchat/messages";
import * as Contacts from "expo-contacts";
import * as Linking from "expo-linking";
import * as Notifications from "expo-notifications";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { User } from "../(chats,swiper,followed,stock,add-stock)/users-list";
import NoConversations from "@/components/NoConversations";
import { showToast } from "@/components/Toast";
import * as SMS from "expo-sms";
import React from "react";
import { useMessageContext } from "@/context/MessageContext";
import { Shadow } from "react-native-shadow-2";
import { Audio } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

const transition = CurvedTransition.delay(100);
const landingAsset = require("@/assets/audio/car-landing.wav");

function useNotificationObserver(
  fetchConversations: () => void,
  fetchGroupConversations: () => void
) {
  useEffect(() => {
    let isMounted = true;

    async function handleNotification() {
      fetchConversations();
      fetchGroupConversations();
      try {
        Notifications.setBadgeCountAsync(0);
        Notifications.dismissAllNotificationsAsync();
      } catch (error) {
        console.error(error);
      }
    }

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!isMounted || !response?.notification) {
        return;
      }
      handleNotification();
    });

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      handleNotification();
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
export default function Chats() {
  const isFocused = useIsFocused();
  const [landingSound, setLandingSound] = useState<Audio.Sound | null>(null);
  const { unreadCount } = useMessageContext();
  const [phoneContacts, setPhoneContacts] = useState<Contacts.Contact[]>([]);
  const [searchText, setSearchText] = useState<string | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const { users } = useGetCometChatUsers();
  const {
    conversationList: userConversations,
    error,
    loading,
    fetchConversations,
  } = useGetConversations("user", true);
  const { conversationList: groupConversationList, fetchConversations: fetchGroupConversations } =
    useGetConversations("group", isFocused);
  const { markAsRead } = useMarkMessageAsRead();
  useNotificationObserver(fetchConversations, fetchGroupConversations);

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

  useEffect(() => {
    return landingSound
      ? () => {
          landingSound.unloadAsync();
        }
      : undefined;
  }, [landingSound]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setPhoneContacts(data);
        }
      } else if (status === Contacts.PermissionStatus.DENIED) {
        await Linking.openSettings();
      }
    })();
  }, []);

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      fetchConversations();
      if (isFocused) {
        fetchGroupConversations();
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      fetchConversations();
      if (isFocused) {
        fetchGroupConversations();
      }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        try {
          fetchConversations();
          if (isFocused) {
            fetchGroupConversations();
          }
          Notifications.setBadgeCountAsync(0);
          Notifications.dismissAllNotificationsAsync();
        } catch (error) {
          console.error(error);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused]);

  useEffect(() => {
    fetchConversations();
    if (isFocused) {
      fetchGroupConversations();
    }
  }, [unreadCount, isFocused]);

  const filteredPhoneContacts = phoneContacts.filter((contact) => {
    if (!searchText) return false;
    if (!contact.name) {
      return false;
    }
    const [firstName, lastName] = contact.name.toLowerCase().split(" ");
    return (
      firstName?.startsWith(searchText.toLowerCase()) ||
      lastName?.startsWith(searchText.toLowerCase())
    );
  });

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
          refetch={() => {
            fetchConversations();
            fetchGroupConversations();
          }}
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

  const renderPhoneItem: ListRenderItem<Contacts.Contact> = useCallback(
    ({ item }) => {
      const onPress = async () => {
        let message =
          "Let’s Chat on Swiper. It’s my main app for all car messaging. Lots of cool features and FREE PPSR searches, download Swiper for Apple: https://apps.apple.com/au/app/swiper/id6648779114";

        const isAvailable = await SMS.isAvailableAsync();

        if (isAvailable && item.phoneNumbers && item.phoneNumbers[0].number) {
          const { result } = await SMS.sendSMSAsync([item.phoneNumbers[0].number], message);
          if (result === "sent") {
            showToast("Success", "SMS sent successfully ✅", "success");
          } else {
            showToast("Error", "SMS failed to send ❌", "error");
          }
        } else {
          showToast("Error", "SMS is not available on this device ❌", "error");
        }
      };

      return (
        <Pressable style={styles.userContainer} onPress={onPress}>
          <View style={styles.leftContainer}>
            <View style={styles.avatarContainer}>
              <Avatar userId={""} />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              {item.phoneNumbers && (
                <Text style={styles.orgName}>{item?.phoneNumbers[0]?.number}</Text>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [filteredPhoneContacts]
  );

  async function playLandingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(landingAsset);
      setLandingSound(sound);

      await sound.playAsync();
    } catch (error) {
      console.log("error", error);
    }
  }

  const horizontalRenderItem: ListRenderItem<CometChat.Conversation> = useCallback(
    ({ item, index }) => {
      const onMarkAsRead = async (message: CometChat.BaseMessage) => {
        markAsRead(message);
        fetchConversations();
        fetchGroupConversations();
      };
      return (
        <AnimatedItem
          item={item}
          index={index}
          markAsRead={onMarkAsRead}
          onPlayLandingSound={playLandingSound}
        />
      );
    },
    [groups]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
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
              <View style={{ flexDirection: "row", gap: 25, alignItems: "center" }}>
                <TouchableOpacity onPress={onProfilePress}>
                  <FontAwesome5 name="user-alt" size={24} s color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={onFeedPress}>
                  <MaterialIcons name="ondemand-video" size={28} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/(chats)/users-list")}
                style={{ flexDirection: "row" }}
              >
                <FontAwesome5 name="users" size={24} color={Colors.primary} />
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
              width: "100%",
              alignSelf: "center",
              zIndex: 1,
              height: groups.length > 0 ? undefined : 0,
              backgroundColor: "transparent",
              paddingVertical: 10,
            }}
          >
            <FlatList<CometChat.Conversation>
              data={groups ?? []}
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
        <Animated.View layout={transition} style={{ backgroundColor: Colors.background }}>
          <Shadow
            sides={{ top: true, bottom: false, start: false, end: false }}
            offset={[0, 0]}
            distance={70}
            startColor={"#b9d2fd"}
            endColor={"#ffffff1a"}
          >
            <View
              style={{
                width: "100%",
              }}
            ></View>
          </Shadow>
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
          <Animated.FlatList
            contentInsetAdjustmentBehavior="automatic"
            skipEnteringExitingAnimations
            scrollEnabled={false}
            data={filteredPhoneContacts}
            ListHeaderComponent={
              filteredPhoneContacts.length > 0 && searchText ? (
                <View>
                  <Text
                    style={{
                      textAlign: "center",
                      fontFamily: "SF_Pro_Display_Bold",
                      fontSize: 20,
                      color: Colors.textDark,
                    }}
                  >
                    Invite Phone Contacts
                  </Text>
                </View>
              ) : null
            }
            refreshing={loading}
            itemLayoutAnimation={transition}
            keyExtractor={(_: Contacts.Contact, index: number) => {
              return String(index);
            }}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={ItemSeparator}
            renderItem={renderPhoneItem}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ItemSeparator() {
  return <View style={[defaultStyles.separator, { marginLeft: 90 }]} />;
}

const AnimatedItem = ({
  item,
  index,
  markAsRead,
  onPlayLandingSound,
}: {
  item: CometChat.Conversation;
  index: number;
  markAsRead: (message: CometChat.BaseMessage) => Promise<void>;
  onPlayLandingSound?: () => void;
}) => {
  const conversationWith = item.getConversationWith();
  const icon = conversationWith instanceof CometChat.Group ? conversationWith.getIcon() : undefined;
  const name = conversationWith.getName();
  const groupUID =
    conversationWith instanceof CometChat.Group ? conversationWith.getGuid() : undefined;

  const unreadCount = item.getUnreadMessageCount();
  if (unreadCount === 0) return null;

  const translateY = useSharedValue(-55);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  React.useEffect(() => {
    translateY.value = withDelay(
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

    onPlayLandingSound && onPlayLandingSound();
  }, []);

  return (
    <Animated.View style={[animatedStyle, { maxWidth: 80, alignItems: "center", marginRight: 8 }]}>
      <Pressable
        onPress={() => {
          const lastMessage = item.getLastMessage();
          markAsRead(lastMessage);
          router.push(`/(tabs)/(chats)/new-chat/${groupUID}`);
        }}
      >
        <View
          style={{
            height: 60,
            width: 60,
          }}
        >
          <Avatar source={icon} isCar borderRadius={8} />
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
};

const styles = StyleSheet.create({
  leftContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarContainer: { width: 50, height: 50, overflow: "hidden" },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    marginHorizontal: 5,
    padding: 5,
    justifyContent: "space-between",
  },
  name: {
    color: Colors.textDark,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
  orgName: {
    color: Colors.textDark,
    fontSize: 14,
    fontFamily: "SF_Pro_Display_Light",
    marginTop: 2,
  },
});
