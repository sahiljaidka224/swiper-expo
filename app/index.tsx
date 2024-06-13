import { Text, View, StyleSheet, Image, TouchableOpacity } from "react-native";
import welcomePage from "@/assets/images/welcome.png";
import Colors from "@/constants/Colors";
import { Link } from "expo-router";
const welcome_image = Image.resolveAssetSource(welcomePage).uri;

export default function Index() {
  const openLink = () => {};

  return (
    <View style={styles.container}>
      <Image source={{ uri: welcome_image }} style={styles.welcome} />
      <Text style={styles.headline}>Welcome to Swiper</Text>
      <Text style={styles.description}>
        Read our{" "}
        <Text style={styles.link} onPress={openLink}>
          Privacy Policy
        </Text>
        . {'Tap "Agree & Continue" to accept the '}
        <Text style={styles.link} onPress={openLink}>
          Terms of Service
        </Text>
        .
      </Text>
      <Link href={"/otp"} replace asChild>
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
    fontWeight: "bold",
    marginVertical: 20,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 80,
    color: Colors.gray,
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
    fontWeight: "bold",
  },
});
