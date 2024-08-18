import Colors from "@/constants/Colors";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, View } from "react-native";

const addCarPlaceholder = require("@/assets/images/no-image-new.png");
const addCarSmallPlaceholder = require("@/assets/images/no-image-new-small.png");

export default function AddStock() {
  return (
    <View style={styles.container}>
      <View style={styles.bannerImageContainer}>
        <Image style={styles.bannerImage} placeholder={addCarPlaceholder} contentFit="contain" />
      </View>
      <View style={styles.smallImagesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((_, index) => {
            return (
              <View
                key={index}
                style={{
                  width: 95,
                  height: 95,
                  marginRight: 10,
                  borderRadius: 20,
                }}
              >
                <Image
                  style={styles.smallImage}
                  placeholder={addCarSmallPlaceholder}
                  contentFit="cover"
                />
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bannerImageContainer: {
    padding: 5,
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGray,
  },
  bannerImage: {
    width: 190,
    height: 190,
    borderRadius: 20,
  },
  smallImagesContainer: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  smallImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
});
