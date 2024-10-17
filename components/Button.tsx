import Colors from "@/constants/Colors";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Text from "./Text";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "disabled" | "border";
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
            {
              color:
                type === "primary"
                  ? Colors.textPrimary
                  : type === "border"
                  ? Colors.primary
                  : Colors.textDark,
            },
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
  border: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
});
