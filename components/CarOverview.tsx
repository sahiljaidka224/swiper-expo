import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { router, useSegments } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import Text from "@/components/Text";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const placeholderImage = require("@/assets/images/no-image.png");

function CarOverview({ car, context }: { car: any; context: CarsListContext }) {
  const segments = useSegments();
  const onAnimatePress = (carId: string) => {
    router.push({
      pathname: `/(tabs)/${segments[1]}/car/[id]`,
      params: { id: carId },
    });
  };

  return (
    <AnimatedPressable style={styles.itemContainer} onPress={() => onAnimatePress(car?.carId)}>
      <Image
        placeholder={placeholderImage}
        source={{ uri: car?.images[0]?.url }}
        style={styles.itemCarImage}
        recyclingKey={car?.images[0]?.carImageId}
        placeholderContentFit="fill"
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.itemCarTitle}>{`${car?.year} ${car?.make} ${car?.model}`}</Text>
        <DetailsText text={car.transmission} />
        <DetailsText text={car.body} />
        <DetailsText text={`${formatNumberWithCommas(Number(car?.odometer))} km`} />
        {(car?.capacity || car?.fuelType) && (
          <DetailsText text={`${car?.capacity} ${car?.fuelType}`} />
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.itemPriceText}>{`${
            car?.price && car?.price > 0
              ? `$${formatNumberWithCommas(car.price)}`
              : context === "followed"
              ? "Enquire"
              : "No Price"
          }`}</Text>
          {typeof car?.daysInStock === "number" ? (
            <View style={styles.daysInStockContainer}>
              <Text style={styles.daysInStockText}>{`${car?.daysInStock} days`}</Text>
            </View>
          ) : null}
        </View>
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
    fontWeight: "600",
    fontFamily: "SF_Pro_Display_Bold",
  },
  itemCarImage: {
    minWidth: 130,
    width: "40%",
    height: 130,
    borderRadius: 15,
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
  priceContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  daysInStockContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 5,
    borderRadius: 20,
  },
  daysInStockText: {
    color: Colors.primary,
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 12,
  },
});
