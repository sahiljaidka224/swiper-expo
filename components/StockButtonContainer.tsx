import analytics from "@react-native-firebase/analytics";
import React from "react";
import * as SMS from "expo-sms";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

interface ButtonsContainerProps {
  onDelete?: (carId: string) => void;
  onPushToSwiperContacts: () => void;
  carId: string;
  showSMSOption?: boolean;
}

function StockButtonContainer({
  onPushToSwiperContacts,
  onDelete,
  carId,
  showSMSOption = false,
}: ButtonsContainerProps) {
  const { user } = useAuth();
  const onDeletePress = () => {
    if (onDelete && carId && carId.trim() !== "") {
      onDelete(carId);
    }
  };

  const onSMSToPhoneContacts = async () => {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      // do your SMS stuff here
    } else {
      // misfortune... there's no SMS available on this device
      console.log("not available");
    }
  };

  const onPushToSwiperContactsPress = async () => {
    await analytics().logEvent("push_to_swiper_contacts", { userId: user?.id });
    onPushToSwiperContacts();
  };

  return (
    <View style={styles.itemButtonsContainer}>
      {onDelete && (
        <TouchableOpacity onPress={onDeletePress} style={styles.iconContainer}>
          <Ionicons name="trash-outline" color={Colors.iconGray} size={24} />
        </TouchableOpacity>
      )}
      <Button title="Push to Swiper Users" onPress={onPushToSwiperContactsPress} />
      {/* {showSMSOption && (
        <Button title="SMS Phone Contacts" onPress={onSMSToPhoneContacts} type="secondary" />
      )} */}
    </View>
  );
}

export default React.memo(StockButtonContainer);

const styles = StyleSheet.create({
  itemButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 5,
    gap: 10,
  },
  iconContainer: {
    borderRadius: 25,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.lightGrayBackground,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
