import { useGetUserDetails } from "@/api/hooks/user";
import Avatar from "@/components/Avatar";
import ButtonsContainer from "@/components/ButtonsContainer";
import OrganisationCard from "@/components/OrganisationContactCard";
import Colors from "@/constants/Colors";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function UserProfile() {
  const { userId } = useLocalSearchParams();
  const { user, isLoading, error } = useGetUserDetails(userId as string);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <View style={styles.userContainer}>
        {isLoading ? <ActivityIndicator size="large" color={Colors.primary} /> : null}
        <View style={styles.avatarContainer}>
          <Avatar userId={userId as string} />
        </View>
        <Text style={styles.nameText}>{user?.displayName}</Text>
        <ButtonsContainer
          onMessage={() => {}}
          carId=""
          phoneNumber={user?.phoneNumber}
          buttonsType="secondary"
        />
      </View>
      {user?.organisations?.map((org: any) => {
        console.log({ org });
        return (
          <OrganisationCard
            key={org?.organisationId}
            orgId={org.organisationId}
            address={{ lat: org?.latitude ?? 0, lng: org?.longitude ?? 0 }}
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
  organisationContainer: {},
});
