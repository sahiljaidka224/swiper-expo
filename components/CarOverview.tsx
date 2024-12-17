import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { router, useSegments } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import { Image } from "expo-image";
import Text from "@/components/Text";

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const carPlaceholder = require("@/assets/images/car-placeholder-new.png");

function CarOverview({
  car,
  context,
  children,
  showDetails = true,
  showExtraDetails = false,
}: {
  car: any;
  context: CarsListContext;
  children?: React.ReactNode;
  showDetails?: boolean;
  showExtraDetails?: boolean;
}) {
  const segments = useSegments();
  const onAnimatePress = (carId: string) => {
    router.push({
      pathname: `/(tabs)/${segments[1]}/car/[id]`,
      params: { id: carId },
    });
  };

  const carImages = car?.images ?? [];

  if (!showDetails) {
    return (
      <AnimatedPressable
        style={[styles.itemContainer, { flexDirection: "column", gap: 0 }]}
        onPress={() => onAnimatePress(car?.carId)}
      >
        <View
          style={{
            width: "100%",
            height: 238,
          }}
        >
          <Image
            placeholder={carPlaceholder}
            source={{
              uri: carImages.length > 0 ? carImages[0]?.url : undefined,
            }}
            style={[
              styles.itemCarImage,
              {
                borderRadius: 0,
                width: "100%",
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderWidth: 0,
              },
              !carImages[0]?.url ? { borderRadius: 0, borderWidth: 0 } : {},
            ]}
            contentFit="cover"
            recyclingKey={carImages[0]?.carImageId}
            placeholderContentFit="fill"
          />
        </View>
        <View
          style={{
            paddingTop: 8,
            paddingBottom: showExtraDetails ? 4 : 20,
            paddingLeft: 8,
            backgroundColor: "white",
          }}
        >
          <Text
            style={[
              styles.itemCarTitle,
              {
                textAlign: "left",
                fontSize: 22,
                fontFamily: "SF_Pro_Display_Medium",
              },
            ]}
          >{`${car?.make} ${car?.model ? car?.model : ""}`}</Text>
          <Text
            style={[
              styles.itemCarTitle,
              {
                textAlign: "left",
                fontSize: 18,
                fontFamily: "SF_Pro_Display_Light",
              },
            ]}
          >{`${car?.year} ${car?.series ? `- ${car?.series}` : ""}`}</Text>
          <View style={styles.lessDetailsContainer}>
            {car?.odometer ? (
              <View style={styles.detailsView}>
                <Text style={styles.detailsTextNew}>
                  {formatNumberWithCommas(Number(car?.odometer))} km
                </Text>
              </View>
            ) : null}
            {car?.transmission ? (
              <View style={styles.detailsView}>
                <Text style={styles.detailsTextNew}>{car?.transmission}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable style={styles.itemContainer} onPress={() => onAnimatePress(car?.carId)}>
      <View
        style={{
          width: 180,
          minHeight: 180,
          maxHeight: 220,
        }}
      >
        <AnimatedImage
          placeholder={carPlaceholder}
          source={{ uri: carImages.length > 0 ? carImages[0]?.url : undefined }}
          style={[
            styles.itemCarImage,
            carImages.length > 0 && carImages[0]?.url
              ? {}
              : { marginLeft: -12, borderRadius: 0, borderWidth: 0 },
          ]}
          recyclingKey={car?.images[0]?.carImageId}
          placeholderContentFit="cover"
          sharedTransitionTag={`car-image-${car?.carId}`}
        />
      </View>
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
        <View style={[styles.priceContainer]}>
          {typeof car?.daysInStock === "number" && (
            <View style={styles.daysInStockContainer}>
              <Text
                style={styles.daysInStockText}
                maxFontSizeMultiplier={1.1}
              >{`${car?.daysInStock} days`}</Text>
            </View>
          )}
          {car?.price && car?.price > 0 ? (
            <View style={styles.itemPriceTextContainer}>
              <Text
                style={styles.itemPriceText}
                maxFontSizeMultiplier={1.1}
              >{`$${formatNumberWithCommas(car.price)}`}</Text>
            </View>
          ) : null}
        </View>
        {children}
      </View>
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
    borderRadius: 15,
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

    objectFit: "cover",
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 5,
    justifyContent: "space-between",
  },
  detailText: {
    fontSize: 16,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Light",
    lineHeight: 22,
    color: Colors.textDark,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  daysInStockContainer: {
    backgroundColor: Colors.primaryLight,
    padding: 5,
    borderRadius: 15,
  },
  daysInStockText: {
    color: Colors.primary,
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 12,
  },
  lessDetailsContainer: { display: "flex", flexDirection: "row", gap: 8, marginTop: 5 },
  detailsView: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: Colors.lightGrayBackground,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsTextNew: {
    fontSize: 16,
    lineHeight: 20,
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
});
