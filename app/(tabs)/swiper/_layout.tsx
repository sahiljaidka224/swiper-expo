import Colors from "@/constants/Colors";
import { Stack } from "expo-router";

export default function SwiperLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Swiper",
          headerLargeTitle: false,
          headerShadowVisible: false,
          headerBlurEffect: "regular",
          headerTransparent: true,
          headerStyle: { backgroundColor: Colors.background },
        }}
      />
    </Stack>
  );
}
