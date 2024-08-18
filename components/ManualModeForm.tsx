import { Text, View, TextInput, StyleSheet, Pressable } from "react-native";
import { useForm, Controller } from "react-hook-form";
import Colors from "@/constants/Colors";
import { useActionSheet } from "@expo/react-native-action-sheet";
import Button from "./Button";
import AntDesign from "@expo/vector-icons/build/AntDesign";

const make = ["ACT", "NSW", "NT", "QLD", "WA", "TAS", "SA", "VIC"];
const transmission = ["Automatic", "Manual"];

type FormData = {
  make: string;
  model: string;
  year: string;
  odometer: string;
  transmission: string;
};

export default function ManualModeForm() {
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      make: "Make",
      model: "",
      odometer: "",
      transmission: transmission[0],
    },
  });
  const onSubmit = (data: any) => console.log(data);

  const openActionSheet = (options: string[], fieldName: "make" | "transmission") => {
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
          name="make"
          defaultValue="Make"
          render={({ field: { value } }) => (
            <Pressable
              onPress={() => openActionSheet([...make, "Cancel"], "make")}
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
              placeholder="Model"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              style={[styles.textInput, { flex: 1 }]}
            />
          )}
          name="model"
        />
      </View>

      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Odometer"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.textInput}
          />
        )}
        name="odometer"
      />
      <Controller
        control={control}
        rules={{
          maxLength: 100,
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            placeholder="Year"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            style={styles.textInput}
            keyboardType="number-pad"
          />
        )}
        name="year"
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
      <Button title="Next" onPress={handleSubmit(onSubmit)} />
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
