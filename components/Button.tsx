import Colors from "@/constants/Colors";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Text from "./Text";

type ButtonProps = {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "disabled";
  disabled?: boolean;
  isLoading?: boolean;
};

export default function Button({ title, onPress, type = "primary", isLoading }: ButtonProps) {
  return (
    <Pressable
      disabled={type === "disabled"}
      style={[styles.container, styles[type]]}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: type === "primary" ? Colors.textPrimary : Colors.textDark },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    padding: 10,
    flex: 1,
    justifyContent: "center",
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  secondary: {
    backgroundColor: Colors.primaryLight,
  },
  disabled: {
    backgroundColor: Colors.borderGray,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
});
