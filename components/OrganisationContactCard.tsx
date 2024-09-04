import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, View, Platform, Linking, Alert } from "react-native";
import Avatar from "./Avatar";
import Button from "./Button";
import { router, useSegments } from "expo-router";
import Text from "./Text";

interface OrganisationCardProps {
  name: string;
  address: {
    streetAddress: string | null;
    lat: string | null;
    lng: string | null;
  };
  orgId: string;
}

export default function OrganisationCard({ name, address, orgId }: OrganisationCardProps) {
  const segments = useSegments();
  const onShowStock = () => {
    router.navigate({ pathname: `/(tabs)/${segments[1]}/org/[listing]`, params: { orgId } });
  };

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

  return (
    <Pressable style={styles.contactCardContainer} onPress={() => {}}>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar userId="" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.contactName}>{name}</Text>
        </View>
      </View>
      <View style={styles.itemSeperator} />
      <View style={styles.itemButtonsContainer}>
        {address.lat && address.lng ? <Button title="Locate" onPress={onLocate} /> : null}
        <Button title="Show Stock" onPress={onShowStock} />
      </View>
    </Pressable>
  );
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
    backgroundColor: Colors.borderGray,
    height: 1,
    marginTop: 20,

    width: "100%",
  },
});
