import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  Image,
  Text,
  Pressable,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useGetCarDetails } from "@/api/hooks/car-detail";
import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import Button from "@/components/Button";

export default function WatchlistCarDetailPage() {
  const { id } = useLocalSearchParams();
  const { car, isLoading, error } = useGetCarDetails(id as string);

  return (
    <View style={styles.container}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {isLoading && <ActivityIndicator color={Colors.primary} size="large" />}
        {car && (
          <>
            <Image source={{ uri: car?.images[0]?.url }} style={styles.itemCarImage} />
            <View style={styles.detailsContainer}>
              <Text style={styles.title}>{`${car?.year} ${car?.make} ${car?.model}`}</Text>
              {car?.odometer && (
                <DescriptionView
                  title="Mileage"
                  value={`${formatNumberWithCommas(car?.odometer)} km`}
                  uppercase
                />
              )}
              {car?.transmission && (
                <DescriptionView title="Transmission" value={car?.transmission} />
              )}
              {car?.rego && <DescriptionView title="Registration" value={car?.rego} uppercase />}
              {car?.regoExpiry && (
                <DescriptionView title="Registration Expiry" value={car?.regoExpiry} uppercase />
              )}
              {car?.regoState && (
                <DescriptionView title="Registration State" value={car?.regoState} />
              )}
              {car?.year && <DescriptionView title="Year of manufacture" value={car?.year} />}
              {car?.compliance && (
                <DescriptionView title="Compliance Date" value={car?.compliance} />
              )}
              {car?.colour && <DescriptionView title="Colour" value={car?.colour} />}
              {car?.body && <DescriptionView title="Body Style" value={car?.body} />}
              {car?.capacity && <DescriptionView title="Capacity" value={car?.capacity} />}
              {car?.fuelType && <DescriptionView title="Fuel" value={car?.fuelType} />}
              {car?.series && <DescriptionView title="Series" value={car?.series} uppercase />}
              {car?.vin && <DescriptionView title="VIN" value={car?.vin} uppercase />}
              {car?.engineNo && (
                <DescriptionView title="Engine Number" value={car?.engineNo} uppercase />
              )}
              <ContactCard
                name={car?.primaryContact?.displayName ?? ""}
                organisationName={car?.organisation?.name ?? ""}
                userId={car?.primaryContact?.userId ?? ""}
              />
              <View style={styles.buttonContainer}>
                <Button title="Message" onPress={() => {}} />
                <Button title="Call" onPress={() => {}} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function DescriptionView({
  title,
  value,
  uppercase = false,
}: {
  title: string;
  value: string;
  uppercase?: boolean;
}) {
  return (
    <View style={styles.descriptionContainer}>
      <Text style={styles.descriptionTitle}>{title}:</Text>
      <Text
        style={[styles.descriptionValue, { textTransform: uppercase ? "uppercase" : "capitalize" }]}
      >
        {value}
      </Text>
    </View>
  );
}

function ContactCard({
  userId,
  name,
  organisationName,
}: {
  userId: string;
  name: string;
  organisationName: string;
}) {
  return (
    <Pressable style={styles.contactCardContainer}>
      <Avatar userId={userId} />
      <View style={{ flex: 1 }}>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.organisationName}>{organisationName}</Text>
      </View>
    </Pressable>
  );
}

function Avatar({ userId }: { userId: string }) {
  return (
    <View>
      <Image
        style={styles.avatarImage}
        source={{ uri: `https://swiperstorageaccount.blob.core.windows.net/avatars/${userId}.png` }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  itemCarImage: {
    width: "100%",
    height: 280,
    objectFit: "cover",
  },
  detailsContainer: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontFamily: "SF_Pro_Display_Bold",
    fontSize: 24,
    textTransform: "capitalize",
    color: Colors.textDark,
    marginBottom: 10,
  },
  descriptionContainer: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  descriptionTitle: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 18,
    color: Colors.gray,
    lineHeight: 22,
  },
  descriptionValue: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 22,
  },
  contactCardContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginVertical: 20,
    marginHorizontal: 10,
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
    lineHeight: 22,
    textTransform: "capitalize",
  },
  organisationName: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 22,
    flexWrap: "wrap",
    textAlign: "justify",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
});
