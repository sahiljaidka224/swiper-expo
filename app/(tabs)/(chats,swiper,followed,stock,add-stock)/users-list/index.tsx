import { useGetCarDetails } from "@/api/hooks/car-detail";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import ErrorView from "@/components/Error";
import Text from "@/components/Text";
import { showToast } from "@/components/Toast";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { useSendMessage } from "@/hooks/cometchat/messages";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { formatTimestamp } from "@/utils/cometchat";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { AntDesign } from "@expo/vector-icons";
import { router, useLocalSearchParams, useSegments } from "expo-router";
import React, { useEffect } from "react";
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
import { ScrollView } from "react-native-gesture-handler";

export default function UsersListPage() {
  const segments = useSegments();
  const { carId, allowMultiple, uri } = useLocalSearchParams<{
    carId?: string;
    allowMultiple?: string;
    uri: string;
  }>();

  const multipleSelectionAllowed =
    segments.includes("(stock)") ||
    segments.includes("(add-stock)") ||
    (segments.includes("(chats)") && allowMultiple === "true");
  const forwardMediaMode = segments.includes("(chats)") && allowMultiple === "true";

  const { user: currentUser } = useAuth();

  const { users, error, loading } = useGetCometChatUsers();
  const {
    loading: isSendingMessage,
    sendMediaMessageToMultiple,
    error: sendMessageError,
  } = useSendMessage();

  const {
    createMultipleGroups,
    loading: isGroupCreateLoading,
    error: groupCreateError,
  } = useCreateGroup();

  const {
    car,
    isLoading: carDetailsLoading,
    error: carDetailsError,
  } = useGetCarDetails(carId as string);

  const [selectedUsers, setSelectedUsers] = useState<CometChat.User[]>([]);
  const [searchText, setSearchText] = useState("");
  const [textInputValue, setTextInputValue] = useState("");

  const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

  useEffect(() => {
    if (!isGroupCreateLoading && selectedUsers.length && multipleSelectionAllowed) {
      setTextInputValue("");
      setSelectedUsers([]);
      router.back();
    }
  }, [isGroupCreateLoading, groupCreateError]);

  useEffect(() => {
    if (!isSendingMessage && !sendMessageError && forwardMediaMode && selectedUsers.length) {
      showToast("Success", "Message forwarded successfully!", "success");
      router.back();
    }
  }, [sendMessageError, isSendingMessage]);

  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase().trimEnd();
    const [firstName, lastName] = user.getName().toLowerCase().replace(/\s+/g, " ").split(" ");

    return (
      firstName.startsWith(searchLower) ||
      lastName.startsWith(searchLower) ||
      `${firstName} ${lastName}`.startsWith(searchLower)
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

  const keyExtractor = (item: CometChat.User) => item.getUid();

  const renderItem = ({ item }: { item: CometChat.User }) => {
    const onPress = () => {
      const userUID = item.getUid();
      if (multipleSelectionAllowed) {
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
    return (
      <User
        user={item}
        onPress={onPress}
        selected={isSelected}
        multipleSelectionAllowed={multipleSelectionAllowed}
      />
    );
  };

  const onForwardMedia = () => {
    if (!forwardMediaMode || !uri) return;

    sendMediaMessageToMultiple(
      selectedUsers.map((user) => user.getUid()),
      [{ name: "Image", uri, type: "image/jpeg", size: undefined }]
    );
  };

  const onPressSendNow = () => {
    if (forwardMediaMode) {
      onForwardMedia();
      return;
    }

    if (!car && !carDetailsLoading) {
      showToast("Error", "Car details not found", "error");
      router.back();
      return;
    }

    if (!currentUser) return;
    const chatName = String(`${car?.year} ${car?.model}`).toUpperCase();
    const icon = car?.images[0]?.url ?? undefined;
    const owner = currentUser?.id;
    const metadata = {
      carId: car?.carId,
      carName: `${car?.year} ${car?.make} ${car?.model}`,
      price: car?.price,
      odometer: car?.odometer,
      icon,
    };

    let groupData = selectedUsers.map((user) => {
      const userUID = user.getUid();

      const GUID = String(`${userUID}_${car?.carId}_${currentUser?.id}`).slice(0, 100);

      const members = [owner, userUID];
      const tags = [userUID, currentUser?.id, car?.carId];

      const group = new CometChat.Group(
        GUID,
        chatName,
        CometChat.GROUP_TYPE.PRIVATE,
        undefined,
        icon,
        undefined
      );
      group.setMetadata(metadata);
      group.setTags(tags);
      group.setOwner(owner);
      group.setMembersCount(2);

      return {
        members,
        group,
        text: textInputValue.trimEnd().length > 0 ? textInputValue : "Hey, check this out!",
      };
    });

    createMultipleGroups(groupData);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <TextInput
        style={styles.searchInput}
        placeholder="Search Swiper users..."
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing"
        maxFontSizeMultiplier={1.3}
      />
      {loading && !users.length && <ActivityIndicator size="large" color={Colors.primary} />}
      {error && <ErrorView />}
      <SectionList
        keyboardShouldPersistTaps="handled"
        sections={sections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
        ListHeaderComponent={
          multipleSelectionAllowed && selectedUsers && selectedUsers.length > 0 ? (
            <>
              <Text
                style={{
                  fontFamily: "SF_Pro_Display_Regular",
                  fontSize: 18,
                  textAlign: "center",
                  marginTop: 10,
                }}
              >
                {forwardMediaMode
                  ? "Forwarding to these Swiper Users"
                  : "Pushing to these Swiper Users"}
              </Text>
              <ScrollView
                style={{ backgroundColor: Colors.background, padding: 10, minHeight: 100 }}
                horizontal
              >
                {selectedUsers.map((user) => {
                  const userUID = user.getUid();
                  const userName = user.getName();

                  return (
                    <View key={userUID} style={{ margin: 5, alignItems: "center" }}>
                      <View style={styles.avatarContainer}>
                        <Avatar userId={userUID} />
                      </View>
                      <Text style={styles.name}>{userName.split(" ")[0]}</Text>
                    </View>
                  );
                })}
              </ScrollView>
              {!forwardMediaMode ? (
                <TextInput
                  placeholder="Write a message"
                  style={styles.sendMessageInput}
                  multiline
                  value={textInputValue}
                  onChangeText={setTextInputValue}
                  maxFontSizeMultiplier={1.3}
                />
              ) : null}
              <View style={{ paddingHorizontal: 20, paddingVertical: 10, height: 70 }}>
                <Button
                  title="Send Now"
                  onPress={onPressSendNow}
                  type="primary"
                  isLoading={isGroupCreateLoading || isSendingMessage}
                />
              </View>
            </>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

export const User = React.memo(
  ({
    user,
    onPress,
    selected = false,
    multipleSelectionAllowed = false,
  }: {
    user: CometChat.User;
    onPress: () => void;
    selected?: boolean;
    multipleSelectionAllowed?: boolean;
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
            <Text style={styles.orgName}>{`Last seen: ${formatTimestamp(lastSeen, true)}`}</Text>
          </View>
        </View>
        {multipleSelectionAllowed ? (
          <View style={styles.selectedContainer}>
            {selected ? <AntDesign name="check" size={20} color={Colors.primary} /> : null}
          </View>
        ) : null}
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
  sendMessageInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 10,
    borderRadius: 12,
    borderColor: Colors.borderGray,
    borderWidth: 2,
    fontSize: 20,
    maxHeight: 120,
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
