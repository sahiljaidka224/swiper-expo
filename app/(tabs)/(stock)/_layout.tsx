import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";

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
      </Stack>
    </ActionSheetProvider>
  );
}
