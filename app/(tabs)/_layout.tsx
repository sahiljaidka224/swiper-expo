import Colors from "@/constants/Colors";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Tabs, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsRootLayout() {
  const segments = useSegments();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
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
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="car-rental" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="(watchlist)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="update" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <Ionicons name="chatbubbles" size={size} color={color} />
            ),
            tabBarStyle: {
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
            tabBarIcon: ({ size, color }) => (
              <MaterialIcons name="update" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="calls"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => (
              <MaterialCommunityIcons name="phone-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ size, color }) => <Ionicons name="cog" size={size} color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
