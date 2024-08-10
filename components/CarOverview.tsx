import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, Image, View } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const placeholderImage = require("@/assets/images/no-image.png");

function CarOverview({ car }: { car: any }) {
  const onAnimatePress = (carId: string) => {
    router.push({ pathname: `/(tabs)/watchlist/[id]`, params: { id: carId } });
  };

  return (
    <AnimatedPressable style={styles.itemContainer} onPress={() => onAnimatePress(car?.carId)}>
      <Image
        defaultSource={placeholderImage}
        source={{ uri: car?.images[0]?.url }}
        style={styles.itemCarImage}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.itemCarTitle}>{`${car?.year} ${car?.make} ${car?.model}`}</Text>
        <DetailsText text={car.transmission} />
        <DetailsText text={car.body} />
        <DetailsText text={`${formatNumberWithCommas(Number(car?.odometer))} km`} />
        {(car?.capacity || car?.fuelType) && (
          <DetailsText text={`${car?.capacity} ${car?.fuelType}`} />
        )}

        <Text style={styles.itemPriceText}>{`${
          car?.price && car?.price > 0 ? `$${formatNumberWithCommas(car.price)}` : "Enquire"
        }`}</Text>
      </View>
    </AnimatedPressable>
  );
}

function DetailsText({ text }: { text: string | null }) {
  if (!text || text?.trim() === "") return null;

  return <Text style={styles.detailText}>{`• ${text}`}</Text>;
}

export default React.memo(CarOverview);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    gap: 10,
    minHeight: 150,
  },
  itemCarTitle: {
    fontSize: 20,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Bold",
    lineHeight: 22,
    color: Colors.textDark,
  },
  itemPriceText: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 10,
    fontWeight: "600",
    fontFamily: "SF_Pro_Display_Bold",
  },
  itemCarImage: {
    minWidth: 130,
    width: "40%",
    height: 130,
    borderRadius: 8,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  detailsContainer: { flex: 1, gap: 2, marginLeft: 5 },
  detailText: {
    fontSize: 16,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Light",
    lineHeight: 22,
    color: Colors.textDark,
  },
});
