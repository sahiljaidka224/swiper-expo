import Colors from "@/constants/Colors";
import { StyleSheet } from "react-native";
import Text from "./Text";

interface ErrorProps {
  error?: string;
}

export default function ErrorView({ error }: ErrorProps) {
  return (
    <Text style={styles.error}>{error ? error : "Something went wrong, Please try again!"}</Text>
  );
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
