import Colors from "@/constants/Colors";
import { useActionSheet } from "@expo/react-native-action-sheet";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";

import Text from "@/components/Text";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { useMakeList, useModelList } from "@/api/hooks/car-search";

const transmission = ["Automatic", "Manual"];

type FormData = {
  make: string;
  model: string;
  fromYear: string;
  toYear: string;
  fromPrice: string;
  toPrice: string;
  odometer: string;
  transmission: string;
  fuelType: string;
};

export default function SearchPage() {
  const { showActionSheetWithOptions } = useActionSheet();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({});
  const { makeList: makeData, loading: makeListLoading, error } = useMakeList();
  const { triggerFetch } = useModelList();

  const [makeList, setMakeList] = useState<{ make: string }[]>([]);

  useEffect(() => {
    if (makeData && !makeListLoading) {
      setMakeList(makeData);
    }
  }, [makeData, makeListLoading]);

  const onMakeListOpen = (options: string[]) => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          setValue("make", options[buttonIndex as number]);
          triggerFetch(options[buttonIndex as number]);
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "", headerBackTitle: "", headerBackTitleVisible: false }} />
      <Controller
        control={control}
        name="make"
        render={({ field: { value, name } }) => (
          <Pressable
            onPress={() =>
              onMakeListOpen([...(makeList ?? []).map((m: { make: string }) => m?.make), "Cancel"])
            }
            style={styles.selector}
          >
            {makeListLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : name}
              </Text>
            )}
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
      <Controller
        control={control}
        name="model"
        render={({ field: { value, name } }) => (
          <Pressable onPress={() => {}} style={styles.selector}>
            <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
              {value ? value : name}
            </Text>
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
      <View style={styles.wrapper}>
        <Controller
          control={control}
          name="fromYear"
          render={({ field: { value, name } }) => (
            <Pressable onPress={() => {}} style={styles.selector}>
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : "From Year"}
              </Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
        <Controller
          control={control}
          name="toYear"
          render={({ field: { value, name } }) => (
            <Pressable onPress={() => {}} style={styles.selector}>
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : "To Year"}
              </Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
      </View>
      <View style={styles.wrapper}>
        <Controller
          control={control}
          name="fromPrice"
          render={({ field: { value, name } }) => (
            <Pressable onPress={() => {}} style={styles.selector}>
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : "$ From"}
              </Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
        <Controller
          control={control}
          name="toPrice"
          render={({ field: { value, name } }) => (
            <Pressable onPress={() => {}} style={styles.selector}>
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : "$ To"}
              </Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
      </View>
      <Controller
        control={control}
        name="odometer"
        render={({ field: { value, name } }) => (
          <Pressable onPress={() => {}} style={styles.selector}>
            <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
              {value ? value : name}
            </Text>
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
      <Controller
        control={control}
        name="transmission"
        render={({ field: { value, name } }) => (
          <Pressable onPress={() => {}} style={styles.selector}>
            <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
              {value ? value : name}
            </Text>
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
      <Controller
        control={control}
        name="fuelType"
        render={({ field: { value } }) => (
          <Pressable onPress={() => {}} style={styles.selector}>
            <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
              {value ? value : "Fuel Type"}
            </Text>
            <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
    padding: 12,
    flex: 1,
    backgroundColor: Colors.background,
  },
  selector: {
    backgroundColor: Colors.lightGrayBackground,
    borderColor: Colors.borderGray,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    maxHeight: 55,
  },
  valueStyle: {
    fontFamily: "SF_Pro_Display_Regular",
    fontSize: 20,
    color: Colors.textDark,
    textTransform: "capitalize",
  },
  placeholder: {
    color: Colors.gray,
    opacity: 0.5,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
});
