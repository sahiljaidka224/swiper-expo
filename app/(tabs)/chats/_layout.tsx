import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { TouchableOpacity, View } from "react-native";

export default function ChatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerLargeTitle: true,
          headerBlurEffect: "regular",
          headerTransparent: true,
          // headerStyle: { backgroundColor: "#fff" },
          headerSearchBarOptions: {
            placeholder: "Search",
          },
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                color={Colors.primary}
                size={30}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="camera-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
