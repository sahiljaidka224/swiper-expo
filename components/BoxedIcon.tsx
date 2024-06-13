import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

type BoxedIconProps = {
  name: typeof Ionicons.defaultProps;
  backgroundColor: string;
};

export default function BoxedIcon({ name, backgroundColor }: BoxedIconProps) {
  return (
    <View style={{ backgroundColor, padding: 4, borderRadius: 6 }}>
      <Ionicons name={name} size={22} color="white" />
    </View>
  );
}
