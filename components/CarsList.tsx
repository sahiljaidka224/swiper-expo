import Colors from "@/constants/Colors";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from "react-native-reanimated";

import { useGetWatchlist, useRemoveCarFromWatchlist } from "@/api/hooks/watchlist";
import CarOverview from "./CarOverview";
import ButtonsContainer from "./ButtonsContainer";

interface CarsListProps {}

const transition = CurvedTransition.delay(100);

export function CarsList({}: CarsListProps) {
  const { cars, isLoading, error: getError, refresh, fetchMore } = useGetWatchlist();
  const { trigger, isMutating, error: mutationError, newCars } = useRemoveCarFromWatchlist();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && cars) {
      if (page === 1) {
        setWatchlistData(cars);
      } else {
        setWatchlistData((prevData) => [...prevData, ...cars]);
      }
    }
  }, [cars]);

  const onAnimatePress = (carId: string) => {
    router.push({ pathname: `/(tabs)/watchlist/[id]`, params: { id: carId } });
  };

  const onMessagePress = () => {};

  const onDeletePress = useCallback(
    (carId: any) => {
      setWatchlistData((prevData) => prevData.filter((i) => i.carId !== carId));
      try {
        trigger(
          { carId: carId },
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
      fetchMore(page + 1);
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <Animated.View
          style={styles.itemWrapper}
          entering={FadeInUp.delay(index * 10)}
          exiting={FadeOutUp}
        >
          <CarOverview car={item} />
          <ButtonsContainer
            carId={item?.carId}
            onMessage={onMessagePress}
            phoneNumber={item?.organisation?.phoneNumber}
            onDelete={onDeletePress}
          />
        </Animated.View>
      );
    },
    [onAnimatePress, onDeletePress, watchListData]
  );

  return (
    <Animated.View layout={transition}>
      <Animated.FlatList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={isLoading}
        onRefresh={refresh}
        skipEnteringExitingAnimations
        keyExtractor={(item) => item.carId}
        scrollEnabled={true}
        data={watchListData}
        itemLayoutAnimation={transition}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
        ItemSeparatorComponent={ItemSeperator}
        ListFooterComponent={() => (isLoading && cars?.length > 0 ? <Footer /> : null)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        // ListEmptyComponent={ListEmpty}
        // getItemLayout={(_, index) => ({
        //   length: ITEM_HEIGHT,
        //   offset: ITEM_HEIGHT * index,
        //   index,
        // })}
      />
    </Animated.View>
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
