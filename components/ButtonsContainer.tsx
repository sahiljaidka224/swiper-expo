import React from "react";
import * as Linking from "expo-linking";

import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import Colors from "@/constants/Colors";

interface ButtonsContainerProps {
  onDelete?: (carId: string) => void;
  onMessage: () => void;
  phoneNumber: string | null;
  carId: string;
  buttonsType?: "primary" | "secondary";
}

function ButtonsContainer({
  onMessage,
  onDelete,
  phoneNumber,
  carId,
  buttonsType = "primary",
}: ButtonsContainerProps) {
  const onDeletePress = (carId: string) => {
    if (onDelete) {
      onDelete(carId);
    }
  };

  const onCallPress = async (phoneNumber: string | null) => {
    if (!phoneNumber) return;
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.warn(`Unable to initiate call ${error}`);
    }
  };

  return (
    <View style={styles.itemButtonsContainer}>
      {onDelete && (
        <TouchableOpacity onPress={() => onDeletePress(carId)} style={styles.iconContainer}>
          <Ionicons name="trash-outline" color={Colors.iconGray} size={24} />
        </TouchableOpacity>
      )}
      {/* // TODO: after comet chat is integrated completely */}
      <Button title="Message" onPress={onMessage} type={buttonsType} />
      <Button title="Call" onPress={() => onCallPress(phoneNumber)} type={buttonsType} />
    </View>
  );
}

export default React.memo(ButtonsContainer);

const styles = StyleSheet.create({
  itemButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 5,
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    borderRadius: 25,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.lightGrayBackground,
    paddingHorizontal: 16,
  },
});
