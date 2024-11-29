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
          name="new-chat/[id]"
          options={{
            title: "",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            // presentation: "modal",
            // headerRight: () => (
            //   <Pressable onPress={() => router.back()}>
            //     <AntDesign name="closecircleo" size={24} color="black" />
            //   </Pressable>
            // ),
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
