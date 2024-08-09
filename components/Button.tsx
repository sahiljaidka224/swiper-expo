import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
};

export default function Button({ title, onPress }: ButtonProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
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
