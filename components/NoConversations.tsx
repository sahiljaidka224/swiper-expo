import { View, StyleSheet } from "react-native";
import Text from "./Text";
import Colors from "@/constants/Colors";
import Button from "./Button";
import { router } from "expo-router";
import PulseButton from "./PulseButton";

export default function NoConversations() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        <Text style={styles.highlightHeader}>Connect</Text> with {"\n"} other car{" "}
        <Text style={styles.highlightHeader}>dealers!</Text>
      </Text>
      <Text style={styles.subHeader}>
        Swiper has a fast growing network of {"\n"}{" "}
        <Text style={styles.subHeaderHighlight}>Australian car dealers</Text> for you to {"\n"} find
        and connect with.
      </Text>
      <PulseButton
        title="Find other dealers NOW!"
        onPress={() => router.push({ pathname: "/(chats)/users-list" })}
      />
      <Text style={styles.buttonSeperator}>or</Text>
      <View style={styles.buttonContainer}>
        <Button
          type="border"
          title="Invite Phone Contacts"
          onPress={() => router.push({ pathname: "/(chats)/invite-friends" })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  header: {
    fontSize: 28,
    fontFamily: "SF_Pro_Display_Bold",
    color: Colors.textDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  highlightHeader: {
    color: Colors.primary,
  },
  subHeader: {
    paddingVertical: 20,
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    color: Colors.textDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subHeaderHighlight: {
    fontFamily: "SF_Pro_Display_Bold",
  },
  buttonContainer: {
    width: "80%",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  buttonSeperator: {
    paddingVertical: 15,
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    color: Colors.textLight,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
