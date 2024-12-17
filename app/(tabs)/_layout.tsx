import { MessageIcon, PushCarIcon, StockIcon, SwiperIcon, WatchListIcon } from "@/components/Icons";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import { useMessageContext } from "@/context/MessageContext";
import { useGetUnreadMessages } from "@/hooks/cometchat/messages";
import { Image } from "expo-image";
import { Tabs, useSegments } from "expo-router";
import { useEffect } from "react";
import { AppState, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import analytics from "@react-native-firebase/analytics";
import { useAuth } from "@/context/AuthContext";

export default function TabsRootLayout() {
  const { user } = useAuth();
  const segments = useSegments();
  const { getUnreadMessages } = useGetUnreadMessages();
  const { unreadCount } = useMessageContext();

  useEffect(() => {
    Image.clearMemoryCache();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await analytics().setUserId(user?.id ?? "");
        await analytics().setUserProperties(
          { userId: user?.id ?? "", userName: user?.name ?? "" },
          { global: true }
        );

        await analytics().logScreenView({
          screen_name: segments.length > 1 ? segments[1] : segments[0],
        });
      } catch (error) {
        console.log("Error setting user properties", error);
      }
    })();
  }, [segments]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        getUnreadMessages();
      }
    });

    return () => {
      subscription.remove();
    };
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
          tabBarHideOnKeyboard: false,
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
            },
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}
