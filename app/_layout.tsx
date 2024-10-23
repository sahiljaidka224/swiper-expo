import * as Notifications from "expo-notifications";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useSegments, router, useNavigation, Slot } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { SWRConfig } from "swr";
import { fetcher } from "@/utils/fetcher";
import { cometChatInit } from "@/hooks/cometchat";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MessageContextProvider } from "@/context/MessageContext";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { showToast } from "@/components/Toast";

export { ErrorBoundary } from "expo-router";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

SplashScreen.preventAutoHideAsync();

if (__DEV__) {
  require("../ReactotronConfig");
}

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: "index",
};
function BaseLayout() {
  const segments = useSegments();
  const { isAuthLoading, user, token } = useAuth();
  const navigation = useNavigation();

  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    SF_Pro_Display_Bold: require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    SF_Pro_Display_Light: require("../assets/fonts/SF-Pro-Display-Light.otf"),
    SF_Pro_Display_Medium: require("../assets/fonts/SF-Pro-Display-Medium.otf"),
    SF_Pro_Display_Regular: require("../assets/fonts/SF-Pro-Display-Regular.otf"),
    ...FontAwesome.font,
  });
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    async function handleNotification() {
      try {
        await Notifications.setBadgeCountAsync(0);
        await Notifications.dismissAllNotificationsAsync();
      } catch (error) {
        console.error(error);
      }
    }

    handleNotification();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    try {
      const inTabsGroup = segments[0] === "(tabs)";

      if (token && !inTabsGroup && user) {
        (async () => {
          if (user?.profileComplete) {
            const isSuccess = await cometChatInit(user?.id, user?.name);
            if (isSuccess) {
              router.replace("/(tabs)/(chats)");
            }
          } else {
            router.replace("/profile");
          }
        })();
      } else if (!token && inTabsGroup) {
        try {
          while (router.canGoBack()) {
            router.back();
          }
          navigation.reset({
            index: 0,
            routes: [{ key: "index", name: "index" as string, path: "/index" }],
          });
        } catch (error) {
          console.error(error);
          showToast("Error", "Please close the app and open again!", "error");
        }
      }
    } catch (error) {
    } finally {
      SplashScreen.hideAsync();
    }
  }, [token, isAuthLoading]);

  if (!loaded || isAuthLoading) {
    return <Slot />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="otp"
        options={{ headerTitle: "Enter Your Phone Number", headerBackVisible: false }}
      />
      <Stack.Screen name="profile" options={{ title: "Your Details", headerBackVisible: false }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayoutNav() {
  const { top } = useSafeAreaInsets();

  return (
    <AuthProvider>
      <MessageContextProvider>
        <SWRConfig value={{ fetcher, dedupingInterval: 2000 }}>
          <BaseLayout />
          <Toast topOffset={top} />
        </SWRConfig>
      </MessageContextProvider>
    </AuthProvider>
  );
}
