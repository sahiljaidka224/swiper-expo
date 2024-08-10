import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";
import { router } from "expo-router";

function ContactCard({
  userId,
  name,
  organisationName,
}: {
  userId: string;
  name: string;
  organisationName: string;
}) {
  const onPress = () => {
    router.push({ pathname: `/(stock)/userId`, params: { userId } });
  };
  return (
    <Pressable style={styles.contactCardContainer} onPress={onPress}>
      <View style={styles.avatarContainer}>
        <Avatar userId={userId} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.organisationName}>{organisationName}</Text>
      </View>
    </Pressable>
  );
}

export default React.memo(ContactCard);

const styles = StyleSheet.create({
  avatarContainer: { width: 50, height: 50, borderRadius: 25 },
  contactCardContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 8,
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
