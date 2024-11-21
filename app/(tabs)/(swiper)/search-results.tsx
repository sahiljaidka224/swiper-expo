import Colors from "@/constants/Colors";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import CarOverview from "@/components/CarOverview";
import ErrorView from "@/components/Error";
import CarOverviewLoader from "@/components/SkeletonLoaders/CarOverviewLoader";
import { FlashList } from "@shopify/flash-list";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import Text from "@/components/Text";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { useSearchCars } from "@/api/hooks/car-search";
import { CometChat } from "@cometchat/chat-sdk-react-native";

export default function SearchResults() {
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
  const { make, model, fromYear, toYear, odometer, transmission, fuelType } = useLocalSearchParams<{
    make: string;
    model: string;
    fromYear: string;
    toYear: string;
    odometer: string;
    transmission: string;
    fuelType: string;
  }>();

  const {
    isValidating,
    cars,
    isLoading,
    error: getError,
    refresh,
    fetchMore,
  } = useSearchCars(
    make,
    model,
    fromYear,
    toYear,
    undefined,
    undefined,
    odometer,
    transmission,
    fuelType,
    orderBy,
    orderDirection
  );
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const { createGroup, group, loading: isGroupLoading } = useCreateGroup();

  const [page, setPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (!isLoading && cars) {
      setWatchlistData(cars);
    }
  }, [cars]);

  useEffect(() => {
    if (group && !isGroupLoading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(swiper)/new-chat/[id]", params: { id: guid } });
    }
  }, [isGroupLoading, group]);

  const loadMore = () => {
    if (!isLoading && cars?.length > 0) {
      setPage(page + 1);
      fetchMore();
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const onSendToPhoneContacts = () => {
        router.push({ pathname: `/(tabs)/(swiper)/users-list?carId=${item?.carId}` });
      };

      const onMessagePress = () => {
        if (!user?.id || !item?.organisation?.ownerUserId) return;

        const GUID = String(`${user?.id}_${item?.carId}_${item?.organisation?.ownerUserId}`).slice(
          0,
          100
        );
        const chatName = String(`${item?.year} ${item?.model}`).toUpperCase();
        const icon = item?.images[0]?.url ?? undefined;
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
          members,
        };
        const tags = [owner, item?.organisation?.ownerUserId, item?.carId];

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
          {/* {item?.organisationId === user?.org?.id ? (
            <StockButtonContainer carId="" onPushToSwiperContacts={onSendToPhoneContacts} />
          ) : (
            <WatchlistButtonsContainer
              carId={item?.carId}
              onMessage={onMessagePress}
              phoneNumber={item?.organisation?.phoneNumber}
            />
          )} */}
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
        ListEmptyComponent={!isLoading ? ListEmpty : null}
      />
    </View>
  );
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
    paddingRight: 10,
    paddingVertical: 15,
  },
});
