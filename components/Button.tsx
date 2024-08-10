import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  type?: "primary" | "secondary";
};

export default function Button({ title, onPress, type = "primary" }: ButtonProps) {
  return (
    <Pressable
      style={[
        styles.container,
        { backgroundColor: type === "primary" ? Colors.primary : Colors.primaryLight },
      ]}
      onPress={onPress}
    >
      <Text
        style={[styles.text, { color: type === "primary" ? Colors.textPrimary : Colors.textDark }]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    flex: 1,
  },
  text: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Regular",
    textAlign: "center",
  },
});
