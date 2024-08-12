import { useGetSwiperCars } from "@/api/hooks/swiper";
import ContactCard from "@/components/ContactCard";
import Colors from "@/constants/Colors";
import { BlurView } from "expo-blur";
import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Swiper, type SwiperCardRefType } from "rn-swiper-list";



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
  const { cars, isLoading, fetchMore, error , isValidating} = useGetSwiperCars();
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

  const handleSwipe = (cardIndex: number) => {
    const newData = watchListData.filter((_, index) => index !== cardIndex);
    // setWatchlistData(newData);
    if (cardIndex === watchListData.length - 3) {
      loadMore();
    }
  };

  const renderCard = useCallback((item: Car) => {
    return (
      <View style={styles.renderCardContainer}>
        <Image
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardImage}
          resizeMode="cover"
        />
        <Image
          source={{ uri: item?.images[0]?.url }}
          style={styles.renderCardImage}
          resizeMode="cover"
        />

        <BlurView intensity={50} tint="prominent" style={styles.absoluteCenteredView}>
          <Text style={styles.detailsText}>{`${item.year} ${item.make} ${item.model}`}</Text>
          <View style={styles.badgeWrapper}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item?.transmission}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item?.fuelType}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item?.series}</Text>
            </View>

            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item?.badge}</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{item?.rego}</Text>
            </View>
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
          isLoading || isValidating && watchListData.length === 0 && <ActivityIndicator size="large" color={Colors.primary} />
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
    paddingVertical: 20,
    overflow: "hidden",
    flex: 1,
  },
  detailsText: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Bold",
    textTransform: "capitalize",
  },
  badgeWrapper: {
    margin: 5,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap", 
    gap: 10
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
  },
});
