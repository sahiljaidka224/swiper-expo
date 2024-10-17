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
            headerLargeTitle: false,
            headerBlurEffect: "regular",
            headerTitleAlign: "center",
            headerTransparent: Platform.OS === "ios",
          }}
        />

        <Stack.Screen
          name="settings"
          options={{
            title: "",
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="feed"
          options={{
            title: "Media",
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="feed-readmore"
          options={{
            title: "",
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="car/[id]"
          options={{
            title: "",
          }}
        />
        <Stack.Screen
          name="new-chat/[id]"
          options={{
            title: "",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="users-list/index"
          options={{
            title: "Swiper Users",
            headerBackTitle: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            title: "",
            headerBackTitleVisible: false,
            headerStyle: { backgroundColor: Colors.background },
          }}
        />
      </Stack>
    </ActionSheetProvider>
  );
}
