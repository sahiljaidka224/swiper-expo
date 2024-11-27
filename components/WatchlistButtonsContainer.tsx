import React from "react";
import * as Linking from "expo-linking";

import Ionicons from "@expo/vector-icons/build/Ionicons";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Button from "./Button";
import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useGetOrgDetails } from "@/api/hooks/organisation";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { SheetManager } from "react-native-actions-sheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
  icons?: boolean;
  circularIcons?: boolean;
  size?: "min" | "max";
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
  icons = false,
  circularIcons = false,
  size = "min",
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

  if (circularIcons) {
    return (
      <View
        style={[styles.itemButtonsContainer, { justifyContent: "space-between", width: "100%" }]}
      >
        {onDelete && (
          <TouchableOpacity
            onPress={() => {
              SheetManager.show("watchlist-sheet", { payload: { deleteVisible: true } }).then(
                (result) => {
                  if (!result) return;
                  if (result === "delete") {
                    onDeletePress();
                    return;
                  }
                }
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal-circle" size={34} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <Button
          onPress={onCallPress}
          title=""
          type="circle"
          isLoading={isSecondaryButtonLoading}
          disabled={isSecondaryButtonLoading}
          size={size}
        >
          <Ionicons name="call" color={Colors.background} size={size === "min" ? 24 : 30} />
        </Button>
        <Button
          onPress={onMessagePress}
          title=""
          type="circle"
          isLoading={isPrimaryButtonLoading || isLoading}
          disabled={isPrimaryButtonLoading || isLoading}
          size={size}
        >
          <MaterialCommunityIcons
            name="chat"
            color={Colors.background}
            size={size === "min" ? 24 : 34}
          />
        </Button>
      </View>
    );
  }

  if (icons) {
    return (
      <View style={[styles.itemButtonsContainer, { gap: 5 }]}>
        {onDelete && (
          <TouchableOpacity
            onPress={() => {
              SheetManager.show("watchlist-sheet", { payload: { deleteVisible: true } }).then(
                (result) => {
                  if (!result) return;
                  if (result === "delete") {
                    onDeletePress();
                    return;
                  }
                }
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal-circle" size={30} color={Colors.primary} />
          </TouchableOpacity>
        )}
        <Button
          onPress={onCallPress}
          title=""
          type="border"
          isLoading={isSecondaryButtonLoading}
          disabled={isSecondaryButtonLoading}
        >
          <Ionicons name="call" color={Colors.primary} size={22} />
        </Button>

        <Button
          onPress={onMessagePress}
          title=""
          type="border"
          isLoading={isPrimaryButtonLoading || isLoading}
          disabled={isPrimaryButtonLoading || isLoading}
        >
          <Ionicons name="chatbubble" color={Colors.primary} size={22} />
        </Button>
      </View>
    );
  }

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
