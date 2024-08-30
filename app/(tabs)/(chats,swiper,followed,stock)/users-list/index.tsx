import Avatar from "@/components/Avatar";
import ErrorView from "@/components/Error";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { formatTimestamp } from "@/utils/cometchat";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { AntDesign } from "@expo/vector-icons";
import { router, Stack, useSegments } from "expo-router";
import React from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function UsersListPage() {
  const segments = useSegments();
  const selectMultiple = segments.includes("(stock)") || segments.includes("(add-stock)");
  const { users, error, loading } = useGetCometChatUsers();
  const [selectedUsers, setSelectedUsers] = useState<CometChat.User[]>([]);
  const [searchText, setSearchText] = useState("");
  const keyExtractor = (item: CometChat.User) => item.getUid();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

  console.log({ selectMultiple });

  const filteredUsers = users.filter((user) => {
    const [firstName, lastName] = user.getName().toLowerCase().split(" ");
    return (
      firstName.startsWith(searchText.toLowerCase()) ||
      lastName.startsWith(searchText.toLowerCase())
    );
  });

  const groupedUsers = filteredUsers.reduce((acc, user) => {
    const firstLetter = user.getName().charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(user);
    return acc;
  }, {} as Record<string, CometChat.User[]>);

  const sections = Object.keys(groupedUsers)
    .sort()
    .map((letter) => ({
      title: letter,
      data: groupedUsers[letter],
    }));

  const renderItem = ({ item }: { item: CometChat.User }) => {
    const onPress = () => {
      const userUID = item.getUid();
      if (selectMultiple) {
        setSelectedUsers((prev) => {
          const index = prev.findIndex((user) => user.getUid() === userUID);
          if (index === -1) {
            return [...prev, item];
          }
          return prev.filter((user) => user.getUid() !== userUID);
        });
      } else {
        router.back();
        router.push(`/(tabs)/(chats)/${userUID}`);
      }
    };

    const isSelected = selectedUsers.find((user) => user.getUid() === item.getUid()) !== undefined;
    return <User user={item} onPress={onPress} selected={isSelected} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <Stack.Screen
        options={{
          headerRight: () => {
            if (!selectMultiple)
              return (
                <Pressable onPress={() => router.back()}>
                  <AntDesign name="closecircleo" size={24} color="black" />
                </Pressable>
              );

            return (
              <Pressable
                disabled={selectedUsers.length === 0}
                onPress={() => {
                  router.back();
                  // router.push(
                  //   `/(tabs)/(stock)/${selectedUsers.map((user) => user.getUid()).join(",")}`
                  // );
                }}
              >
                <Text
                  style={{
                    fontFamily: "SF_Pro_Display_Medium",
                    fontSize: 16,
                    color: selectedUsers.length > 0 ? Colors.primary : Colors.textLight,
                  }}
                >
                  Push
                </Text>
              </Pressable>
            );
          },
        }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search Swiper users..."
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing"
      />
      {loading && !users.length && <ActivityIndicator size="large" color={Colors.primary} />}
      {error && <ErrorView />}
      <SectionList
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const User = React.memo(
  ({
    user,
    onPress,
    selected = false,
  }: {
    user: CometChat.User;
    onPress: () => void;
    selected?: boolean;
  }) => {
    const userUID = user.getUid();
    const userName = user.getName();
    const lastSeen = user.getLastActiveAt();

    return (
      <Pressable style={styles.userContainer} onPress={onPress}>
        <View style={styles.leftContainer}>
          <View style={styles.avatarContainer}>
            <Avatar userId={userUID} />
          </View>
          <View>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.orgName}>{`Last seen: ${formatTimestamp(lastSeen)}`}</Text>
          </View>
        </View>
        <View style={styles.selectedContainer}>
          {selected ? <AntDesign name="check" size={20} color={Colors.primary} /> : null}
        </View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 60,
  },
  leftContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
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
  searchInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 10,
    borderRadius: 20,
    borderColor: Colors.borderGray,
    borderWidth: 2,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Regular",
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 5,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  sectionHeaderText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Bold",
  },
  selectedContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 9999,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
