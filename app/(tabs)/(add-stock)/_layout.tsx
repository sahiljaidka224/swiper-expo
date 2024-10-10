import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function AddStockLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Add Stock",
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerBlurEffect: "regular",
            headerTransparent: Platform.OS === "ios",
          }}
        />
        <Stack.Screen
          name="users-list/index"
          options={{
            title: "Recipients",
            headerBackTitle: "",
            // presentation: "modal",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
