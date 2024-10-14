import { MessageIcon, PushCarIcon, StockIcon, SwiperIcon, WatchListIcon } from "@/components/Icons";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { useMessageContext } from "@/context/MessageContext";
import { useGetUnreadMessages } from "@/hooks/cometchat/messages";
import { Image } from "expo-image";
import { Tabs, useSegments } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import analytics from "@react-native-firebase/analytics";

export default function TabsRootLayout() {
  const segments = useSegments();
  useGetUnreadMessages();
  const { unreadCount } = useMessageContext();

  useEffect(() => {
    Image.clearMemoryCache();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await analytics().logScreenView({
          screen_name: segments.length > 1 ? segments[1] : segments[0],
        });
      } catch (error) {}
    })();
  }, [segments]);

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
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display:
                (segments.includes("new-chat") && segments[3] === "[id]") || segments[2] === "[id]"
                  ? "none"
                  : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="(followed)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <WatchListIcon color={color} />,
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display:
                (segments.includes("new-chat") && segments[3] === "[id]") || segments[2] === "[id]"
                  ? "none"
                  : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="(chats)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <View>
                {unreadCount > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      right: -5,
                      top: -5,
                      width: 20,
                      height: 20,
                      backgroundColor: Colors.muted,
                      zIndex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: "SF_Pro_Display_Bold",
                        fontSize: 16,
                        textAlign: "center",
                      }}
                      maxFontSizeMultiplier={1}
                    >
                      {unreadCount}
                    </Text>
                  </View>
                ) : null}
                <MessageIcon color={color} />
              </View>
            ),
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
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display:
                (segments.includes("new-chat") && segments[3] === "[id]") || segments[2] === "[id]"
                  ? "none"
                  : "flex",
            },
          }}
        />
        <Tabs.Screen
          name="(add-stock)"
          options={{
            title: "",
            headerShown: false,
            tabBarIcon: ({ color }) => <PushCarIcon color={color} />,
            tabBarStyle: {
              paddingTop: 20,
              backgroundColor: Colors.background,
              display:
                (segments.includes("new-chat") && segments[3] === "[id]") || segments[2] === "[id]"
                  ? "none"
                  : "flex",
            },
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
