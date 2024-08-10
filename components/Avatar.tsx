import React from "react";
import { StyleSheet, View, Image } from "react-native";

const userPlaceholderImage = require("@/assets/images/user-placeholder.png");

function Avatar({ userId }: { userId: string }) {
  return (
    <View>
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
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
