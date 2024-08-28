import { useGetUserOrgDetails } from "@/api/hooks/user";
import Colors from "@/constants/Colors";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { Stack } from "expo-router";

export default function ChatsLayout() {
  useGetUserOrgDetails();

  return (
    <ActionSheetProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Chats",
            headerLargeTitle: false,
            headerBlurEffect: "regular",
            headerTransparent: true,
            headerSearchBarOptions: {
              placeholder: "Search",
            },
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
            title: "Car News",
            headerStyle: { backgroundColor: Colors.background },
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
      </Stack>
    </ActionSheetProvider>
  );
}
