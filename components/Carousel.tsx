import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { useState } from "react";
import { StyleSheet, View, Image, Text } from "react-native";
import PagerView from "react-native-pager-view";

const placeholderImage = require("@/assets/images/no-image-large.png");

interface CarouselProps {
  images: Array<{ url: string; imageIndex: number }>;
  price?: number | null;
}

export default function Carousel({ images, price }: CarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  return (
    <View>
      {images.length === 0 ? (
        <Image
          defaultSource={placeholderImage}
          style={[styles.itemCarImage, { objectFit: "cover" }]}
        />
      ) : (
        <PagerView
          style={[styles.container, styles.pagerViewContainer]}
          initialPage={0}
          onPageSelected={(e) => setSelectedIndex(e.nativeEvent.position)}
        >
          {images.map(({ url, imageIndex }: { url: string; imageIndex: number }) => {
            return (
              <View key={`${imageIndex}`} style={styles.imageContainer}>
                <Image source={{ uri: url }} style={styles.itemCarImage} />
              </View>
            );
          })}
        </PagerView>
      )}

      {price && price > 0 ? (
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{`$${formatNumberWithCommas(price)}`}</Text>
        </View>
      ) : null}
      <View style={styles.carouselContainer}>
        {images.map(({ imageIndex }: { url: string; imageIndex: number }, index: number) => {
          return (
            <View
              key={`${imageIndex}`}
              style={[
                styles.carousel,
                {
                  width: selectedIndex === index ? 16 : 8,
                  backgroundColor: selectedIndex === index ? Colors.primary : Colors.background,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  itemCarImage: {
    width: "100%",
    height: 280,
    objectFit: "cover",
  },

  pagerViewContainer: { width: "100%", height: 280 },
  imageContainer: { justifyContent: "center", alignItems: "center" },
  carouselContainer: {
    position: "absolute",
    bottom: 12,
    justifyContent: "center",
    flexDirection: "row",
    width: "100%",
  },
  carousel: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  priceContainer: {
    position: "absolute",
    right: "2%",
    top: 5,
    padding: 5,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    minWidth: 100,
  },
  price: {
    color: Colors.textPrimary,
    textAlign: "center",
    fontFamily: "SF_Pro_Display_Bold",
    fontSize: 18,
  },
});
