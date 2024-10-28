import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Colors from "@/constants/Colors";
import { useActionSheet } from "@expo/react-native-action-sheet";
import Button from "./Button";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { useCarDetailsFromNedVis } from "@/api/hooks/car-detail";
import { useEffect, useRef } from "react";
import Text from "./Text";

const states = ["ACT", "NSW", "NT", "QLD", "SA", "VIC", "WA", "TAS"];
const transmission = ["Automatic", "Manual"];

type FormData = {
  rego: string;
  state: string;
  odometer: string;
  transmission: string;
};

export default function RegoForm({ setCarDetails }: { setCarDetails: (details: any) => void }) {
  const odometerRef = useRef<TextInput | null>(null);
  const { showActionSheetWithOptions } = useActionSheet();
  const { carData, error, fetchCarDetails, loading } = useCarDetailsFromNedVis();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: {
      rego: "",
      state: "State",
      transmission: transmission[0],
    },
  });

  const rego = watch("rego");
  const state = watch("state");

  useEffect(() => {
    if (carData && !loading && carData.length > 0) {
      setCarDetails({
        ...carData[0],
        odometer: getValues("odometer"),
        transmission: getValues("transmission"),
        regoState: getValues("state"),
      });
    }
  }, [carData]);

  const onSubmit = ({ rego, state }: FormData) => {
    if (rego !== "" && state !== "State") {
      fetchCarDetails(rego, state);
    }
  };

  const openActionSheet = (options: string[], fieldName: "state" | "transmission") => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          setValue(fieldName, options[buttonIndex as number]);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.regoWrapper}>
        <Controller
          control={control}
          name="state"
          defaultValue="State"
          render={({ field: { value } }) => (
            <Pressable
              onPress={() => openActionSheet([...states, "Cancel"], "state")}
              style={styles.regoSelector}
            >
              <Text style={styles.regoText}>{value ? value : "Open Action Sheet"}</Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Car Registration"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[styles.textInput, { flex: 1 }]}
              autoCapitalize="characters"
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              maxLength={10}
              returnKeyType="next"
              returnKeyLabel="next"
              onSubmitEditing={() => odometerRef.current?.focus()}
            />
          )}
          name="rego"
        />
      </View>
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={odometerRef}
            placeholder="Odometer"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value ? value : ""}
            style={styles.textInput}
            maxFontSizeMultiplier={1.3}
            keyboardType="number-pad"
          />
        )}
        name="odometer"
      />
      <Controller
        control={control}
        name="transmission"
        render={({ field: { value } }) => (
          <Pressable
            onPress={() => openActionSheet([...transmission, "Cancel"], "transmission")}
            style={styles.regoSelector}
          >
            <Text style={styles.regoText}>{value ? value : "Open Action Sheet"}</Text>
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
      <Button
        title="Get Car Details"
        onPress={handleSubmit(onSubmit)}
        type={rego && state !== "State" ? "primary" : "disabled"}
        isLoading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    marginBottom: 12,
  },
  textInput: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
  },
  regoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  regoSelector: {
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
  },
  regoText: {
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
  },
});
