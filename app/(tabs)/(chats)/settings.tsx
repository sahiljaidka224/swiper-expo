import Avatar from "@/components/Avatar";
import BoxedIcon from "@/components/BoxedIcon";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { useAuth } from "@/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";

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
  const { logout, user } = useAuth();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
      }}
    >
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={{ alignItems: "center", marginTop: 10, gap: 10 }}>
          {user && (
            <View style={{ height: 150, width: 150 }}>
              <Avatar userId={user?.id} />
            </View>
          )}
        </View>
        <View style={{ padding: 20, gap: 20 }}>
          <TextInput value={user?.name} style={styles.textInput} />
          <TextInput value={user?.phoneNumber} style={styles.textInput} />
          <TextInput value={user?.org?.name} style={styles.textInput} />
        </View>
        {/* {[devices, items, support].map((x, index) => (
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
        ))} */}

        <TouchableOpacity onPress={() => logout()}>
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

const styles = StyleSheet.create({
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
  },
});
