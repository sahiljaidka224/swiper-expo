import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, View, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import { router } from "expo-router";
import { useSegments } from "expo-router";
import Text from "./Text";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";

// TODO: watchlist buttons not working
function ContactCardNew({
  userId,
  name,
  organisationName,
}: {
  userId: string;
  name: string;
  organisationName: string;
}) {
  const segments = useSegments();
  const onPress = () => {
    router.navigate({
      pathname: `/${segments[1]}/user/[userId]`,
      params: { id: userId },
    });
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
      <WatchlistButtonsContainer userId={userId} phoneNumber="" carId="" buttonsType="primary" />
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
