import Colors from "@/constants/Colors";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";

import {
  useGetWatchlist,
  useRemoveCarFromStock,
  useRemoveCarFromWatchlist,
} from "@/api/hooks/watchlist";
import CarOverview from "./CarOverview";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import StockButtonContainer from "./StockButtonContainer";
import CarOverviewLoader from "./SkeletonLoaders/CarOverviewLoader";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@/context/AuthContext";
import ErrorView from "./Error";
import Text from "./Text";
import { router, useFocusEffect } from "expo-router";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { showToast } from "./Toast";

interface CarsListProps {
  context: CarsListContext;
  orderBy: string;
  orderDirection: string;
  orgId?: string;
  onUpdateCarsCount?: () => void;
}

export function CarsList({
  context,
  orderBy = "dateCreate",
  orderDirection = "desc",
  orgId,
  onUpdateCarsCount,
}: CarsListProps) {
  const { token, user } = useAuth();
  const {
    isValidating,
    cars,
    isLoading,
    error: getError,
    refresh,
    fetchMore,
  } = useGetWatchlist(context, orderBy, orderDirection, orgId);
  const {
    trigger,
    isMutating,
    error: mutationError,
    newCars: watchlistCars,
  } = useRemoveCarFromWatchlist();
  const {
    trigger: removeFromStock,
    isMutating: isStockDelMutating,
    newCars: stockCars,
  } = useRemoveCarFromStock();
  const { createGroup, group, loading: isGroupLoading, setGroupLoading } = useCreateGroup();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      refresh();

      if (onUpdateCarsCount) onUpdateCarsCount();

      return () => {};
    }, [])
  );

  useEffect(() => {
    if (watchlistCars || stockCars) {
      showToast("Success", "Updated successfully", "success");
    }

    if (!isStockDelMutating && stockCars && onUpdateCarsCount) {
      onUpdateCarsCount();
    }
  }, [watchlistCars, stockCars]);

  useEffect(() => {
    if (!isLoading && cars) {
      setWatchlistData(cars);
    }
  }, [cars]);

  useEffect(() => {
    if (group && !isGroupLoading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(followed)/new-chat/[id]", params: { id: guid } });
    }
  }, [isGroupLoading, group]);

  const onDeleteFromWatchlistPress = useCallback(
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
        showToast("Error", "Failed to remove car from watchlist", "error");
      }
    },
    [trigger, cars]
  );

  const onDeleteFromStockPress = useCallback(
    (carId: any) => {
      setWatchlistData((prevData) => prevData.filter((i) => i.carId !== carId));
      try {
        removeFromStock(
          { carId: carId, token: token },
          {
            revalidate: true,
          }
        );
      } catch (error) {
        // Revert state if there's an error
        setWatchlistData(cars);
        showToast("Error", "Failed to remove car from stock", "error");
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

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const onSendToPhoneContacts = () => {
        router.push({ pathname: `/(tabs)/(stock)/users-list?carId=${item?.carId}` });
      };

      const onMessagePress = (selectedUserId?: string) => {
        const userId = selectedUserId ?? item?.organisation?.ownerUserId;
        if (!user?.id || !userId) return;

        const GUID = String(`${user?.id}_${item?.carId}_${userId}`).slice(0, 100);
        const chatName = String(`${item?.year} ${item?.model}`).toUpperCase();
        const icon = item?.images[0]?.url ?? undefined;
        const owner = user?.id;
        const members = [owner, userId];
        const metadata = {
          carId: item?.carId,
          make: item?.make,
          model: item?.model,
          year: item?.year,
          price: item?.price,
          odometer: item?.odometer,
          icon,
          members,
        };
        const tags = [owner, userId, item?.carId];

        const group = new CometChat.Group(
          GUID,
          chatName,
          CometChat.GROUP_TYPE.PRIVATE,
          undefined,
          icon,
          undefined
        );
        group.setMetadata(metadata);
        group.setTags(tags);
        group.setOwner(owner);
        group.setMembersCount(2);

        createGroup(group, members);
      };

      return (
        <Animated.View
          style={styles.itemWrapper}
          entering={FadeInUp.delay(index * 10)}
          exiting={FadeOutUp}
        >
          <CarOverview car={item} context={context}>
            {context === "followed" || context === "search" ? (
              <WatchlistButtonsContainer
                carId={item?.carId}
                onMessage={onMessagePress}
                phoneNumber={
                  item?.organisation?.phoneNumber && item?.organisation?.phoneNumber !== ""
                    ? item?.organisation?.phoneNumber
                    : item?.primaryContact?.phoneNumber
                }
                onDelete={onDeleteFromWatchlistPress}
                isPrimaryButtonLoading={isGroupLoading}
                orgId={item?.organisationId}
                circularIcons
              />
            ) : null}
          </CarOverview>

          {context !== "followed" && context !== "search" ? (
            <View style={{ paddingLeft: 10 }}>
              <StockButtonContainer
                carId={item?.carId}
                onPushToSwiperContacts={onSendToPhoneContacts}
                showOptionSheet
                onDelete={item?.importSource === "regopage" ? onDeleteFromStockPress : undefined}
              />
            </View>
          ) : null}
        </Animated.View>
      );
    },
    [onDeleteFromWatchlistPress, watchListData, onDeleteFromStockPress, isGroupLoading, createGroup]
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
      {isMutating || isStockDelMutating ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : null}
      <FlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={(isLoading || isValidating) && !cars}
        onRefresh={refresh}
        keyExtractor={(item) => item.carId}
        scrollEnabled={true}
        data={watchListData}
        estimatedItemSize={253}
        ItemSeparatorComponent={ItemSeperator}
        ListFooterComponent={() => (isLoading && cars?.length > 0 ? <Footer /> : null)}
        onEndReached={context === "stock" || context === "search" ? loadMore : null}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading && (!cars || !cars.length) ? ListEmpty : null}
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
    paddingVertical: 15,
    paddingRight: 10,
    // borderRadius: 10,
    // padding: 10,
  },
});
