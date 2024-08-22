import React from "react";
import * as Linking from "expo-linking";

import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import Colors from "@/constants/Colors";
import { router } from "expo-router";

interface ButtonsContainerProps {
  onDelete?: (carId: string) => void;
  onMessage?: () => void;
  phoneNumber: string | null;
  carId: string;
  buttonsType?: "primary" | "secondary";
  userId?: string | null;
}

function WatchlistButtonsContainer({
  onDelete,
  onMessage,
  phoneNumber,
  carId,
  userId,
  buttonsType,
}: ButtonsContainerProps) {
  const onDeletePress = () => {
    if (onDelete && carId && carId.trim() !== "") {
      onDelete(carId);
    }
  };

  const onCallPress = async () => {
    if (!phoneNumber) return;
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.warn(`Unable to initiate call ${error}`);
    }
  };

  const onMessagePress = () => {
    if (!userId && onMessage) {
      onMessage();
    }
    if (userId && userId.trimEnd() !== "") {
      router.push(`/(tabs)/(chats)/${userId}`);
    }
  };

  return (
    <View style={styles.itemButtonsContainer}>
      {onDelete && (
        <TouchableOpacity onPress={onDeletePress} style={styles.iconContainer}>
          <Ionicons name="trash-outline" color={Colors.iconGray} size={24} />
        </TouchableOpacity>
      )}
      {/* // TODO: after comet chat is integrated completely */}
      <Button title="Call" onPress={onCallPress} type={buttonsType ? buttonsType : "secondary"} />
      <Button title="Message" onPress={onMessagePress} type={buttonsType} />
    </View>
  );
}

export default React.memo(WatchlistButtonsContainer);

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
