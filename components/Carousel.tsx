import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import PagerView from "react-native-pager-view";
import { Image } from "expo-image";
import Text from "./Text";
import Gallery from "./Gallery";

const placeholderImage = require("@/assets/images/no-image-large.png");

interface CarouselProps {
  images: Array<{ url: string; imageIndex: number }>;
  price?: number | null;
}

export default function Carousel({ images, price }: CarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isImageViewerVisible, setImageViewerVisible] = useState<boolean>(false);

  return (
    <View>
      {images.length === 0 ? (
        <Image
          placeholder={placeholderImage}
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
              <TouchableOpacity
                key={`${imageIndex}`}
                style={styles.imageContainer}
                activeOpacity={0.75}
                onLongPress={() => {
                  setImageViewerVisible(true);
                }}
              >
                <Image source={{ uri: url }} style={styles.itemCarImage} />
              </TouchableOpacity>
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
      <Gallery
        images={images}
        isVisible={isImageViewerVisible}
        onClose={() => setImageViewerVisible(false)}
        setSelectedIndex={setSelectedIndex}
        selectedIndex={selectedIndex}
      />
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
