import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");

function Avatar({ userId }: { userId: string }) {
  return (
    <View style={styles.avatarContainer}>
      <Image
        placeholder={userPlaceholderImage}
        style={styles.avatarImage}
        allowDownscaling
        alt="User Avatar"
        contentFit="cover"
        source={{ uri: `${process.env.EXPO_PUBLIC_AVATAR_STORAGE_URL}${userId}.png` }}
      />
    </View>
  );
}

export default React.memo(Avatar);

const styles = StyleSheet.create({
  avatarImage: {
    // minHeight: 50,
    // minWidth: 50,
    aspectRatio: 1,
    borderRadius: 999999,
  },
  avatarContainer: {
    flex: 1,
  },
});
