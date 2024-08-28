import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { AntDesign } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Pressable } from "react-native";

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
            headerTransparent: true,
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
          name="new-chat/[id]"
          options={{
            title: "",
            presentation: "modal",
            headerRight: () => (
              <Pressable onPress={() => router.back()}>
                <AntDesign name="closecircleo" size={24} color="black" />
              </Pressable>
            ),
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
