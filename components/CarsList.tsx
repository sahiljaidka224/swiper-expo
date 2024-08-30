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
import { router } from "expo-router";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { CometChat } from "@cometchat/chat-sdk-react-native";

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
  const { token, user } = useAuth();
  const {
    isValidating,
    cars,
    isLoading,
    error: getError,
    refresh,
    fetchMore,
  } = useGetWatchlist(context, orderBy, orderDirection, orgId);
  const { trigger, isMutating, error: mutationError, newCars } = useRemoveCarFromWatchlist();
  const { createGroup, error: errorGroup, group, loading: isGroupLoading } = useCreateGroup();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

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

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const onSendToPhoneContacts = () => {
        router.push({ pathname: "/(tabs)/(stock)/users-list" });
      };

      const onMessagePress = () => {
        if (!user?.id || !item?.organisation?.ownerUserId) return;

        const GUID = `${user?.id}_${item?.carId}_${item?.organisation?.ownerUserId}`;
        const chatName = String(
          `${user?.name.split(" ")[0]} - ${item?.year} ${item?.make} ${item?.model}`
        ).toUpperCase();
        const icon = item?.images[0]?.url ?? "https://picsum.photos/200";
        const owner = user?.id;
        const members = [owner, item?.organisation?.ownerUserId];
        const metadata = {
          carId: item?.carId,
          make: item?.make,
          model: item?.model,
          year: item?.year,
          price: item?.price,
          odometer: item?.odometer,
          icon,
        };
        const tags = ["car-chat"];

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
          <CarOverview car={item} context={context} />
          {context === "followed" || context === "search" ? (
            <WatchlistButtonsContainer
              carId={item?.carId}
              onMessage={onMessagePress}
              phoneNumber={item?.organisation?.phoneNumber}
              onDelete={onDeletePress}
              isPrimaryButtonLoading={isGroupLoading}
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
    borderRadius: 10,
    padding: 15,
  },
});
