import Colors from "@/constants/Colors";
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Avatar from "./Avatar";

function ContactCard({
  userId,
  name,
  organisationName,
}: {
  userId: string;
  name: string;
  organisationName: string;
}) {
  return (
    <Pressable style={styles.contactCardContainer}>
      <Avatar userId={userId} />
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.organisationName}>{organisationName}</Text>
      </View>
    </Pressable>
  );
}

export default React.memo(ContactCard);

const styles = StyleSheet.create({
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
    textAlign: "justify",
    textTransform: "capitalize",
  },
});
