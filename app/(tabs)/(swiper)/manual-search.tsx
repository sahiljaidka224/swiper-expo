import { useManualSearch } from "@/api/hooks/car-search";
import Avatar from "@/components/Avatar";
import CarOverview from "@/components/CarOverview";
import { SegmentedControl } from "@/components/SegmentedControl";
import Colors from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import Text from "@/components/Text";
import { router } from "expo-router";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useCreateGroup } from "@/hooks/cometchat/groups";
import FontAwesome5 from "@expo/vector-icons/build/FontAwesome5";
import EvilIcons from "@expo/vector-icons/build/EvilIcons";

const debounce = (func: (...args: any[]) => void, delay: number): ((...args: any[]) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: any[]) => {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

const options = ["Cars", "Dealerships"];
export default function ManualSearch() {
  const { token, user } = useAuth();
  const { triggerManualSearch, cars, organisations, isMutating } = useManualSearch();
  const { createGroup, group, loading: isGroupLoading } = useCreateGroup();

  const [mode, setMode] = useState<string>("Cars");
  const [carsData, setCarsData] = useState<any[]>([]);
  const [orgsData, setOrgsData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (group && !isGroupLoading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(followed)/new-chat/[id]", params: { id: guid } });
    }
  }, [isGroupLoading, group]);

  useEffect(() => {
    if (!isMutating && cars && cars.length > 0) {
      setCarsData(cars);
    }
  }, [cars]);

  useEffect(() => {
    if (!isMutating && organisations && organisations.length > 0) {
      setOrgsData(organisations);
    }
  }, [organisations]);

  const loadMore = () => {
    if (!isMutating && carsData?.length > 0) {
      setPage(page + 1);
      // fetchMore();
    }
  };

  const fetchSearchResults = async (searchTerm: string) => {
    if (!token) return;
    try {
      console.log("Fetching data...");
      triggerManualSearch({ token, searchTerm });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
    }
  };

  // const debouncedSearch = debounce(fetchSearchResults, 500);
  const debouncedSearch = useCallback(debounce(fetchSearchResults, 500), []);

  const handleSearch = (text: string) => {
    if (text.length === 0) {
      setCarsData([]);
      setOrgsData([]);
    }
    setSearchText(text);
    debouncedSearch(text); // Use the new value of text
  };

  const renderItemCars = useCallback(
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
          <CarOverview car={item} context={"swiper"} />
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
    [carsData]
  );

  const renderItemOrgs = useCallback(
    ({ item, index }: { item: any; index: number }) => {
      return (
        <Animated.View
          style={[styles.itemWrapper, { paddingHorizontal: 10 }]}
          entering={FadeInUp.delay(index * 10)}
          exiting={FadeOutUp}
        >
          <Pressable
            style={styles.userContainer}
            onPress={() => {
              router.push({
                pathname: `/(tabs)/user/[user]`,
                params: { id: item.ownerUserId, orgId: item.organisationId },
              });
            }}
          >
            <View style={styles.leftContainer}>
              <View style={styles.avatarContainer}>
                <Avatar userId={""} isCar />
              </View>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                {item.address && (
                  <View style={styles.addressContainer}>
                    <FontAwesome5 name="map-marker-alt" size={16} color={Colors.red} />
                    <Text style={styles.addressText}>{item?.address}</Text>
                  </View>
                )}
              </View>
            </View>
            <EvilIcons name="chevron-right" size={24} color={Colors.iconGray} />
          </Pressable>
        </Animated.View>
      );
    },
    [orgsData]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapperMain}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.container}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Cars or Dealerships..."
            value={searchText}
            onChangeText={handleSearch}
            clearButtonMode="while-editing"
            maxFontSizeMultiplier={1.3}
            autoFocus
          />
          <View style={{ alignItems: "center" }}>
            <SegmentedControl
              options={options}
              selectedOption={mode}
              onOptionPress={setMode}
              width={300}
            />
          </View>
        </View>

        {isMutating && <ActivityIndicator size="large" color={Colors.primary} />}

        {mode === "Cars" ? (
          <FlashList
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshing={isMutating && !carsData}
            keyExtractor={(item) => item.carId}
            scrollEnabled={true}
            data={carsData}
            estimatedItemSize={210}
            ItemSeparatorComponent={ItemSeperator}
            ListFooterComponent={() => (isMutating && carsData?.length > 0 ? <Footer /> : null)}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            renderItem={renderItemCars}
            ListEmptyComponent={null}
          />
        ) : null}
        {mode === "Dealerships" ? (
          <FlashList
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshing={isMutating && !orgsData}
            keyExtractor={(item) => item.organisationId}
            scrollEnabled={true}
            data={orgsData}
            estimatedItemSize={80}
            ItemSeparatorComponent={ItemSeperator}
            ListFooterComponent={() => (isMutating && orgsData?.length > 0 ? <Footer /> : null)}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            renderItem={renderItemOrgs}
            ListEmptyComponent={null}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
  searchInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderColor: Colors.borderGray,
    borderWidth: 2,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Regular",
  },
  wrapperMain: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    gap: 15,
    padding: 12,
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
    paddingVertical: 15,
  },
  leftContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    marginHorizontal: 5,
    justifyContent: "space-between",
  },
  name: {
    color: Colors.textDark,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
  addressContainer: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  addressText: {
    color: Colors.textLight,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Regular",
  },
});
