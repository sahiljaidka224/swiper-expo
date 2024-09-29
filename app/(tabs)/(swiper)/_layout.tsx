import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";

export default function SwiperLayout() {
  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerShown: true,
            headerLargeTitle: false,
            headerShadowVisible: false,
            headerTransparent: true,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => {
                  router.push({ pathname: "/(swiper)/search" });
                }}
                style={{ padding: 10 }}
              >
                <Ionicons name="search" size={24} color={Colors.background} />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="search-results"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="manual-search"
          options={{
            title: "",
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
