import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import ContactCard from "./ContactCard";
import StockButtonContainer from "./StockButtonContainer";
import Text from "./Text";
import { router } from "expo-router";
import { CometChat } from "@cometchat/chat-sdk-react-native";
import { useAuth } from "@/context/AuthContext";
import { useCreateGroup } from "@/hooks/cometchat/groups";

interface CarDetailProps {
  car: any;
  context: CarsListContext;
}

function CarDetail({ car, context }: CarDetailProps) {
  const { user } = useAuth();
  const { createGroup, loading, group, error } = useCreateGroup();

  useEffect(() => {
    if (group && !loading) {
      const guid = group.getGuid();
      router.push({ pathname: "/(tabs)/(followed)/new-chat/[id]", params: { id: guid } });
    }
  }, [loading, group]);

  const onSendToPhoneContacts = () => {
    router.push({ pathname: `/(tabs)/(stock)/users-list?carId=${car?.carId}` });
  };

  const onMessagePress = () => {
    if (!user?.id || !car?.organisation?.ownerUserId) return;

    const GUID = String(`${user?.id}_${car?.carId}_${car?.organisation?.ownerUserId}`).slice(
      0,
      100
    );
    const chatName = String(`${car?.year} ${car?.make} ${car?.model}`).toUpperCase();
    const icon = car?.images[0]?.url ?? "https://picsum.photos/200";
    const owner = user?.id;
    const members = [owner, car?.organisation?.ownerUserId];
    const metadata = {
      carId: car?.carId,
      make: car?.make,
      model: car?.model,
      year: car?.year,
      price: car?.price,
      odometer: car?.odometer,
      icon,
    };

    const tags = [owner, car?.organisation?.ownerUserId];

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
    <View style={styles.detailsContainer}>
      <Text style={styles.title}>{`${car?.year} ${car?.make} ${car?.model}`}</Text>
      <DescriptionView
        title="Mileage"
        value={car?.odometer ? `${formatNumberWithCommas(car?.odometer)} km` : ""}
        uppercase
      />
      <DescriptionView title="Transmission" value={car?.transmission} />
      <DescriptionView title="Registration" value={car?.rego} uppercase />
      <DescriptionView title="Registration Expiry" value={car?.regoExpiry} uppercase />
      <DescriptionView title="Registration State" value={car?.regoState} uppercase />
      <DescriptionView title="Year of manufacture" value={car?.year} />
      <DescriptionView title="Compliance Date" value={car?.compliance} />
      <DescriptionView title="Colour" value={car?.colour} />
      <DescriptionView title="Body Style" value={car?.body} />
      <DescriptionView title="Capacity" value={car?.capacity} />
      <DescriptionView title="Fuel" value={car?.fuelType} />
      <DescriptionView title="Series" value={car?.series} />
      <DescriptionView title="VIN" value={car?.vin} uppercase />
      <DescriptionView title="Engine Number" value={car?.engineNo} uppercase />

      {context.includes("stock") || (car?.organisationId === user?.org?.id) ? (
        <StockButtonContainer
          carId=""
          onPushToSwiperContacts={onSendToPhoneContacts}
          showSMSOption
        />
      ) : (
        <>
          <ContactCard
            name={car?.primaryContact?.displayName ?? ""}
            organisationName={car?.organisation?.name ?? ""}
            userId={car?.primaryContact?.userId ?? ""}
          />
          <WatchlistButtonsContainer
            onMessage={onMessagePress}
            phoneNumber={car?.primaryContact?.phoneNumber}
            carId={car?.carId}
            isPrimaryButtonLoading={loading}
          />
        </>
      )}
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
  if (!value) return null;
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

export default React.memo(CarDetail);

const styles = StyleSheet.create({
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
    gap: 10,
  },
  descriptionTitle: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 18,
    color: Colors.gray,
    lineHeight: 22,
    textAlign: "left",
  },
  descriptionValue: {
    fontFamily: "SF_Pro_Display_Light",
    fontSize: 18,
    color: Colors.textDark,
    lineHeight: 22,
    flexWrap: "wrap",
    textAlign: "right",
    overflow: "hidden",
    maxWidth: 250,
  },
});
