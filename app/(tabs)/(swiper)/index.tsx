import analytics from "@react-native-firebase/analytics";
import { useGetSwiperCars } from "@/api/hooks/swiper";
import ContactCardNew from "@/components/ContactCardNew";
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
import Animated, { FadeInDown } from "react-native-reanimated";

const AnimatedImage = Animated.createAnimatedComponent(Image);
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
        <AnimatedImage
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardImage}
          contentFit="cover"
          priority="high"
          recyclingKey={item?.images[0]?.carId}
          placeholder={{ blurhash }}
          placeholderContentFit="cover"
          sharedTransitionTag={`car-image-${item?.carId}`}
        />
        <Animated.View
          style={styles.absoluteCenteredViewCopy}
          entering={FadeInDown.delay(150).duration(400)}
          exiting={FadeInDown.delay(150).duration(400)}
        >
          <View style={styles.absoluteCenteredView}>
            <Text
              style={styles.detailsText}
              maxFontSizeMultiplier={1.1}
              numberOfLines={1}
              ellipsizeMode="tail"
            >{`${item?.year} ${item?.make} ${item?.model}`}</Text>
            <Text
              maxFontSizeMultiplier={1.1}
              style={{
                color: Colors.primary,
                fontFamily: "SF_Pro_Display_Bold",
                fontSize: 24,
                marginVertical: 5,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {`$${formatNumberWithCommas(item?.price)}`}
            </Text>
            <View style={styles.carDetailsContainer}>
              <View style={{ flex: 0.5, justifyContent: "flex-start", gap: 10 }}>
                <View>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={{
                      fontSize: 16,
                      fontFamily: "SF_Pro_Display_Light",
                      marginBottom: 2,
                      color: Colors.textLight,
                    }}
                  >
                    Odometer
                  </Text>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={styles.descriptionValue}
                  >{`${formatNumberWithCommas(item?.odometer)} km`}</Text>
                </View>
                <View>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={{
                      fontSize: 16,
                      fontFamily: "SF_Pro_Display_Light",
                      marginBottom: 2,
                      color: Colors.textLight,
                    }}
                  >
                    Fuel Type
                  </Text>
                  <Text maxFontSizeMultiplier={1.1} style={styles.descriptionValue}>
                    {checkNull(item?.fuelType)}
                  </Text>
                </View>
              </View>
              <View style={{ flex: 0.5, justifyContent: "flex-start", gap: 10 }}>
                <View>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={{
                      fontSize: 16,
                      fontFamily: "SF_Pro_Display_Light",
                      marginBottom: 2,
                      color: Colors.textLight,
                    }}
                  >
                    Transmission
                  </Text>
                  {item?.transmission && (
                    <Text maxFontSizeMultiplier={1.1} style={styles.descriptionValue}>
                      {checkNull(item?.transmission)}
                    </Text>
                  )}
                </View>

                <View>
                  <Text
                    maxFontSizeMultiplier={1.1}
                    style={{
                      fontSize: 16,
                      fontFamily: "SF_Pro_Display_Light",
                      marginBottom: 2,
                      color: Colors.textLight,
                    }}
                  >
                    Series
                  </Text>
                  {item?.series && (
                    <Text maxFontSizeMultiplier={1.1} style={styles.descriptionValue}>
                      {checkNull(item?.series)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
          <View style={styles.stickyContactCard}>
            <ContactCardNew
              name={item?.primaryContact?.displayName}
              organisationName={item?.organisation?.name}
              userId={item?.primaryContact?.userId}
              phoneNumber={item?.primaryContact?.phoneNumber}
              car={item}
            />
          </View>
        </Animated.View>
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
          <ActivityIndicator size="large" color={Colors.background} />
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
    backgroundColor: Colors.primary,
  },
  cardStyle: {
    width: "100%",
    height: "100%",
  },
  renderCardContainer: {
    flex: 1,
    height: "100%",
    backgroundColor: Colors.primary,
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
    flex: 1,
  },
  subContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // backgroundColor: "red",
  },
  overlayLabelContainer: {
    width: "100%",
    height: "100%",
  },
  absoluteCenteredViewCopy: {
    // position: "absolute",
    // width: "100%",
    // bottom: 0,
    // zIndex: 100,
  },
  absoluteCenteredView: {
    zIndex: 100,
    justifyContent: "flex-start",
    paddingHorizontal: 5,
    paddingVertical: 5,
    overflow: "hidden",
    elevation: 5,
    backgroundColor: Colors.background,
    display: "flex",
    width: "95%",
    // flex: 0.6,
    // minHeight: "35%",
    margin: 10,
    // maxHeight: "70%",
    borderRadius: 24,
  },
  detailsText: {
    color: Colors.textDark,
    fontSize: 28,
    // marginVertical: 10,
    fontFamily: "SF_Pro_Display_Bold",
    textTransform: "capitalize",
    // marginLeft: 10,
    // flex: 0.9,
    lineHeight: 32,
    textAlign: "center",
  },
  descriptionValue: {
    color: Colors.textDark,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 18,
    textAlign: "left",
    textTransform: "capitalize",
  },
  stickyContactCard: { marginHorizontal: 10, marginBottom: 5 },
  carDetailsContainer: {
    flexDirection: "row",
    // gap: 10,
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 12,
    borderRadius: 16,
    // backgroundColor: "red",
    backgroundColor: Colors.background,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
