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
} from "react-native";
import Text from "@/components/Text";
import { useGetOrgDetails } from "@/api/hooks/organisation";
import { useAssets } from "expo-asset";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

const profileBackground = require("@/assets/images/profile-background.png");

export default function UserProfile() {
  const insets = useSafeAreaInsets();
  const [assets] = useAssets([profileBackground]);
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

  return (
    <ImageBackground
      source={assets && assets.length > 1 ? assets[0] : profileBackground}
      resizeMode="cover"
      style={{ flex: 1, backgroundColor: Colors.background }}
      imageStyle={{ height: 400, width: "100%" }}
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
            user && (
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
                  <Text style={styles.nameText}>{user?.displayName}</Text>
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
                  </View>
                  <Text
                    style={{
                      marginTop: 15,
                      color: Colors.primary,
                      fontSize: 24,
                      lineHeight: 26,
                      fontFamily: "SF_Pro_Display_Bold",
                    }}
                  >
                    SHOWROOM
                  </Text>
                </View>
              </View>
            )
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
