import { View, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import ChatRow from "@/components/ChatRow";
import { useGetConversations } from "@/hooks/cometchat/conversations";
import ChatRowLoader from "@/components/SkeletonLoaders/ChatRowLoader";
import ErrorView from "@/components/Error";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback } from "react";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import Colors from "@/constants/Colors";
import { useGetUserOrgDetails } from "@/api/hooks/user";

export default function Chats() {
  const { conversationList, error, loading, fetchConversations } = useGetConversations();
  useGetUserOrgDetails();

  useFocusEffect(
    useCallback(() => {
      fetchConversations();

      return () => {
        console.log("This route is now unfocused.");
      };
    }, [])
  );

  const onProfilePress = () => {
    router.push("/chats/settings");
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: "#fff" }}
    >
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={onProfilePress}>
              <FontAwesome5 name="user-circle" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      {loading && (
        <>
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
          <ChatRowLoader />
        </>
      )}
      {error && <ErrorView />}
      <FlatList
        scrollEnabled={false}
        data={conversationList}
        keyExtractor={(item) => item.getConversationId()}
        ItemSeparatorComponent={() => (
          <View style={[defaultStyles.separator, { marginLeft: 90 }]} />
        )}
        renderItem={({ item }) => <ChatRow conversation={item} />}
      />
    </ScrollView>
  );
}
