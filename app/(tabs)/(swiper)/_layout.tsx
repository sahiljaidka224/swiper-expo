import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";

export default function SwiperLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Swiper",
            headerShown: false,
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerBlurEffect: "regular",
            headerTransparent: true,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
