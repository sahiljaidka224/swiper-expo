import { useGetUserDetails } from "@/api/hooks/user";
import Avatar from "@/components/Avatar";
import WatchlistButtonsContainer from "@/components/WatchlistButtonsContainer";
import { CarsListOrgs } from "@/components/OrganisationContactCard";
import Colors from "@/constants/Colors";
import { router, Stack, useLocalSearchParams, useSegments } from "expo-router";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  ImageBackground,
  TouchableOpacity,
  Platform,
  Linking,
} from "react-native";
import Text from "@/components/Text";
import { useGetOrgDetails } from "@/api/hooks/organisation";
import { useAssets } from "expo-asset";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";
import Animated, { useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import Button from "@/components/Button";
import { showToast } from "@/components/Toast";

const profilebackground = require("@/assets/images/profilebackground.png");
// const AnimatedText = Animated.createAnimatedComponent(Text);

export default function UserProfile() {
  const opacity = useSharedValue(0.5);
  opacity.value = withRepeat(withTiming(1, { duration: 1500 }), 5);
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([profilebackground]);
  const { id, orgId } = useLocalSearchParams();
  const { user, isLoading, error } = useGetUserDetails(id as string);
  const { org, isLoading: isOrgLoading, error: orgError } = useGetOrgDetails(orgId as string);
  const segments = useSegments();

  const onMessagePress = () => {
    const userId = id as string;
    if (userId && userId.trimEnd() !== "") {
      router.navigate(`/(tabs)/${segments[1]}/${userId}`);
    }
  };

  const organisations = user?.organisations ? user?.organisations : org ? [org] : [];

  const address = organisations[0]
    ? {
        streetAddress: organisations[0]?.address,
        lat: organisations[0]?.latitude,
        lng: organisations[0]?.longitude,
      }
    : null;

  const onLocate = () => {
    if (!address) return;
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
      showToast("Error", "Unable to open maps", "error");
    }
  };
  return (
    <ImageBackground
      source={assets && assets.length > 1 ? assets[0] : profilebackground}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: Colors.background }}
      imageStyle={{ height: 450, width: "100%" }}
    >
      <Stack.Screen options={{ headerTitle: "", headerShown: false }} />
      {isLoading || isOrgLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : null}

      {organisations && organisations.length > 0 ? (
        <CarsListOrgs
          context="search"
          orgId={organisations[0]?.organisationId}
          orderBy="dateCreate"
          orderDirection="desc"
          children={
            <View style={styles.userContainer}>
              <View style={styles.avatarContainer}>
                <Avatar userId={id as string} showOnlineIndicator showOutline />
              </View>
              <View
                style={{
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {user && <Text style={styles.nameText}>{user?.displayName}</Text>}
                <Text
                  style={[
                    styles.nameText,
                    {
                      fontSize: 20,
                      lineHeight: 24,
                      fontFamily: "SF_Pro_Display_Medium",
                    },
                  ]}
                >
                  {organisations[0]?.name}
                </Text>
                <View style={{ maxWidth: "55%" }}>
                  <WatchlistButtonsContainer
                    carId=""
                    phoneNumber={user?.phoneNumber}
                    buttonsType="secondary"
                    onMessage={onMessagePress}
                    circularIcons
                    size="max"
                  />
                  {address && address.lat && address.lng ? (
                    <View style={{ height: 50, marginTop: 10 }}>
                      <Button title="Locate" onPress={onLocate} type="border" />
                    </View>
                  ) : null}
                </View>
                <Animated.Text
                  maxFontSizeMultiplier={1.3}
                  style={{
                    marginTop: 15,
                    color: Colors.primary,
                    fontSize: 24,
                    lineHeight: 26,
                    fontFamily: "SF_Pro_Display_Bold",
                    opacity: opacity,
                    transform: [{ scale: opacity }],
                  }}
                >
                  SHOWROOM
                </Animated.Text>
              </View>
            </View>
          }
        />
      ) : user ? (
        <View style={[styles.userContainer, { marginTop: insets.top }]}>
          <View style={styles.avatarContainer}>
            <Avatar userId={id as string} showOnlineIndicator showOutline />
          </View>
          <View
            style={{
              alignItems: "center",
              gap: 3,
            }}
          >
            <Text style={styles.nameText}>{user?.displayName}</Text>
            <View style={{ maxWidth: "55%" }}>
              <WatchlistButtonsContainer
                carId=""
                phoneNumber={user?.phoneNumber}
                buttonsType="secondary"
                onMessage={onMessagePress}
                circularIcons
                size="max"
              />
              {address && (
                <View style={{}}>
                  {address.lat && address.lng ? <Button title="Locate" onPress={() => {}} /> : null}
                </View>
              )}
            </View>
          </View>
        </View>
      ) : null}
      <TouchableOpacity
        onPress={() => {
          if (router.canGoBack()) router.back();
        }}
        style={{
          marginTop: insets.top,
          paddingHorizontal: 16,
          paddingVertical: 5,
          position: "absolute",
          zIndex: 10,
        }}
      >
        <Ionicons name="chevron-back" size={28} color={Colors.background} />
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  avatarContainer: { width: 110, height: 110, borderRadius: 55 },
  nameText: {
    textAlign: "left",
    textTransform: "capitalize",
    color: Colors.primary,
    fontSize: 24,
    lineHeight: 28,
    fontFamily: "SF_Pro_Display_Bold",
    letterSpacing: 0.5,
  },
  userContainer: {
    gap: 10,
    backgroundColor: "transparent",
    flexDirection: "column",
    alignItems: "center",
    paddingVertical: 10,
    flex: 1,
    marginTop: 20,
  },
  oldUserContainer: {
    gap: 10,
    height: "40%",
    backgroundColor: Colors.background,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    shadowColor: "black",
    shadowOffset: { width: 0.3 * 4, height: 0.5 * 4 },
    shadowOpacity: 0.2,
    shadowRadius: 0.7 * 4,
  },
});
