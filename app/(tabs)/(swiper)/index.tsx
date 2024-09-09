import analytics from "@react-native-firebase/analytics";
import { useGetSwiperCars } from "@/api/hooks/swiper";
import ContactCard from "@/components/ContactCard";
import Colors from "@/constants/Colors";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import { Image } from "expo-image";
import { router } from "expo-router";
import WatchlistButtonsContainer from "@/components/WatchlistButtonsContainer";
import Text from "@/components/Text";
import { formatNumberWithCommas } from "@/utils";
import { useAddCarToWatchlist, useMarkCarAsSeen } from "@/api/hooks/watchlist";
import { useAuth } from "@/context/AuthContext";

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
  const { token, user } = useAuth();
  const { cars, isLoading, fetchMore, error, isValidating } = useGetSwiperCars();
  const insets = useSafeAreaInsets();
  const ref = useRef<SwiperCardRefType>();
  const [watchListData, setWatchlistData] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const { trigger: addCarToWatchlist } = useAddCarToWatchlist();
  const { trigger: markCarAsSeen } = useMarkCarAsSeen();

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

  const postAnalytics = async (action: string) => {
    await analytics().logEvent(action, { userId: user?.id });
  };

  const handleRightSwipe = (cardIndex: number) => {
    if (!token) return;
    const carId = watchListData[cardIndex]?.carId;
    if (!carId) return;

    // setCardIndex(cardIndex);
    addCarToWatchlist({ carId, token, userId: undefined });
    markCarAsSeen({ carId, token });

    if (watchListData.length - cardIndex === 4) {
      loadMore();
    }

    postAnalytics("right_swipe");
  };

  const handleLeftSwiper = (cardIndex: number) => {
    if (!token) return;

    const carId = watchListData[cardIndex]?.carId;
    if (!carId) return;
    // setCardIndex(cardIndex);

    markCarAsSeen({ carId, token });

    if (watchListData.length - cardIndex === 4) {
      loadMore();
    }
    postAnalytics("left_swiper");
  };

  const renderCard = (item: Car) => {
    const badges = [
      { data: item?.transmission, uppercase: false },
      { data: item?.fuelType, uppercase: false },
      { data: item?.series, uppercase: true },
      { data: item?.badge, uppercase: false },
      { data: item?.rego, uppercase: true },
      { data: item?.capacity, uppercase: false },
      {
        data: item?.odometer ? `${formatNumberWithCommas(item?.odometer)} KMS` : null,
        uppercase: false,
      },
    ];

    return (
      <Pressable
        style={styles.renderCardContainer}
        onPress={() =>
          router.push({ pathname: "/(tabs)/(swiper)/car/[id]", params: { id: item?.carId } })
        }
      >
        <Image
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardImage}
          contentFit="cover"
          priority="high"
          recyclingKey={item?.images[0]?.carId}
          placeholder={{ blurhash }}
          placeholderContentFit="cover"
        />

        <View style={styles.absoluteCenteredView}>
          <View
            style={{
              justifyContent: "space-between",
              flexDirection: "row",
              overflow: "hidden",
            }}
          >
            <Text style={styles.detailsText}>{`${item?.year} ${item?.make} ${item?.model}`}</Text>
            {item?.price && item?.price > 0 ? (
              <View
                style={{
                  padding: 4,
                  borderRadius: 8,
                  backgroundColor: Colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 80,
                  maxHeight: 40,
                }}
              >
                <Text style={{ color: "white", fontFamily: "SF_Pro_Display_Bold", fontSize: 20 }}>
                  {`$${formatNumberWithCommas(item?.price)}`}
                </Text>
              </View>
            ) : null}
          </View>

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

          <View
            style={{
              paddingHorizontal: 30,
            }}
          >
            <WatchlistButtonsContainer
              carId={item?.carId}
              phoneNumber={item?.organisation?.phoneNumber}
              userId={item?.primaryContact?.userId}
              buttonsType="primary"
            />
          </View>
        </View>
      </Pressable>
    );
  };

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
      <View style={styles.subContainer}>
        {watchListData.length > 0 ? (
          <Swiper
            ref={ref}
            cardStyle={styles.cardStyle}
            data={watchListData}
            renderCard={renderCard}
            disableTopSwipe
            onSwipeRight={handleRightSwipe}
            onSwipeLeft={handleLeftSwiper}
            OverlayLabelRight={OverlayLabelRight}
            OverlayLabelLeft={OverlayLabelLeft}
          />
        ) : (isLoading || isValidating) && watchListData.length === 0 ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : null}
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
    height: "92%",
    borderRadius: 15,
  },
  renderCardContainer: {
    flex: 1,
    borderRadius: 15,
    height: "100%",
    backgroundColor: Colors.background,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  renderCardImage: {
    width: "100%",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    zIndex: 1,
    flex: 0.4,
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
    zIndex: 100,
    justifyContent: "flex-start",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    overflow: "hidden",
    elevation: 5,
    flex: 0.65,
    backgroundColor: Colors.background,
  },
  detailsText: {
    color: Colors.textDark,
    fontSize: 24,
    marginVertical: 10,
    fontFamily: "SF_Pro_Display_Bold",
    textTransform: "capitalize",
    marginLeft: 10,
    flex: 0.9,
  },
  badgeWrapper: {
    marginHorizontal: 5,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    flex: 1,
    overflow: "hidden",
  },
  badgeContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignSelf: "flex-start",
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  badgeText: {
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
    fontSize: 16,
  },
});
