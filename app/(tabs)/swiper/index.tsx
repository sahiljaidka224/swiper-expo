import { useGetSwiperCars } from "@/api/hooks/swiper";
import ContactCard from "@/components/ContactCard";
import Colors from "@/constants/Colors";
import { BlurView } from "expo-blur";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { View, StyleSheet, Text, ActivityIndicator, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { AntDesign } from "@expo/vector-icons";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

interface Car {
  badge: string;
  capacity: string;
  carId: string;
  cylinders: string;
  fuelType: string;
  gears: string;
  images: { carId: string; carImageId: string; imageIndex: number; url: string }[];
  make: string;
  model: string;
  month: string;
  odometer: number;
  organisationId: string;
  price: number;
  rego: string;
  regoValid: string | null;
  series: string;
  transmission: string | null;
  year: string;
  primaryContact: {
    userId: string;
    firstName: string;
    lastName: string;
    displayName: string;
    phoneNumber: string;
  };
  organisation: {
    organisationId: string;
    name: string;
    address: string;
    phoneNumber: string;
    state: "string";
  };
}

export default function SwiperPage() {
  const { cars, isLoading, fetchMore, error, isValidating } = useGetSwiperCars();
  const insets = useSafeAreaInsets();
  const ref = useRef<SwiperCardRefType>();
  const [watchListData, setWatchlistData] = useState<Car[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && cars?.cars) {
      setWatchlistData((prevData) => (page === 1 ? cars.cars : [...prevData, ...cars.cars]));
    }
  }, [cars, isLoading]);

  const loadMore = () => {
    if (!isValidating && !isLoading && watchListData.length > 0) {
      setPage((prevPage) => prevPage + 1);
      fetchMore(page + 1);
    }
  };

  const handleSwipe = useCallback(
    (cardIndex: number) => {
      console.log({ cardIndex });
      // setWatchlistData((prevData) => prevData.filter((_, index) => index !== cardIndex));

      if (cardIndex === 6) {
        loadMore();
      }
    },
    [watchListData, loadMore]
  );

  const renderCard = useCallback((item: Car) => {
    const badges = [
      { data: item?.transmission, uppercase: false },
      { data: item?.fuelType, uppercase: false },
      { data: item?.series, uppercase: true },
      { data: item?.badge, uppercase: false },
      { data: item?.rego, uppercase: true },
      { data: item?.capacity, uppercase: false },
      { data: item?.odometer, uppercase: false },
    ];

    return (
      <View style={styles.renderCardContainer}>
        <Image
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardImage}
          contentFit="cover"
          priority="high"
          recyclingKey={item?.images[0]?.carId}
          placeholder={{ blurhash }}
          placeholderContentFit="cover"
        />
        <Image
          placeholder={{ blurhash }}
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardPlaceholder}
          contentFit="cover"
          recyclingKey={item?.images[0]?.carId}
        />
        <BlurView intensity={90} tint="prominent" style={styles.absoluteCenteredView}>
          <Text style={styles.detailsText}>{`${item?.year} ${item?.make} ${item?.model}`}</Text>
          <View style={styles.badgeWrapper}>
            {badges.map((badge, index) => {
              if (!badge.data || String(badge.data).trim() === "") {
                return null;
              }

              return (
                <View style={styles.badgeContainer} key={index}>
                  <Text
                    style={[
                      styles.badgeText,
                      { textTransform: badge?.uppercase ? "uppercase" : "capitalize" },
                    ]}
                  >
                    {badge.data}
                  </Text>
                </View>
              );
            })}
          </View>
          <ContactCard
            name={item?.primaryContact?.displayName}
            organisationName={item?.organisation?.name}
            userId={item?.primaryContact?.userId}
          />
        </BlurView>
      </View>
    );
  }, []);

  const OverlayLabelRight = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: Colors.primary,
          },
        ]}
      />
    );
  }, []);

  const OverlayLabelLeft = useCallback(() => {
    return (
      <View
        style={[
          styles.overlayLabelContainer,
          {
            backgroundColor: "red",
          },
        ]}
      />
    );
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, { marginTop: insets.top + 30 }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => router.push("/swiper/search")}>
              <AntDesign name="search1" size={24} color={Colors.iconGray} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.subContainer}>
        {!isLoading && watchListData.length > 0 ? (
          <Swiper
            ref={ref}
            cardStyle={styles.cardStyle}
            data={watchListData}
            renderCard={renderCard}
            disableTopSwipe
            onSwipeRight={handleSwipe}
            onSwipeLeft={handleSwipe}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelLeft={OverlayLabelLeft}
          />
        ) : (
          (isLoading || isValidating) &&
          watchListData.length === 0 && <ActivityIndicator size="large" color={Colors.primary} />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardStyle: {
    width: "95%",
    height: "95%",
    borderRadius: 15,
  },
  renderCardContainer: {
    flex: 1,
    borderRadius: 15,
    height: "95%",
    backgroundColor: Colors.primary,
    width: "100%",
  },
  renderCardImage: {
    height: "50%",
    width: "100%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  renderCardPlaceholder: {
    height: "50%",
    width: "100%",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  subContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayLabelContainer: {
    width: "100%",
    height: "100%",
    borderRadius: 15,
  },
  absoluteCenteredView: {
    height: "50%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "flex-start",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    overflow: "hidden",
    flex: 1,
  },
  detailsText: {
    color: Colors.textDark,
    fontSize: 24,
    marginVertical: 10,
    fontFamily: "SF_Pro_Display_Bold",
    textTransform: "capitalize",
    marginLeft: 10,
  },
  badgeWrapper: {
    margin: 5,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badgeContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: Colors.textPrimary,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
    fontSize: 16,
  },
});
