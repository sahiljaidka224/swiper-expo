import Colors from "@/constants/Colors";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import Text from "./Text";

export type ButtonProps = {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary" | "disabled" | "border" | "circle";
  disabled?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
};

export default function Button({
  title,
  onPress,
  type = "primary",
  isLoading,
  children,
}: ButtonProps) {
  return (
    <Pressable
      disabled={type === "disabled"}
      style={[
        styles.container,
        styles[type],
        children && type !== "circle" ? { minHeight: 32, maxHeight: 32 } : {},
      ]}
      onPress={onPress}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : !children ? (
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
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    elevation: 5,
    shadowColor: "black",
    shadowOffset: { width: 0.3 * 4, height: 0.5 * 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0.7 * 4,
    alignItems: "center",
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
  circle: {
    borderRadius: 25,
    minWidth: 50,
    minHeight: 50,
    backgroundColor: Colors.primary,
    flex: 0,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
});
