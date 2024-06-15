import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Image, TouchableOpacity, View, Text } from "react-native";

export default function ChatsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Chats",
          headerLargeTitle: true,
          headerBlurEffect: "regular",
          headerTransparent: true,
          // headerStyle: { backgroundColor: "#fff" },
          headerSearchBarOptions: {
            placeholder: "Search",
          },
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons
                name="ellipsis-horizontal-circle-outline"
                color={Colors.primary}
                size={30}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="camera-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "",
          headerBackTitleVisible: false,
          headerStyle: { backgroundColor: Colors.background },
          headerRight: () => (
            <View style={{ flexDirection: "row", gap: 30 }}>
              <TouchableOpacity>
                <Ionicons name="videocam-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="call-outline" color={Colors.primary} size={30} />
              </TouchableOpacity>
            </View>
          ),
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingBottom: 4,
                alignItems: "center",
                width: 220,
              }}
            >
              <Image
                source={{
                  uri: "https://pbs.twimg.com/profile_images/1564203599747600385/f6Lvcpcu_400x400.jpg",
                }}
                style={{ width: 40, height: 40, borderRadius: 50 }}
              />
              <Text style={{ fontSize: 16, fontWeight: "500" }}>Simon Grimm</Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
