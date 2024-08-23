import Avatar from "@/components/Avatar";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import Text from "@/components/Text";

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
          <TextInput value={user?.name} style={styles.textInput} maxFontSizeMultiplier={1.3} />
          <TextInput
            value={user?.phoneNumber}
            style={styles.textInput}
            maxFontSizeMultiplier={1.3}
          />
          <TextInput value={user?.org?.name} style={styles.textInput} maxFontSizeMultiplier={1.3} />
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
