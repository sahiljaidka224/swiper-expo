import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import Colors from "@/constants/Colors";
import { useGetCometChatUser } from "@/hooks/cometchat/users";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");
const carPlaceholderImage = require("@/assets/images/car-placeholder-new.png");

function Avatar({
  userId,
  source,
  borderRadius = 99999,
  isCar = false,
  showOutline = false,
}: {
  userId?: string;
  source?: string;
  borderRadius?: number;
  isCar?: boolean;
  showOnlineIndicator?: boolean;
  showOutline?: boolean;
}) {
  const { user: cometChatUser } = useGetCometChatUser(userId as string);
  const isOnline = useMemo(() => cometChatUser?.getStatus() === "online", [cometChatUser]);

  return (
    <View
      style={[
        styles.avatarContainer,
        showOutline ? { borderWidth: 3, borderRadius: 99999, borderColor: Colors.background } : {},
      ]}
    >
      <Image
        placeholder={isCar ? carPlaceholderImage : userPlaceholderImage}
        style={[styles.avatarImage, { borderRadius }]}
        allowDownscaling
        alt="User Avatar"
        contentFit="cover"
        priority={userId ? "high" : "low"}
        placeholderContentFit="cover"
        cachePolicy={userId ? "none" : "disk"}
        source={{
          uri: userId ? `${process.env.EXPO_PUBLIC_AVATAR_STORAGE_URL}${userId}.png` : source,
        }}
      />

      {!isCar && isOnline && (
        <View style={[styles.indicatorWrapper, showOutline ? { right: 4, padding: 2 } : {}]}>
          <View
            style={[
              styles.onlineIndicator,
              showOutline ? { width: 16, height: 16, borderRadius: 8 } : {},
            ]}
          />
        </View>
      )}
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
  indicatorWrapper: {
    padding: 3,
    backgroundColor: Colors.background,
    position: "absolute",
    bottom: 2,
    right: -5,
    borderRadius: 999999,
    zIndex: 1,
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.green,
  },
});

export default React.memo(Avatar);
