import { useGetWatchlist, useRemoveCarFromWatchlist } from "@/api/hooks/watchlist";
import Button from "@/components/Button";
import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";
import Animated, { CurvedTransition, FadeInUp, FadeOutUp } from "react-native-reanimated";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Linking from "expo-linking";

const placeholderImage = require("@/assets/images/no-image.png");

const transition = CurvedTransition.delay(100);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function WatchlistPage() {
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

  const onDelete = (item: any) => {
    setWatchlistData(watchListData.filter((i) => i.carId !== item.carId));
    try {
      trigger(
        { carId: item.carId },
        {
          revalidate: true,
        }
      );
    } catch (error) {
      // Revert state if there's an error
      setWatchlistData(cars);
      console.error("Failed to remove car from watchlist:", error);
    }
  };

  const loadMore = () => {
    if (!isLoading && cars?.length > 0) {
      setPage(page + 1);
      fetchMore(page + 1);
    }
  };

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    return (
      <Animated.View
        style={styles.itemWrapper}
        entering={FadeInUp.delay(index * 10)}
        exiting={FadeOutUp}
      >
        <AnimatedPressable
          style={styles.itemContainer}
          onPress={() =>
            router.push({ pathname: `/(tabs)/watchlist/[id]`, params: { id: item.carId } })
          }
        >
          <Image
            defaultSource={placeholderImage}
            source={{ uri: item.images[0]?.url }}
            style={styles.itemCarImage}
          />
          <View style={styles.detailsContainer}>
            <Text style={styles.itemCarTitle}>{`${item.year} ${item.make} ${item.model}`}</Text>
            {item.transmission ? <DetailsText text={`• ${item.transmission}`} /> : null}
            {item.body ? <DetailsText text={`• ${item.body}`} /> : null}
            {item.odometer ? (
              <DetailsText text={`• ${formatNumberWithCommas(Number(item.odometer))} km`} />
            ) : null}
            {item.capacity && item.fuelType ? (
              <DetailsText text={`• ${item.capacity} ${item.fuelType}`} />
            ) : null}
            <Text style={styles.itemPriceText}>{`${
              item.price && item.price > 0 ? `$${formatNumberWithCommas(item.price)}` : "Enquire"
            }`}</Text>
          </View>
        </AnimatedPressable>
        <View style={styles.itemButtonsContainer}>
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.iconContainer}>
            <Ionicons name="trash-outline" color={Colors.iconGray} size={24} />
          </TouchableOpacity>
          {/* // TODO: after comet chat is integrated completely */}
          <Button title="Message" onPress={() => {}} />
          <Button
            title="Call"
            onPress={async () => {
              if (!item?.organisation?.phoneNumber) return;
              try {
                await Linking.openURL(`tel:${item?.organisation?.phoneNumber}`);
              } catch (error) {
                console.warn(`Unable to initiate call ${error}`);
              }
            }}
          />
        </View>
      </Animated.View>
    );
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={() => {}}>
              <MaterialIcons name="sort" size={24} color={Colors.iconGray} />
            </Pressable>
          ),
        }}
      />
      {/* <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      > */}
      <Animated.View layout={transition}>
        {isMutating && (
          <ActivityIndicator style={{ backgroundColor: Colors.primary }} size="large" />
        )}

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
          ItemSeparatorComponent={() => (
            <View style={styles.itemSeperatorContainer}>
              <View style={styles.itemSeperator} />
            </View>
          )}
          // ListFooterComponent={() =>
          //   isLoading && cars?.length > 0 ? (
          //     <ActivityIndicator size="large" color={Colors.primary} />
          //   ) : null
          // }
          // onEndReached={() => {
          //   console.log("loadmnoreee");
          //   loadMore();
          // }}
          // onEndReachedThreshold={0.5}
          renderItem={renderItem}
        />
      </Animated.View>
      {/* </ScrollView> */}
    </View>
  );
}

function DetailsText({ text }: { text: string }) {
  return <Text style={styles.detailText}>{text}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  itemWrapper: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
  },
  itemContainer: {
    flexDirection: "row",
    gap: 10,
    minHeight: 150,
  },
  itemSeperatorContainer: {
    paddingHorizontal: 10,
  },
  itemSeperator: {
    borderBottomColor: Colors.borderGray,
    borderBottomWidth: 1,
    paddingHorizontal: "10%",
  },
  itemCarImage: {
    minWidth: 130,
    width: "40%",
    height: 130,
    borderRadius: 8,
    objectFit: "cover",
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  itemCarTitle: {
    fontSize: 20,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Bold",
    lineHeight: 22,
    color: Colors.textDark,
  },
  itemPriceText: {
    fontSize: 18,
    color: Colors.primary,
    marginTop: 10,
    fontWeight: "600",
    fontFamily: "SF_Pro_Display_Bold",
  },
  itemButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 5,
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    borderRadius: 25,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.lightGrayBackground,
    paddingHorizontal: 16,
  },
  detailsContainer: { flex: 1, gap: 2, marginLeft: 5 },
  detailText: {
    fontSize: 16,
    textTransform: "capitalize",
    fontFamily: "SF_Pro_Display_Light",
    lineHeight: 22,
    color: Colors.textDark,
  },
});
