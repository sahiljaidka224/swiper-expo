import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { View } from "react-native";
import { SWRConfig } from "swr";
import { fetcher } from "@/utils/fetcher";
import { cometChatInit } from "@/hooks/cometchat";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { MessageContextProvider } from "@/context/MessageContext";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

if (__DEV__) {
  require("../ReactotronConfig");
}

function BaseLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthLoading, user, token } = useAuth();

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
    if (isAuthLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";

    if (token && !inTabsGroup && user) {
      (async () => {
        if (user?.profileComplete) {
          const isSuccess = await cometChatInit(user?.id);
          if (isSuccess) {
            router.replace("/(tabs)/(chats)");
          }
        } else {
          router.replace("/profile");
        }
      })();
    } else if (!token && inTabsGroup) {
      router.replace("/");
    }
  }, [token, isAuthLoading]);

  if (!loaded || isAuthLoading) {
    return <View />;
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="otp"
        options={{ headerTitle: "Enter Your Phone Number", headerBackVisible: false }}
      />
      <Stack.Screen
        name="verify/[phone]"
        options={{ headerTitle: "Verify Your Phone Number", headerBackTitle: "Edit Number" }}
      />
      <Stack.Screen name="profile" options={{ title: "Your Details", headerBackVisible: false }} />

      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayoutNav() {
  return (
    <AuthProvider>
      <MessageContextProvider>
        <SWRConfig value={{ fetcher, dedupingInterval: 2000 }}>
          <BaseLayout />
        </SWRConfig>
      </MessageContextProvider>
    </AuthProvider>
  );
}
