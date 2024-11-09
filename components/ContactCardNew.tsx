import Colors from "@/constants/Colors";
import React, { useEffect } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import { router } from "expo-router";
import { useSegments } from "expo-router";
import Text from "./Text";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import { useAuth } from "@/context/AuthContext";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useCreateGroup } from "@/hooks/cometchat/groups";

// TODO: watchlist buttons not working
function ContactCardNew({
  userId,
  name,
  organisationName,
  phoneNumber,
  car,
}: {
  userId: string;
  name: string;
  organisationName: string;
  phoneNumber: string;
  car?: any;
}) {
  const { createGroup, error: errorGroup, group, loading: isGroupLoading } = useCreateGroup();

  const { user } = useAuth();
  const segments = useSegments();
  const onPress = () => {
    router.navigate({
      pathname: `/${segments[1]}/user/[userId]`,
      params: { id: userId },
    });
  };

  useEffect(() => {
    if (group && !isGroupLoading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(swiper)/new-chat/[id]", params: { id: guid } });
    }
  }, [isGroupLoading, group]);

  const onMessagePress = (selectedUserId?: string) => {
    if (!car) return;
    const userId = selectedUserId ?? car?.organisation?.ownerUserId;
    if (!user?.id || !userId) return;

    const GUID = String(`${user?.id}_${car?.carId}_${userId}`).slice(0, 100);
    const chatName = String(`${car?.year} ${car?.model}`).toUpperCase();
    const icon = car?.images[0]?.url ?? undefined;
    const owner = user?.id;
    const members = [owner, userId];
    const metadata = {
      carId: car?.carId,
      make: car?.make,
      model: car?.model,
      year: car?.year,
      price: car?.price,
      odometer: car?.odometer,
      icon,
    };
    const tags = [owner, userId, car?.carId];

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

    createGroup(group, members);
  };
  return (
    <Pressable style={styles.contactCardContainer} onPress={onPress}>
      <View style={{ flexDirection: "row", gap: 15, alignItems: "center" }}>
        <View style={styles.avatarContainer}>
          <Avatar userId={userId} showOnlineIndicator />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{name}</Text>
          <Text style={styles.organisationName}>{organisationName}</Text>
        </View>
      </View>
      <WatchlistButtonsContainer
        onMessage={onMessagePress}
        phoneNumber={phoneNumber}
        carId=""
        buttonsType="primary"
        isPrimaryButtonLoading={isGroupLoading}
      />
    </Pressable>
  );
}

export default React.memo(ContactCardNew);

const styles = StyleSheet.create({
  avatarContainer: { width: 60, height: 60, borderRadius: 30 },
  contactCardContainer: {
    flexDirection: "column",
    alignItems: "center",
    // marginHorizontal: 10,
    padding: 15,
    borderRadius: 24,
    backgroundColor: Colors.background,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactName: {
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 20,
    color: Colors.textDark,
    lineHeight: 22,
    textTransform: "capitalize",
  },
  organisationName: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 22,
    flexWrap: "wrap",
    textAlign: "left",
    textTransform: "capitalize",
  },
});
