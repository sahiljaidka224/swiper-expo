import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Colors from "@/constants/Colors";
import { useGetCometChatUser } from "@/hooks/cometchat/users";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");
const carPlaceholderImage = require("@/assets/images/no-image.png");

function Avatar({
  userId,
  source,
  borderRadius = 99999,
  isCar = false,
  showOnlineIndicator,
}: {
  userId?: string;
  source?: string;
  borderRadius?: number;
  isCar?: boolean;
  showOnlineIndicator?: boolean;
}) {
  const { user: cometChatUser } = useGetCometChatUser(userId as string);
  const isOnline = cometChatUser?.getStatus() === "online";

  return (
    <View style={styles.avatarContainer}>
      <Image
        placeholder={isCar ? carPlaceholderImage : userPlaceholderImage}
        style={[styles.avatarImage, { borderRadius }]}
        allowDownscaling
        alt="User Avatar"
        contentFit="cover"
        priority={userId ? "high" : "low"}
        placeholderContentFit="contain"
        source={{
          uri: userId ? `${process.env.EXPO_PUBLIC_AVATAR_STORAGE_URL}${userId}.png` : source,
        }}
      />
      {!isCar && isOnline && <View style={styles.onlineIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  avatarImage: {
    aspectRatio: 1,
  },
  avatarContainer: {
    flex: 1,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
    zIndex: 1,
  },
});

export default React.memo(Avatar);
