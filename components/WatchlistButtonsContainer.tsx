import React from "react";
import * as Linking from "expo-linking";

import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useGetOrgDetails } from "@/api/hooks/organisation";
import { useActionSheet } from "@expo/react-native-action-sheet";

interface ButtonsContainerProps {
  onDelete?: (carId: string) => void;
  onMessage?: (userId?: string) => void;
  phoneNumber: string | null;
  carId: string;
  buttonsType?: "primary" | "secondary";
  userId?: string | null;
  isPrimaryButtonLoading?: boolean;
  isSecondaryButtonLoading?: boolean;
  orgId?: string;
}

function WatchlistButtonsContainer({
  onDelete,
  onMessage,
  phoneNumber,
  carId,
  userId,
  buttonsType,
  isPrimaryButtonLoading = false,
  isSecondaryButtonLoading = false,
  orgId,
}: ButtonsContainerProps) {
  const { showActionSheetWithOptions } = useActionSheet();
  const { org, isLoading, error } = useGetOrgDetails(orgId ?? null);
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
      if (org && org.contacts.length > 1) {
        const contacts = org.contacts.map((c: { displayName: string }) => c.displayName);
        showActionSheetWithOptions(
          { options: [...contacts, "Cancel"], cancelButtonIndex: contacts.length },
          (index) => {
            if (typeof index === "number" && index < contacts.length) {
              onMessage(org.contacts[index]?.userId ?? "");
            }
          }
        );
      } else {
        onMessage();
      }
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
      <Button
        title="Call"
        onPress={onCallPress}
        type={buttonsType ? buttonsType : "secondary"}
        isLoading={isSecondaryButtonLoading}
        disabled={isSecondaryButtonLoading}
      />
      <Button
        title="Message"
        onPress={onMessagePress}
        type={buttonsType}
        isLoading={isPrimaryButtonLoading || isLoading}
        disabled={isPrimaryButtonLoading || isLoading}
      />
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
