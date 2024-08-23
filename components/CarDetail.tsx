import Colors from "@/constants/Colors";
import { formatNumberWithCommas } from "@/utils";
import React from "react";
import { StyleSheet, View } from "react-native";
import WatchlistButtonsContainer from "./WatchlistButtonsContainer";
import ContactCard from "./ContactCard";
import StockButtonContainer from "./StockButtonContainer";
import Text from "./Text";

interface CarDetailProps {
  car: any;
  context: CarsListContext;
}

function CarDetail({ car, context }: CarDetailProps) {
  console.log({ context });
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

      {context === "stock" ? (
        <StockButtonContainer carId="" onPushToSwiperContacts={() => {}} showSMSOption />
      ) : context === "followed" ? (
        <>
          <ContactCard
            name={car?.primaryContact?.displayName ?? ""}
            organisationName={car?.organisation?.name ?? ""}
            userId={car?.primaryContact?.userId ?? ""}
          />
          <WatchlistButtonsContainer
            onMessage={() => {}}
            phoneNumber={car?.primaryContact?.phoneNumber}
            carId={car?.carId}
          />
        </>
      ) : null}
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
