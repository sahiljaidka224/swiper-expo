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

function CarOverview({
  car,
  context,
  children,
  showDetails = true,
}: {
  car: any;
  context: CarsListContext;
  children?: React.ReactNode;
  showDetails?: boolean;
}) {
  const segments = useSegments();
  const onAnimatePress = (carId: string) => {
    router.push({
      pathname: `/(tabs)/${segments[1]}/car/[id]`,
      params: { id: carId },
    });
  };

  if (!showDetails) {
    return (
      <AnimatedPressable style={styles.itemContainer} onPress={() => onAnimatePress(car?.carId)}>
        <View
          style={{
            width: "100%",
            height: 300,
            position: "relative",
          }}
        >
          <Image
            placeholder={placeholderImage}
            source={{ uri: car?.images[0]?.url }}
            style={[
              styles.itemCarImage,
              { borderRadius: 15, width: "100%" },
              !car?.images[0]?.url ? { borderRadius: 0, borderWidth: 0 } : {},
            ]}
            recyclingKey={car?.images[0]?.carImageId}
            placeholderContentFit="fill"
          />
          <View style={styles.priceContainer}>
            {typeof car?.daysInStock === "number" ? (
              <View style={styles.daysInStockContainer}>
                <Text style={styles.daysInStockText}>{`${car?.daysInStock} days`}</Text>
              </View>
            ) : (
              <View />
            )}
            <View style={styles.itemPriceTextContainer}>
              <Text style={styles.itemPriceText}>{`${
                car?.price && car?.price > 0
                  ? `$${formatNumberWithCommas(car.price)}`
                  : context === "followed"
                  ? "Enquire"
                  : "No Price"
              }`}</Text>
            </View>
          </View>
          <Text
            style={[styles.itemCarTitle, { paddingVertical: 5, textAlign: "center" }]}
          >{`${car?.year} ${car?.make} ${car?.model}`}</Text>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable style={styles.itemContainer} onPress={() => onAnimatePress(car?.carId)}>
      <View
        style={{
          width: 180,
          height: 180,
          position: "relative",
        }}
      >
        <Image
          placeholder={placeholderImage}
          source={{ uri: car?.images[0]?.url }}
          style={[
            styles.itemCarImage,
            !car?.images[0]?.url ? { marginLeft: -12, borderRadius: 0, borderWidth: 0 } : {},
          ]}
          recyclingKey={car?.images[0]?.carImageId}
          placeholderContentFit="fill"
        />
        <View style={styles.priceContainer}>
          {typeof car?.daysInStock === "number" ? (
            <View style={styles.daysInStockContainer}>
              <Text style={styles.daysInStockText}>{`${car?.daysInStock} days`}</Text>
            </View>
          ) : (
            <View />
          )}
          <View style={styles.itemPriceTextContainer}>
            <Text style={styles.itemPriceText}>{`${
              car?.price && car?.price > 0
                ? `$${formatNumberWithCommas(car.price)}`
                : context === "followed"
                ? "Enquire"
                : "No Price"
            }`}</Text>
          </View>
        </View>
      </View>
      {showDetails ? (
        <View style={styles.detailsContainer}>
          <View style={{ gap: 2 }}>
            <Text style={styles.itemCarTitle}>{`${car?.year} ${car?.make} ${car?.model}`}</Text>
            <DetailsText text={car.transmission} />
            <DetailsText text={car.body} />
            <DetailsText text={`${formatNumberWithCommas(Number(car?.odometer))} km`} />
            {(car?.capacity || car?.fuelType) && (
              <DetailsText text={`${car?.capacity} ${car?.fuelType}`} />
            )}
          </View>
          {children}
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

function DetailsText({ text }: { text: string | null }) {
  if (!text || text?.trim() === "") return null;

  return <Text style={styles.detailText}>{text}</Text>;
}

export default React.memo(CarOverview);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    gap: 5,
    minHeight: 150,
  },
  itemCarTitle: {
    fontSize: 20,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Bold",
    lineHeight: 22,
    color: Colors.textDark,
  },
  itemPriceTextContainer: {
    backgroundColor: Colors.primary,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomRightRadius: 15,
  },
  itemPriceText: {
    fontSize: 18,
    color: Colors.background,
    fontWeight: "600",
    fontFamily: "SF_Pro_Display_Bold",
    borderRadius: 15,
  },
  itemCarImage: {
    minWidth: 140,
    height: "100%",
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  detailsContainer: { flex: 1, marginLeft: 5, justifyContent: "space-between" },
  detailText: {
    fontSize: 16,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Light",
    lineHeight: 22,
    color: Colors.textDark,
  },
  priceContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,

    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  daysInStockContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 5,
  },
  daysInStockText: {
    color: Colors.primary,
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 12,
  },
});
