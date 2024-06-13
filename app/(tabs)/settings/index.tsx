import BoxedIcon from "@/components/BoxedIcon";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, ScrollView, FlatList, TouchableOpacity } from "react-native";

const devices = [
  {
    name: "Broadcast Lists",
    icon: "megaphone",
    backgroundColor: Colors.green,
  },
  {
    name: "Starred Messages",
    icon: "star",
    backgroundColor: Colors.yellow,
  },
  {
    name: "Linked Devices",
    icon: "laptop-outline",
    backgroundColor: Colors.green,
  },
];

const items = [
  {
    name: "Account",
    icon: "key",
    backgroundColor: Colors.primary,
  },
  {
    name: "Privacy",
    icon: "lock-closed",
    backgroundColor: "#33A5D1",
  },
  {
    name: "Chats",
    icon: "logo-whatsapp",
    backgroundColor: Colors.green,
  },
  {
    name: "Notifications",
    icon: "notifications",
    backgroundColor: Colors.red,
  },
  {
    name: "Storage and Data",
    icon: "repeat",
    backgroundColor: Colors.green,
  },
];

const support = [
  {
    name: "Help",
    icon: "information",
    backgroundColor: Colors.primary,
  },
  {
    name: "Tell a Friend",
    icon: "heart",
    backgroundColor: Colors.red,
  },
];

export default function Settings() {
  const { signOut } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {[devices, items, support].map((x, index) => (
          <View key={index} style={defaultStyles.block}>
            <FlatList
              scrollEnabled={false}
              data={x}
              ItemSeparatorComponent={() => <View style={defaultStyles.separator} />}
              renderItem={({ item }) => (
                <View style={defaultStyles.item}>
                  <BoxedIcon name={item.icon} backgroundColor={item.backgroundColor} />
                  <Text style={{ fontSize: 18, flex: 1 }}>{item.name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors.gray} />
                </View>
              )}
            />
          </View>
        ))}

        <TouchableOpacity onPress={() => signOut()}>
          <Text
            style={{
              color: Colors.primary,
              fontSize: 18,
              textAlign: "center",
              paddingVertical: 18,
            }}
          >
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
