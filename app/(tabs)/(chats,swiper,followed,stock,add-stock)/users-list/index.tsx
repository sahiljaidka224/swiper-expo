import { useGetCarDetails } from "@/api/hooks/car-detail";
import { useManualSearch } from "@/api/hooks/car-search";
import { useUserOrgName } from "@/api/hooks/user";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import ErrorView from "@/components/Error";
import { SegmentedControl } from "@/components/SegmentedControl";
import Text from "@/components/Text";
import { showToast } from "@/components/Toast";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { useSendMessage } from "@/hooks/cometchat/messages";
import { useGetCometChatUsers } from "@/hooks/cometchat/users";
import { debounce } from "@/utils";
import { formatTimestamp, isActiveToday } from "@/utils/cometchat";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { AntDesign, EvilIcons, FontAwesome5 } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { router, Stack, useLocalSearchParams, useSegments } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

const options = ["Users", "Dealerships"];

export default function UsersListPage() {
  const segments = useSegments();
  const { carId, allowMultiple, uri } = useLocalSearchParams<{
    carId?: string;
    allowMultiple?: string;
    uri: string;
  }>();

  const [mode, setMode] = useState<string>("Users");

  const multipleSelectionAllowed =
    segments.includes("(stock)") ||
    segments.includes("(add-stock)") ||
    (segments.includes("(chats)") && allowMultiple === "true");
  const forwardMediaMode = segments.includes("(chats)") && allowMultiple === "true";
  const sectionListRef = useRef<SectionList<any> | null>(null);
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
  const { token } = useAuth();
  const { triggerManualSearch, organisations, isMutating } = useManualSearch();
  const [orgsData, setOrgsData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

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
    if (!isMutating && organisations && organisations.length > 0) {
      setOrgsData(organisations);
    }
  }, [organisations]);

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

  const fetchSearchResults = async (searchTerm: string) => {
    if (!token) return;
    try {
      console.log("Fetching data...");
      triggerManualSearch({ token, searchTerm });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), []);

  const handleSearch = (text: string) => {
    if (text.length === 0) {
      setOrgsData([]);
    }
    setSearchText(text);
    if (!multipleSelectionAllowed) {
      debouncedSearch(text);
    }
  };

  const keyExtractor = (item: CometChat.User) => item.getUid();

  const onPressUser = (user: CometChat.User) => {
    const userUID = user.getUid();
    if (multipleSelectionAllowed) {
      setSelectedUsers((prev) => {
        const index = prev.findIndex((user) => user.getUid() === userUID);
        if (index === -1) {
          return [...prev, user];
        }
        return prev.filter((user) => user.getUid() !== userUID);
      });
    } else {
      router.push({
        pathname: `/(tabs)/user/[user]`,
        params: { id: userUID },
      });
    }
  };

  const renderItem = ({ item }: { item: CometChat.User }) => {
    const onPress = () => {
      onPressUser(item);
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
    let metadata: {
      carId: any;
      carName: string;
      price: any;
      odometer: any;
      icon: any;
      members: string[];
    } = {
      carId: car?.carId,
      carName: `${car?.year} ${car?.make} ${car?.model}`,
      price: car?.price,
      odometer: car?.odometer,
      icon,
      members: [],
    };

    let groupData = selectedUsers.map((user) => {
      const userUID = user.getUid();

      const GUID = String(`${userUID}_${car?.carId}_${currentUser?.id}`).slice(0, 100);

      const members = [owner, userUID];
      const tags = [userUID, currentUser?.id, car?.carId];
      metadata = { ...metadata, members };

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

  const alphabet = sections.map((section) => section.title);

  const scrollToSection = (letter: string) => {
    const sectionIndex = sections.findIndex((section) => section.title === letter);
    if (sectionIndex !== -1) {
      sectionListRef.current?.scrollToLocation({
        sectionIndex: sectionIndex,
        itemIndex: 0,
        animated: true,
        viewPosition: 0.2,
        viewOffset: styles.userContainer.height * sectionIndex,
      });
    }
  };

  const loadMore = () => {
    if (!isMutating && orgsData?.length > 0) {
      setPage(page + 1);
      // fetchMore();
    }
  };

  const renderItemOrgs = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <Animated.View
          style={[styles.itemWrapper, { paddingHorizontal: 10 }]}
          entering={FadeInUp.delay(index * 10)}
          exiting={FadeOutUp}
        >
          <Pressable
            style={styles.userContainer}
            onPress={() => {
              router.push({
                pathname: `/(tabs)/user/[user]`,
                params: { id: item.ownerUserId, orgId: item.organisationId },
              });
            }}
          >
            <View style={styles.leftContainer}>
              <View style={styles.avatarContainer}>
                <Avatar userId={""} isCar />
              </View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                {item.address && (
                  <View style={styles.addressContainer}>
                    <FontAwesome5 name="map-marker-alt" size={16} color={Colors.red} />
                    <Text style={styles.addressText}>{item?.address}</Text>
                  </View>
                )}
              </View>
            </View>
            <EvilIcons name="chevron-right" size={24} color={Colors.iconGray} />
          </Pressable>
        </Animated.View>
      );
    },
    [orgsData]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <Stack.Screen
        options={{ title: `Swiper Users${users && users.length > 0 ? `: ${users.length}` : ""}` }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder={`${mode === "Users" ? "Search all Swiper Users..." : "Search Dealerships..."}`}
        value={searchText}
        onChangeText={handleSearch}
        clearButtonMode="while-editing"
        maxFontSizeMultiplier={1.3}
      />
      {error && <ErrorView />}
      {!multipleSelectionAllowed ? (
        <View style={{ alignItems: "center" }}>
          <SegmentedControl
            options={options}
            selectedOption={mode}
            onOptionPress={setMode}
            width={300}
          />
        </View>
      ) : null}

      {mode === "Users" && (
        <SectionList
          getItemLayout={(data, index) => ({
            length: styles.userContainer.height,
            offset: styles.userContainer.height * index,
            index,
          })}
          onScrollToIndexFailed={() => {
            console.log("onScrollToIndexFailed");
          }}
          ref={sectionListRef}
          keyboardDismissMode="on-drag"
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
                <Text style={styles.forwardText}>
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
      )}
      {loading && !users.length && <ActivityIndicator size="large" color={Colors.primary} />}
      {isMutating && <ActivityIndicator size="large" color={Colors.primary} />}

      {mode === "Users" && (
        <View style={styles.alphabetContainer}>
          {alphabet.map((letter) => (
            <TouchableOpacity
              key={letter}
              onPress={() => scrollToSection(letter)}
              style={styles.alphabetButton}
            >
              <Text style={styles.alphabetText} maxFontSizeMultiplier={1}>
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {mode === "Dealerships" && !multipleSelectionAllowed ? (
        <FlashList
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshing={isMutating && !orgsData}
          keyExtractor={(item) => item.organisationId}
          scrollEnabled={true}
          data={orgsData}
          estimatedItemSize={80}
          ItemSeparatorComponent={() => (
            <View style={styles.itemSeperatorContainer}>
              <View style={styles.itemSeperator} />
            </View>
          )}
          ListFooterComponent={() =>
            isMutating && orgsData?.length > 0 ? (
              <ActivityIndicator size="large" color={Colors.primary} />
            ) : null
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={renderItemOrgs}
          ListEmptyComponent={null}
        />
      ) : null}
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
    const { orgName } = useUserOrgName(userUID);

    return (
      <Pressable style={styles.userContainer} onPress={onPress}>
        <View style={styles.leftContainer}>
          <View style={styles.avatarContainer}>
            <Avatar userId={userUID} />
          </View>
          <View style={{ gap: 1 }}>
            <Text style={styles.name}>{userName}</Text>
            {orgName ? <Text style={styles.orgName}>{orgName}</Text> : null}
            <Text style={styles.timestamp}>{`Last seen: ${formatTimestamp(lastSeen, true)}`}</Text>
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
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: "85%",
    paddingRight: 10,
  },
  avatarContainer: { width: 50, height: 50, borderRadius: 25 },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    marginHorizontal: 5,
    padding: 5,
    justifyContent: "space-between",
    marginBottom: 5,
    height: 66,
  },
  name: {
    color: Colors.textDark,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
  timestamp: {
    color: Colors.textDark,
    fontSize: 12,
    fontFamily: "SF_Pro_Display_Light",
    marginTop: 2,
  },
  orgName: {
    color: Colors.textDark,
    fontSize: 14,
    fontFamily: "SF_Pro_Display_Regular",
    textTransform: "capitalize",
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
    borderColor: Colors.primary,
    borderRadius: 9999,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 25,
  },
  forwardText: {
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 18,
    textAlign: "center",
    marginTop: 10,
  },

  alphabetContainer: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "transparent",
  },
  alphabetButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  alphabetText: {
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    color: Colors.primary,
  },

  itemWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingVertical: 15,
  },
  addressContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  addressText: {
    color: Colors.textLight,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Regular",
  },

  itemSeperatorContainer: {
    paddingHorizontal: 10,
  },
  itemSeperator: {
    borderBottomColor: Colors.borderGray,
    borderBottomWidth: 1,
    paddingHorizontal: "10%",
  },
});
