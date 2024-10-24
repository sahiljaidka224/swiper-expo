import analytics from "@react-native-firebase/analytics";
import { useGetSwiperCars } from "@/api/hooks/swiper";
import ContactCard from "@/components/ContactCard";
import Colors from "@/constants/Colors";
import React, { useRef, useCallback, useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable, StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";
import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import Text from "@/components/Text";
import { formatNumberWithCommas } from "@/utils";
import { useAddCarToWatchlist, useMarkCarAsSeen } from "@/api/hooks/watchlist";
import { useAuth } from "@/context/AuthContext";
import { Audio } from "expo-av";
import { Sound } from "expo-av/build/Audio";
import { getCanPlaySwiperSound } from "@/context/settings";

const audioAsset = require("@/assets/audio/swish.mp3");
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
  body: string;
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

const checkNull = (value: string | null) => {
  if (!value || value === "") {
    return "-";
  }
  return value;
};

const WatchOrPass = ({ type }: { type: "Watch" | "Pass" }) => {
  return (
    <View
      style={[
        styles.overlayLabelContainer,
        {
          justifyContent: "center",
          alignItems: "center",
        },
      ]}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: type === "Watch" ? Colors.primary : Colors.borderGray,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: type === "Watch" ? Colors.textPrimary : Colors.textDark,
            fontSize: 22,
            fontFamily: "SF_Pro_Display_Bold",
          }}
        >
          {type}
        </Text>
      </View>
    </View>
  );
};

export default function SwiperPage() {
  const [isSwipeSoundEnabled, setSwipeSoundEnabled] = useState(false);

  const { token, user } = useAuth();
  const { cars, isLoading, fetchMore, error, isValidating } = useGetSwiperCars();
  const ref = useRef<SwiperCardRefType>();
  const [watchListData, setWatchlistData] = useState<Car[]>([]);
  const [page, setPage] = useState(1);
  const { trigger: addCarToWatchlist } = useAddCarToWatchlist();
  const { trigger: markCarAsSeen } = useMarkCarAsSeen();

  const [sound, setSound] = useState<Sound>();

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const canPlay = await getCanPlaySwiperSound();
        setSwipeSoundEnabled(canPlay);
      })();
      return () => {};
    }, [])
  );

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

  async function playSound() {
    if (!isSwipeSoundEnabled) return;
    try {
      const { sound } = await Audio.Sound.createAsync(audioAsset);
      setSound(sound);

      await sound.playAsync();
    } catch (error) {
      console.log("error", error);
    }
  }

  const handleRightSwipe = (cardIndex: number) => {
    if (!token) return;
    const carId = watchListData[cardIndex]?.carId;
    if (!carId) return;
    playSound();

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
    playSound();

    markCarAsSeen({ carId, token });

    if (watchListData.length - cardIndex === 4) {
      loadMore();
    }
    postAnalytics("left_swiper");
  };

  const renderCard = (item: Car) => {
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
                  paddingHorizontal: 8,
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
          <View style={{ paddingHorizontal: 10, gap: 12 }}>
            <Text style={styles.descriptionValue}>{`${formatNumberWithCommas(
              item?.odometer
            )} km`}</Text>
            <Text style={styles.descriptionValue}>{checkNull(item?.fuelType)}</Text>
            {item?.rego && (
              <Text style={[styles.descriptionValue, { textTransform: "uppercase" }]}>
                {checkNull(item?.rego)}
              </Text>
            )}
            {item?.transmission && (
              <Text style={styles.descriptionValue}>{checkNull(item?.transmission)}</Text>
            )}
            {item?.series && <Text style={styles.descriptionValue}>{checkNull(item?.series)}</Text>}
          </View>
          <View style={styles.stickyContactCard}>
            <ContactCard
              name={item?.primaryContact?.displayName}
              organisationName={item?.organisation?.name}
              userId={item?.primaryContact?.userId}
            />
          </View>
        </View>
      </Pressable>
    );
  };

  const OverlayLabelRight = useCallback(() => {
    return <WatchOrPass type="Watch" />;
  }, []);

  const OverlayLabelLeft = useCallback(() => {
    return <WatchOrPass type="Pass" />;
  }, []);

  return (
    <GestureHandlerRootView style={[styles.container, {}]}>
      <StatusBar barStyle="dark-content" />
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
    width: "100%",
    height: "100%",
  },
  renderCardContainer: {
    flex: 1,
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

    zIndex: 1,
    flex: 0.65,
  },
  subContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  overlayLabelContainer: {
    width: "100%",
    height: "100%",
  },
  absoluteCenteredView: {
    zIndex: 100,
    justifyContent: "flex-start",

    paddingHorizontal: 10,
    paddingVertical: 10,
    overflow: "hidden",
    elevation: 5,
    flex: 0.65,
    backgroundColor: Colors.background,
  },
  detailsText: {
    color: Colors.textDark,
    fontSize: 26,
    marginVertical: 10,
    fontFamily: "SF_Pro_Display_Bold",
    textTransform: "capitalize",
    marginLeft: 10,
    flex: 0.9,
  },
  descriptionValue: {
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    textAlign: "left",
    textTransform: "capitalize",
  },
  stickyContactCard: { position: "absolute", bottom: 20, flex: 1, right: 10, left: 10 },
});
