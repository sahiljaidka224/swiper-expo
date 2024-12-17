import { useSearchCarsCount } from "@/api/hooks/car-search";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { EvilIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

export default function SwiperLayout() {
  const { token } = useAuth();
  const { cars: carsCount, getCarsCount } = useSearchCarsCount();

  useEffect(() => {
    if (!token) return;
    getCarsCount({ token });
  }, []);

  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerTintColor: Colors.primary,
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
                  minWidth: 40,
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
                  flexDirection: "row",
                  paddingHorizontal: 8,
                  gap: 2,
                }}
              >
                <EvilIcons name="search" size={28} color={Colors.gray} />
                {carsCount && carsCount.length && carsCount[0].num ? (
                  <Text style={{ color: Colors.primary, fontFamily: "SF_Pro_Display_Bold" }}>
                    {carsCount[0].num} Cars
                  </Text>
                ) : null}
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            animation: "fade",
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            title: "",
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="search-results"
          options={{
            title: "",
            headerTintColor: Colors.primary,
          }}
        />
        <Stack.Screen
          name="manual-search"
          options={{
            title: "",
            headerTintColor: Colors.primary,
          }}
        />

        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerBackTitle: "",
            headerBackTitleVisible: false,
            animation: "fade",
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
