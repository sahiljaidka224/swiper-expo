import { MessageIcon, PushCarIcon, StockIcon, SwiperIcon, WatchListIcon } from "@/components/Icons";
import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { Tabs, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function TabsRootLayout() {
  const segments = useSegments();

  useEffect(() => {
    Image.clearMemoryCache();
  }, []);

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
          name="(swiper)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <SwiperIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(followed)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <WatchListIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(chats)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <MessageIcon color={color} />,
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display: segments[2] === "[id]" || segments[3] === "[id]" ? "none" : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="(stock)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <StockIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="(add-stock)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <PushCarIcon color={color} />,
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
