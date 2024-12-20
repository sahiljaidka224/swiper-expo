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
            headerTintColor: Colors.primary,
            animation: "fade",
            headerShown: false,
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="user/[user]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
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
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
