import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";

export default function AddStockLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Add Stock",
            headerLargeTitle: true,
            headerShadowVisible: false,
            headerBlurEffect: "regular",
            headerTransparent: true,
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
