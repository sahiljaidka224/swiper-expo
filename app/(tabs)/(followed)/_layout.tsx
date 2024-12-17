import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function WatchlistLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Watchlist",
            headerTintColor: Colors.primary,
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
            headerTintColor: Colors.primary,
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="user/[user]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerBackTitle: "",
            headerTintColor: Colors.primary,
            headerBackTitleVisible: false,
            animation: "fade",
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
