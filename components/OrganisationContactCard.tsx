import Colors from "@/constants/Colors";
import {
  Pressable,
  StyleSheet,
  View,
  Platform,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import Button from "./Button";
import { router } from "expo-router";
import Text from "./Text";
import { useGetOrgCars } from "@/api/hooks/watchlist";
import { useAuth } from "@/context/AuthContext";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { AnimatedFlashList } from "@shopify/flash-list";
import { useState, useEffect, useCallback } from "react";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import CarOverview from "./CarOverview";
import ErrorView from "./Error";
import StockButtonContainer from "./StockButtonContainer";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import React from "react";

const HEADER_HEIGHT = 200;
interface OrganisationCardProps {
  name: string;
  address: {
    streetAddress: string | null;
    lat: string | null;
    lng: string | null;
  };
  orgId: string;
  phoneNumber?: string | null;
}

export default function OrganisationCard({ name, address, phoneNumber }: OrganisationCardProps) {
  const onLocate = () => {
    const scheme = Platform.select({
      ios: `maps://0,0?q=${address.streetAddress}`,
      android: `geo:0,0?q=${address.streetAddress}`,
    });
    const latLng = `${address.lat},${address.lng}`;
    const label = "Custom Label";
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert("Error", "Unable to open maps");
    }
  };

  const onCallPress = async () => {
    if (!phoneNumber) return;
    try {
      await Linking.openURL(`tel:${phoneNumber}`);
    } catch (error) {
      console.warn(`Unable to initiate call ${error}`);
    }
  };

  return (
    <>
      <Pressable style={styles.contactCardContainer} onPress={() => {}}>
        <View style={styles.container}>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactName}>{name}</Text>
          </View>
        </View>
        <View style={styles.itemSeperator} />
        <View style={styles.itemButtonsContainer}>
          {address.lat && address.lng ? <Button title="Locate" onPress={onLocate} /> : null}
          {phoneNumber ? <Button title="Call" onPress={onCallPress} /> : null}
        </View>
      </Pressable>
    </>
  );
}

interface CarsListProps {
  context: CarsListContext;
  orderBy: string;
  orderDirection: string;
  orgId?: string;
  children?: React.ReactNode;
}

export function CarsListOrgs({
  context,
  orderBy = "dateCreate",
  orderDirection = "desc",
  orgId,
  children,
}: CarsListProps) {
  const {
    isValidating,
    cars,
    isLoading,
    error: getError,
    refresh,
    fetchMore,
  } = useGetOrgCars(context, orderBy, orderDirection, orgId);
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const { createGroup, error: errorGroup, group, loading: isGroupLoading } = useCreateGroup();

  const [page, setPage] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (!isLoading && cars && cars) {
      setWatchlistData(cars);
    }
  }, [cars]);

  useEffect(() => {
    if (group && !isGroupLoading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(followed)/new-chat/[id]", params: { id: guid } });
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
          <CarOverview car={item} context={context} showDetails={false}>
            {context === "followed" || context === "search" ? (
              <WatchlistButtonsContainer
                carId={item?.carId}
                onMessage={onMessagePress}
                phoneNumber={item?.organisation?.phoneNumber}
                orgId={item?.organisationId}
                icons
              />
            ) : null}
          </CarOverview>
          {context !== "followed" && context !== "search" && (
            <StockButtonContainer carId="" onPushToSwiperContacts={onSendToPhoneContacts} />
          )}
        </Animated.View>
      );
    },
    [watchListData]
  );

  return (
    <View style={{ flex: 1, zIndex: 10 }}>
      {isLoading && (!cars || cars?.length === 0) && (
        <ActivityIndicator size="large" color={Colors.primary} />
      )}
      {getError && !isLoading && !cars ? <ErrorView /> : null}
      <AnimatedFlashList
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshing={(isLoading || isValidating) && !cars}
        onRefresh={refresh}
        keyExtractor={(item) => item.carId}
        scrollEnabled={true}
        data={watchListData}
        estimatedItemSize={329}
        ItemSeparatorComponent={ItemSeperator}
        ListFooterComponent={() => (isLoading && cars?.length > 0 ? <Footer /> : null)}
        onEndReached={context === "stock" || context === "search" ? loadMore : null}
        onEndReachedThreshold={0.5}
        renderItem={renderItem}
        ListEmptyComponent={!isLoading ? ListEmpty : null}
        ListHeaderComponent={() => children}
      />
    </View>
  );
}

function ListEmpty() {
  return (
    <View
      style={{
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  itemButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 5,
    alignItems: "center",
    gap: 10,
  },
  avatarContainer: { width: 50, height: 50, borderRadius: 25 },
  contactCardContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 8,
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
  contactName: {
    fontFamily: "SF_Pro_Display_Medium",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
    flexWrap: "wrap",
    textAlign: "left",
  },
  itemSeperator: {
    backgroundColor: "#DBDEE1",
    height: 1,
    width: "100%",
  },

  itemSeperatorContainer: {
    paddingHorizontal: 10,
  },

  itemWrapper: {
    marginTop: 20,
    backgroundColor: "transparent",
  },
  carListContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
