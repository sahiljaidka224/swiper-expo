import { View, ScrollView, TouchableOpacity, ListRenderItem } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import { useGetConversations } from "@/hooks/cometchat/conversations";
import ChatRowLoader from "@/components/SkeletonLoaders/ChatRowLoader";
import ErrorView from "@/components/Error";
import { router, Stack, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import Colors from "@/constants/Colors";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import { SegmentedControl } from "@/components/SegmentedControl";
import ChatRow from "@/components/ChatRow";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import Animated, { CurvedTransition } from "react-native-reanimated";

const transition = CurvedTransition.delay(100);
export default function Chats() {
  const [conversations, setConversations] = useState<CometChat.Conversation[]>([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const { conversationList, error, loading, fetchConversations } = useGetConversations();

  useFocusEffect(
    useCallback(() => {
      fetchConversations();

      return () => {
        console.log("This route is now unfocused.");
      };
    }, [])
  );

  useEffect(() => {
    if (conversationList && conversationList.length && !loading) {
      setConversations(conversationList);
    }
  }, [conversationList, loading]);

  useEffect(() => {
    if (selectedOption === "All") {
      setConversations(conversationList);
      return;
    }

    setConversations(conversationList.filter((c) => c.getConversationType() === "group"));
  }, [selectedOption]);

  const onProfilePress = () => {
    router.push("/(chats)/settings");
  };

  const onFeedPress = () => {
    router.push("/(chats)/feed");
  };

  const renderItem: ListRenderItem<unknown> = useCallback(
    ({ item, index }) => {
      return <ChatRow conversation={item as CometChat.Conversation} index={index} />;
    },
    [conversations]
  );

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: Colors.background }}
    >
      <Stack.Screen
        options={{
          headerTitle: () => (
            <SegmentedControl
              options={["All", "Groups"]}
              selectedOption={selectedOption}
              onOptionPress={setSelectedOption}
            />
          ),
          headerLeft: () => (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={onProfilePress}>
                <FontAwesome5 name="user-circle" size={24} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onFeedPress}>
                <MaterialCommunityIcons name="web" size={24} color={Colors.primary} />
              </TouchableOpacity>
            </View>
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
      <Animated.View layout={transition}>
        <Animated.FlatList
          contentInsetAdjustmentBehavior="automatic"
          skipEnteringExitingAnimations
          scrollEnabled={false}
          data={conversations}
          refreshing={loading}
          itemLayoutAnimation={transition}
          keyExtractor={(item: unknown) => {
            const conversation = item as CometChat.Conversation;
            return conversation.getConversationId();
          }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={ItemSeparator}
          renderItem={renderItem}
        />
      </Animated.View>
    </ScrollView>
  );
}

function ItemSeparator() {
  return <View style={[defaultStyles.separator, { marginLeft: 90 }]} />;
}
