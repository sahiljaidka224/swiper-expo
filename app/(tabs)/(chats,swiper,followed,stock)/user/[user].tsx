import { useGetUserDetails } from "@/api/hooks/user";
import Avatar from "@/components/Avatar";
import WatchlistButtonsContainer from "@/components/WatchlistButtonsContainer";
import OrganisationCard from "@/components/OrganisationContactCard";
import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Text from "@/components/Text";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const { user, isLoading, error } = useGetUserDetails(id as string);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <View style={styles.userContainer}>
        {isLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : null}
        <View style={styles.avatarContainer}>
          <Avatar userId={id as string} />
        </View>
        <Text style={styles.nameText}>{user?.displayName}</Text>
        <WatchlistButtonsContainer
          carId=""
          phoneNumber={user?.phoneNumber}
          buttonsType="secondary"
          userId={id as string}
        />
      </View>
      {user?.organisations?.map((org: any) => {
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
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  avatarContainer: { width: 120, height: 120, borderRadius: 60 },
  nameText: {
    textAlign: "center",
    textTransform: "capitalize",
    color: Colors.textDark,
    fontSize: 24,
    fontFamily: "SF_Pro_Display_Bold",
  },
  userContainer: {
    gap: 10,
    height: "40%",
    backgroundColor: Colors.background,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
  },
});
