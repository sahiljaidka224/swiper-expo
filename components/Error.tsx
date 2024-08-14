import Colors from "@/constants/Colors";
import { StyleSheet, Text } from "react-native";

export default function ErrorView() {
  return <Text style={styles.error}>Something went wrong, Please try again later!</Text>;
}

const styles = StyleSheet.create({
  error: {
    color: Colors.red,
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 10,
  },
});
