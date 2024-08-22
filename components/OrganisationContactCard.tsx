import Colors from "@/constants/Colors";
import { Pressable, StyleSheet, View, Text } from "react-native";
import Avatar from "./Avatar";
import Button from "./Button";
import { router, useSegments } from "expo-router";

interface OrganisationCardProps {
  name: string;
  address: {
    lat: string;
    lng: string;
  };
  orgId: string;
}

export default function OrganisationCard({ name, address, orgId }: OrganisationCardProps) {
  const segments = useSegments();
  console.log({ segments });

  const onShowStock = () => {
    router.push({ pathname: "/(tabs)/(followed)/org/[listing]", params: { orgId } });
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
        <Button title="Locate" onPress={() => {}} />
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
