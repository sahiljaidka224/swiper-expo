import React from "react";
import { StyleSheet, View, Image } from "react-native";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");

function Avatar({ userId }: { userId: string }) {
  return (
    <View style={styles.avatarContainer}>
      <Image
        defaultSource={userPlaceholderImage}
        style={styles.avatarImage}
        source={{ uri: `https://swiperstorageaccount.blob.core.windows.net/avatars/${userId}.png` }}
      />
    </View>
  );
}

export default React.memo(Avatar);

const styles = StyleSheet.create({
  avatarImage: {
    minHeight: 50,
    minWidth: 50,
    aspectRatio: 1,
    borderRadius: 999999,
  },
  avatarContainer: {
    flex: 1,
  },
});
