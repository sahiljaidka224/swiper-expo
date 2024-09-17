import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { router, Stack } from "expo-router";
import { Pressable, TouchableOpacity } from "react-native";
import Text from "@/components/Text";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function MyStockLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "My Stock",
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerBlurEffect: "regular",
            headerTransparent: true,
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.push("/(stock)/feed")}>
                <FontAwesome name="newspaper-o" size={24} color={Colors.primary} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="user/[user]"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="feed"
          options={{
            title: "Car News",
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="feed-readmore"
          options={{
            title: "",
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="users-list/index"
          options={{
            title: "Recipients",
            headerBackTitle: "",
            presentation: "modal",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Text style={{ fontFamily: "SF_Pro_Display_Medium", fontSize: 16 }}>Cancel</Text>
              </Pressable>
            ),
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
