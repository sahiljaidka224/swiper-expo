import Colors from "@/constants/Colors";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import { useGetWatchlist, useRemoveCarFromWatchlist } from "@/api/hooks/watchlist";
import CarOverview from "./CarOverview";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import StockButtonContainer from "./StockButtonContainer";
import CarOverviewLoader from "./SkeletonLoaders/CarOverviewLoader";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@/context/AuthContext";
import ErrorView from "./Error";
import Text from "./Text";

interface CarsListProps {
  context: CarsListContext;
  orderBy: string;
  orderDirection: string;
  orgId?: string;
}

export function CarsList({
  context,
  orderBy = "dateCreate",
  orderDirection = "desc",
  orgId,
}: CarsListProps) {
  const { token } = useAuth();
  const {
    isValidating,
    cars,
    isLoading,
    error: getError,
    refresh,
    fetchMore,
  } = useGetWatchlist(context, orderBy, orderDirection, orgId);
  const { trigger, isMutating, error: mutationError, newCars } = useRemoveCarFromWatchlist();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && cars) {
      setWatchlistData(cars);
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
          {context === "followed" || context === "search" ? (
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
    <View style={{ flex: 1 }}>
      {isLoading && (!cars || cars.length === 0) && (
        <View style={{ marginTop: 150 }}>
          <CarOverviewLoader />
          <CarOverviewLoader />
          <CarOverviewLoader />
          <CarOverviewLoader />
          <CarOverviewLoader />
        </View>
      )}
      {getError && !isLoading && !cars ? <ErrorView /> : null}
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={(isLoading || isValidating) && !cars}
        onRefresh={refresh}
        keyExtractor={(item) => item.carId}
        scrollEnabled={true}
        data={watchListData}
        estimatedItemSize={395}
        ItemSeparatorComponent={ItemSeperator}
        ListFooterComponent={() => (isLoading && cars?.length > 0 ? <Footer /> : null)}
        onEndReached={context === "stock" || context === "search" ? loadMore : null}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading ? ListEmpty : null}
      />
    </View>
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

function ListEmpty() {
  return (
    <View
      style={{
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text
        style={{
          textAlign: "center",
          fontSize: 24,
          fontFamily: "SF_Pro_Display_Medium",
          color: Colors.textDark,
        }}
      >
        Oh, Snap! No cars found. Try again later
      </Text>
    </View>
  );
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
