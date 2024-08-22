import { MessageIcon, PushCarIcon, StockIcon, SwiperIcon, WatchListIcon } from "@/components/Icons";
import Colors from "@/constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsRootLayout() {
  const segments = useSegments();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            paddingTop: 20,
            backgroundColor: Colors.background,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveBackgroundColor: Colors.background,
          tabBarActiveBackgroundColor: Colors.background,
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerShadowVisible: false,
        }}
      >
        <Tabs.Screen
          name="swiper"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => <SwiperIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(followed)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => <WatchListIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <MessageIcon color={color} />,
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display: segments[2] === "[id]" ? "none" : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="(stock)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => <StockIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="calls"
          options={{
            href: null,

            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="phone-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(add-stock)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => <PushCarIcon color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
