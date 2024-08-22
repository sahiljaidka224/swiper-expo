import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGetOrgCars } from "@/api/hooks/watchlist";
import CarOverview from "@/components/CarOverview";
import ErrorView from "@/components/Error";
import CarOverviewLoader from "@/components/SkeletonLoaders/CarOverviewLoader";
import StockButtonContainer from "@/components/StockButtonContainer";
import WatchlistButtonsContainer from "@/components/WatchlistButtonsContainer";
import { FlashList } from "@shopify/flash-list";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

export default function OrgListing() {
  // TODO: use Order state
  const [orderState, setOrderState] = useState<{ orderBy: string; orderDirection: string }>({
    orderBy: "dateCreate",
    orderDirection: "desc",
  });

  const { orgId } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <CarsListOrgs
        context="search"
        orderBy={orderState.orderBy}
        orderDirection={orderState.orderDirection}
        orgId={orgId as string}
      />
    </View>
  );
}

interface CarsListProps {
  context: CarsListContext;
  orderBy: string;
  orderDirection: string;
  orgId?: string;
}

function CarsListOrgs({
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
  } = useGetOrgCars(context, orderBy, orderDirection, orgId);
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoading && cars && cars) {
      setWatchlistData(cars);
    }
  }, [cars]);

  const onMessagePress = () => {};

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
            />
          ) : (
            <StockButtonContainer carId="" onPushToSwiperContacts={onSendToPhoneContacts} />
          )}
        </Animated.View>
      );
    },
    [watchListData]
  );

  return (
    <View style={{ flex: 1 }}>
      {isLoading && (!cars || cars?.length === 0) && (
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
        // ListEmptyComponent={ListEmpty} // TODO: List Empty
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
