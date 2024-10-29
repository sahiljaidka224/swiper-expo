import * as Linking from "expo-linking";

import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import Colors from "@/constants/Colors";
import { Link } from "expo-router";
import Text from "@/components/Text";

const welcomePage = require("@/assets/images/welcome.png");
const welcomeImage = Image.resolveAssetSource(welcomePage).uri;

export default function Index() {
  const openPrivacyPolicy = async () => {
    if (await Linking.canOpenURL("https://website.swiper.datalinks.nl/policy.html")) {
      Linking.openURL("https://website.swiper.datalinks.nl/policy.html");
    }
  };

  const openTermsOfService = async () => {
    if (await Linking.canOpenURL("https://website.swiper.datalinks.nl/terms.html")) {
      Linking.openURL("https://website.swiper.datalinks.nl/terms.html");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: welcomeImage }} style={styles.welcome} />
      <Text style={styles.headline}>Welcome to Swiper</Text>
      <Text style={styles.description}>
        Read our{" "}
        <Text style={styles.link} onPress={openPrivacyPolicy}>
          Privacy Policy
        </Text>
        . {'Tap "Agree & Continue" to accept the '}
        <Text style={styles.link} onPress={openTermsOfService}>
          Terms of Service
        </Text>
        .
      </Text>
      <Link href={"/(public)/otp"} replace asChild>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Agree & Continue</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  welcome: {
    width: "100%",
    height: 300,
    marginBottom: 80,
  },
  headline: {
    fontSize: 24,
    marginVertical: 20,
    fontFamily: "SF_Pro_Display_Bold",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 80,
    color: Colors.gray,
    fontFamily: "SF_Pro_Display_Medium",
  },
  link: {
    color: Colors.primary,
  },
  button: {
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 22,
    color: Colors.primary,
    fontFamily: "SF_Pro_Display_Bold",
  },
});
