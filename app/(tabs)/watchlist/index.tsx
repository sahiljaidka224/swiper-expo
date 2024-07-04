import { useGetWatchlist, useRemoveCarFromWatchlist } from "@/api/hooks/watchlist";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { formatNumberWithCommas } from "@/utils";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Animated, {
  CurvedTransition,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const transition = CurvedTransition.delay(100);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLink = Animated.createAnimatedComponent(Link);

export default function WatchlistPage() {
  const { cars, isLoading, error: getError } = useGetWatchlist();
  const { trigger, isMutating, error: mutationError, newCars } = useRemoveCarFromWatchlist();
  const [watchListData, setWatchlistData] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const editing = useSharedValue(-30);

  console.log({ newCars, isMutating, isLoading });

  useEffect(() => {
    if (!isLoading && cars) {
      console.log("cars");
      setWatchlistData(cars);
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

  const onEdit = () => {
    let editingNew = !isEditing;
    editing.value = editingNew ? 0 : -30;
    setIsEditing(editingNew);
  };

  const animatedRowStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(editing.value) }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={onEdit}>
              <Text style={{ color: Colors.primary, fontSize: 18 }}>
                {isEditing ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      /> */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {(isLoading || isMutating) && <ActivityIndicator color={Colors.primary} size="large" />}
        <Animated.View layout={transition}>
          <Animated.FlatList
            refreshing={isLoading}
            skipEnteringExitingAnimations
            keyExtractor={(item) => item.carId}
            scrollEnabled={false}
            data={watchListData}
            itemLayoutAnimation={transition}
            renderItem={({ item, index }) => (
              <Animated.View
                style={defaultStyles.block}
                entering={FadeInUp.delay(index * 10)}
                exiting={FadeOutUp}
              >
                <Animated.View style={[defaultStyles.item]}>
                  {/* <AnimatedTouchableOpacity
                    onPress={() => onDelete(item)}
                    style={[animatedRowStyles]}
                  >
                    <Ionicons name="remove-circle" size={24} color={Colors.red} />
                  </AnimatedTouchableOpacity> */}
                  <Image
                    source={{ uri: item.images[0].url }}
                    style={{
                      width: 125,
                      height: "75%",
                      borderRadius: 10,
                      objectFit: "cover",
                      borderWidth: 1,
                      borderColor: Colors.lightGray,
                    }}
                  />
                  <View style={{ flex: 1, gap: 3, marginLeft: 5 }}>
                    <Text
                      style={{ fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}
                    >{`${item.year} ${item.make} ${item.model}`}</Text>
                    <DetailsText text={`· ${item.transmission}`} />
                    <DetailsText text={`· ${item.body}`} />
                    <DetailsText
                      text={`· ${
                        item.odometer && item.odometer > 0
                          ? formatNumberWithCommas(Number(item.odometer))
                          : "-"
                      } KMs`}
                    />
                    <DetailsText text={`· ${item.capacity} ${item.fuelType}`} />
                    <Text
                      style={{
                        fontSize: 18,
                        color: Colors.primary,
                        marginTop: 10,
                        fontWeight: "600",
                      }}
                    >{`${
                      item.price && item.price > 0
                        ? `$${formatNumberWithCommas(item.price)}`
                        : "Enquire"
                    }`}</Text>
                  </View>
                  {/* <Ionicons name="chevron-forward" size={20} color={Colors.primary} /> */}
                </Animated.View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <TouchableOpacity onPress={() => onDelete(item)}>
                    <Ionicons name="trash-outline" color={Colors.primary} size={26} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="call-outline" color={Colors.primary} size={26} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="send-outline" color={Colors.primary} size={26} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function DetailsText({ text }: { text: string }) {
  return <Text style={{ fontSize: 12, textTransform: "capitalize" }}>{text}</Text>;
}
