import { useGetUserDetails, useGetUserOrgDetails } from "@/api/hooks/user";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";

export default function ChatsLayout() {
  const { user: currentUser, logout, updateUser } = useAuth();
  useGetUserOrgDetails();
  const { user, isLoading, error } = useGetUserDetails(currentUser?.id ?? "");

  useEffect(() => {
    if (!isLoading && !error && user) {
      if (!user?.isAccountApproved) {
        Alert.alert(
          "Account not approved",
          "Your account is not approved yet. Please try again later."
        );
        logout();
        return;
      } else {
        updateUser({
          ...currentUser,
          id: user?.userId,
          name: `${user?.firstName} ${user?.lastName}`,
          phoneNumber: user?.phoneNumber,
          profileComplete: true,
        });
      }
    }
  }, [isLoading, error, user]);

  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Chats",
            headerTintColor: Colors.primary,
            headerLargeTitle: false,
            headerBlurEffect: "regular",
            headerTitleAlign: "center",
            headerTransparent: Platform.OS === "ios",
            animation: "fade",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="feed"
          options={{
            title: "Media",
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="feed-readmore"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerStyle: { backgroundColor: Colors.background },
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            animation: "fade",
            headerShown: false,
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            animation: "fade",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="users-list/index"
          options={{
            headerTintColor: Colors.primary,
            title: "Swiper Users",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            animation: "fade",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            title: "",
            headerTintColor: Colors.primary,
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
            animation: "fade",
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
        <Stack.Screen
          name="user/[user]"
          options={{
            headerTintColor: Colors.primary,
            title: "",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerTitleStyle: {
              fontSize: 20,
              fontFamily: "SF_Pro_Display_Regular",
            },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
