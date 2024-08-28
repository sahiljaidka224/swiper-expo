import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");

function Avatar({
  userId,
  source,
  borderRadius = 99999,
}: {
  userId?: string;
  source?: string;
  borderRadius?: number;
}) {
  return (
    <View style={styles.avatarContainer}>
      <Image
        placeholder={userPlaceholderImage}
        style={[styles.avatarImage, { borderRadius }]}
        allowDownscaling
        alt="User Avatar"
        contentFit="cover"
        priority={userId ? "high" : "low"}
        source={{
          uri: userId ? `${process.env.EXPO_PUBLIC_AVATAR_STORAGE_URL}${userId}.png` : source,
        }}
      />
    </View>
  );
}

export default React.memo(Avatar);

const styles = StyleSheet.create({
  avatarImage: {
    aspectRatio: 1,
    // borderRadius: 999999,
  },
  avatarContainer: {
    flex: 1,
  },
});
