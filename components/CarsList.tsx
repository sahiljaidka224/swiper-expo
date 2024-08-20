import Colors from "@/constants/Colors";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from "react-native-reanimated";

import { useGetWatchlist, useRemoveCarFromWatchlist } from "@/api/hooks/watchlist";
import CarOverview from "./CarOverview";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import StockButtonContainer from "./StockButtonContainer";
import CarOverviewLoader from "./SkeletonLoaders/CarOverviewLoader";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@/context/AuthContext";

interface CarsListProps {
  context: "stock" | "watchlist";
}

const transition = CurvedTransition.delay(100);
const ITEM_HEIGHT = 400;

export function CarsList({ context }: CarsListProps) {
  const { token } = useAuth();
  const { cars, isLoading, error: getError, refresh, fetchMore } = useGetWatchlist(context);
  const { trigger, isMutating, error: mutationError, newCars } = useRemoveCarFromWatchlist();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && cars) {
      setWatchlistData(cars);

      // if (page === 1) {
      // } else {
      //   setWatchlistData((prevData) => [...prevData, ...cars]);
      // }
    }
  }, [cars]);

  const onMessagePress = () => {};

  const onDeletePress = useCallback(
    (carId: any) => {
      setWatchlistData((prevData) => prevData.filter((i) => i.carId !== carId));
      try {
        trigger(
          { carId: carId, token: token },
          {
            revalidate: true,
          }
        );
      } catch (error) {
        // Revert state if there's an error
        setWatchlistData(cars);
        console.error("Failed to remove car from watchlist:", error);
      }
    },
    [trigger, cars]
  );

  const loadMore = () => {
    if (!isLoading && cars?.length > 0) {
      setPage(page + 1);
      fetchMore();
    }
  };

  const onSendToPhoneContacts = () => {};

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <Animated.View
          style={styles.itemWrapper}
          entering={FadeInUp.delay(index * 10)}
          exiting={FadeOutUp}
        >
          <CarOverview car={item} context={context} />
          {context === "watchlist" ? (
            <WatchlistButtonsContainer
              carId={item?.carId}
              onMessage={onMessagePress}
              phoneNumber={item?.organisation?.phoneNumber}
              onDelete={onDeletePress}
            />
          ) : (
            <StockButtonContainer carId="" onPushToSwiperContacts={onSendToPhoneContacts} />
          )}
        </Animated.View>
      );
    },
    [onDeletePress, watchListData]
  );

  return (
    <>
      <Animated.View layout={transition} style={{ flex: 1 }}>
        {isLoading && (!cars || cars.length === 0) && (
          <View style={{ marginTop: 150 }}>
            <CarOverviewLoader />
            <CarOverviewLoader />
            <CarOverviewLoader />
            <CarOverviewLoader />
            <CarOverviewLoader />
          </View>
        )}
        <FlashList
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshing={isLoading && cars.length > 0}
          onRefresh={refresh}
          keyExtractor={(item) => item.carId}
          scrollEnabled={true}
          data={watchListData}
          estimatedItemSize={395}
          ItemSeparatorComponent={ItemSeperator}
          ListFooterComponent={() => (isLoading && cars?.length > 0 ? <Footer /> : null)}
          onEndReached={context === "stock" ? loadMore : null}
          onEndReachedThreshold={0.5}
          renderItem={renderItem}
          // ListEmptyComponent={ListEmpty} // TODO: List Empty
        />
      </Animated.View>
    </>
  );
}

function ItemSeperator() {
  return (
    <View style={styles.itemSeperatorContainer}>
      <View style={styles.itemSeperator} />
    </View>
  );
}

function Footer() {
  return <ActivityIndicator size="large" color={Colors.primary} />;
}

const styles = StyleSheet.create({
  itemSeperatorContainer: {
    paddingHorizontal: 10,
  },
  itemSeperator: {
    borderBottomColor: Colors.borderGray,
    borderBottomWidth: 1,
    paddingHorizontal: "10%",
  },
  itemWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
  },
});
