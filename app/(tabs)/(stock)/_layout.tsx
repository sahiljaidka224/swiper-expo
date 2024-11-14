import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { router, Stack } from "expo-router";
import { Platform, Pressable } from "react-native";
import Text from "@/components/Text";

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
            headerTransparent: Platform.OS === "ios",
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
          name="users-list/index"
          options={{
            title: "Recipients",
            headerBackTitle: "",
            presentation: "fullScreenModal",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            headerLeft: () => (
              <Pressable onPress={() => router.back()}>
                <Text style={{ fontFamily: "SF_Pro_Display_Medium", fontSize: 16 }}>Cancel</Text>
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerBackTitle: "",
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen
          name="test-drive"
          options={{
            title: "Test Drive",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
