import { View, Text, ScrollView, FlatList } from "react-native";
import chats from "@/assets/data/chats.json";
import { defaultStyles } from "@/constants/Styles";
import ChatRow from "@/components/ChatRow";

export default function Chats() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: "#fff" }}
    >
      <FlatList
        scrollEnabled={false}
        data={chats}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => (
          <View style={[defaultStyles.separator, { marginLeft: 90 }]} />
        )}
        renderItem={({ item }) => <ChatRow {...item} />}
      />
    </ScrollView>
  );
}
