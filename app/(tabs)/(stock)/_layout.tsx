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
            headerTintColor: Colors.primary,
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerBlurEffect: "regular",
            headerTransparent: Platform.OS === "ios",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
            animation: "fade",
            headerShown: false,
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
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
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
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="test-drive"
          options={{
            title: "Test Drive",
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
