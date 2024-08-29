import Avatar from "@/components/Avatar";
import ErrorView from "@/components/Error";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { router } from "expo-router";
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
  const { users, error, loading } = useGetCometChatUsers();
  const [searchText, setSearchText] = useState("");
  const keyExtractor = (item: CometChat.User) => item.getUid();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

  const renderItem = ({ item }: { item: CometChat.User }) => <User user={item} />;

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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <TextInput
        style={styles.searchInput}
        placeholder="Search users..."
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

function User({ user }: { user: CometChat.User }) {
  const userUID = user.getUid();
  const userName = user.getName();

  const onPress = () => {
    router.back();
    router.push(`/(tabs)/(chats)/${userUID}`);
  };

  return (
    <Pressable style={styles.userContainer} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar userId={userUID} />
      </View>
      <View>
        <Text style={styles.name}>{userName}</Text>
        <Text style={styles.orgName}>Better Car Company</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 60,
  },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    marginHorizontal: 5,
    padding: 5,
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
});
