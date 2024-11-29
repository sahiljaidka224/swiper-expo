import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { EvilIcons } from "@expo/vector-icons";
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
                activeOpacity={0.2}
                onPress={() => {
                  router.push({ pathname: "/(swiper)/search" });
                }}
                style={{
                  height: 40,
                  width: 40,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: Colors.background,
                  borderRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: {
                    width: 0,
                    height: 2,
                  },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,

                  elevation: 5,
                }}
              >
                <EvilIcons name="search" size={30} color={Colors.gray} />
              </TouchableOpacity>
            ),
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

        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerBackTitle: "",
            headerBackTitleVisible: false,
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
