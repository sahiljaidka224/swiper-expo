import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { View } from "react-native";
import * as SecureStore from "expo-secure-store";
import { SWRConfig } from "swr";
import { fetcher } from "@/utils/fetcher";
import { cometChatInit } from "@/hooks/cometchat";
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync();

if (__DEV__) {
  require("../ReactotronConfig");
}

function BaseLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { isLoaded, isSignedIn } = useAuth();
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
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === "(tabs)";

    console.log({ isSignedIn });

    if (isSignedIn && !inTabsGroup) {
      (async () => {
        const isSuccess = await cometChatInit();
        console.log({ isSuccess });
        if (isSuccess) {
          router.replace("/(tabs)/chats");
        }
      })();
      // let appSetting = new CometChat.AppSettingsBuilder()
      //   .subscribePresenceForAllUsers()
      //   .setRegion(process.env.EXPO_PUBLIC_COMET_CHAT_APP_REGION ?? "")
      //   .autoEstablishSocketConnection(true)
      //   .build();

      // CometChat.init(process.env.EXPO_PUBLIC_COMET_CHAT_APP_ID, appSetting).then(
      //   () => {
      //     console.log("Initialization completed successfully");
      //     CometChat.getLoggedinUser().then(
      //       (user: CometChat.User | null) => {
      //         if (!user) {
      //           CometChat.login(
      //             "4d306670-e733-11ee-95bb-d90b8dbd243d",
      //             process.env.EXPO_PUBLIC_COMET_CHAT_AUTH_KEY
      //           ).then(
      //             (user: CometChat.User) => {
      //               console.log("Login Successful:", { user });
      //             },
      //             (error: CometChat.CometChatException) => {
      //               console.log("Login failed with exception:", { error });
      //             }
      //           );
      //         }
      //       },
      //       (error: CometChat.CometChatException) => {
      //         console.log("Some Error Occured", { error });
      //       }
      //     );
      //   },
      //   (error) => {
      //     console.log("Initialization failed with error:", error);
      //   }
      // );
    } else if (!isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn]);

  if (!loaded || !isLoaded) {
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayoutNav() {
  return (
    <SWRConfig value={{ fetcher, dedupingInterval: 2000 }}>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY ?? ""} tokenCache={tokenCache}>
        <BaseLayout />
      </ClerkProvider>
    </SWRConfig>
  );
}
