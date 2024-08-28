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
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

export default function UsersListPage() {
  const { users, error, loading } = useGetCometChatUsers();
  const [searchText, setSearchText] = useState("");
  const keyExtractor = (item: CometChat.User) => item.getUid();
  const keyboardVerticalOffset = Platform.OS === "ios" ? 90 : 0;

  const renderItem = ({ item }: { item: CometChat.User }) => <User user={item} />;

  const filteredUsers = users.filter((user) => {
    const [firstName, lastName] = user.getName().toLowerCase().split(" ");
    return (
      firstName.startsWith(searchText.toLowerCase()) ||
      lastName.startsWith(searchText.toLowerCase())
    );
  });

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
      <FlatList data={filteredUsers} keyExtractor={keyExtractor} renderItem={renderItem} />
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
    paddingBottom: 40,
  },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    margin: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
  name: {
    color: Colors.textDark,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
  orgName: {
    color: Colors.textDark,
    fontSize: 16,
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
});
