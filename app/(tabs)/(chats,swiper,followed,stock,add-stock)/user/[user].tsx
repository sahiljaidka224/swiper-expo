import { useGetUserDetails } from "@/api/hooks/user";
import Avatar from "@/components/Avatar";
import WatchlistButtonsContainer from "@/components/WatchlistButtonsContainer";
import { CarsListOrgs } from "@/components/OrganisationContactCard";
import Colors from "@/constants/Colors";
import { router, Stack, useLocalSearchParams, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View, ImageBackground } from "react-native";
import Text from "@/components/Text";
import { useGetOrgDetails } from "@/api/hooks/organisation";

const placeHolder = require("@/assets/images/splash.png");

export default function UserProfile() {
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "" }} />
      {isLoading || isOrgLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : null}

      {/* {(organisations ?? []).map((org: any) => {
        return (
          <OrganisationCard
            key={org?.organisationId}
            orgId={org.organisationId}
            address={{
              streetAddress: org?.address ?? null,
              lat: org?.latitude ?? null,
              lng: org?.longitude ?? null,
            }}
            name={org?.name}
            phoneNumber={org?.phoneNumber}
          />
        );
      })} */}
      {organisations && organisations.length > 0 ? (
        <CarsListOrgs
          context="search"
          orgId={organisations[0]?.organisationId}
          orderBy="dateCreate"
          orderDirection="desc"
          children={
            user && (
              <ImageBackground
                resizeMode="cover"
                source={placeHolder}
                style={{ flex: 1, justifyContent: "center", opacity: 0.9, zIndex: 0 }}
              >
                <View style={styles.userContainer}>
                  <View style={styles.avatarContainer}>
                    <Avatar userId={id as string} showOnlineIndicator />
                  </View>
                  <View>
                    <Text style={styles.nameText}>{user?.displayName}</Text>

                    <Text
                      style={[
                        styles.nameText,
                        {
                          fontSize: 20,
                          fontFamily: "SF_Pro_Display_Medium",
                        },
                      ]}
                    >
                      {organisations[0]?.name}
                    </Text>

                    <WatchlistButtonsContainer
                      carId=""
                      phoneNumber={user?.phoneNumber}
                      buttonsType="secondary"
                      onMessage={onMessagePress}
                      circularIcons
                    />
                  </View>
                </View>
              </ImageBackground>
            )
          }
        />
      ) : user ? (
        <View style={styles.oldUserContainer}>
          <View style={styles.avatarContainer}>
            <Avatar userId={id as string} showOnlineIndicator />
          </View>
          <Text style={styles.nameText}>{user?.displayName}</Text>
          <WatchlistButtonsContainer
            carId=""
            phoneNumber={user?.phoneNumber}
            buttonsType="secondary"
            onMessage={onMessagePress}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  avatarContainer: { width: 80, height: 80, borderRadius: 60 },
  nameText: {
    textAlign: "left",
    textTransform: "capitalize",
    color: Colors.background,
    fontSize: 24,
    fontFamily: "SF_Pro_Display_Bold",
  },
  userContainer: {
    gap: 10,
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
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
