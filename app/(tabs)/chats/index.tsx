import { View, ScrollView, FlatList } from "react-native";
import { defaultStyles } from "@/constants/Styles";
import ChatRow from "@/components/ChatRow";
import { useGetConversations } from "@/hooks/cometchat/conversations";
import ChatRowLoader from "@/components/SkeletonLoaders/ChatRowLoader";
import ErrorView from "@/components/Error";

export default function Chats() {
  const { conversationList, error, loading } = useGetConversations();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 20, backgroundColor: "#fff" }}
    >
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
