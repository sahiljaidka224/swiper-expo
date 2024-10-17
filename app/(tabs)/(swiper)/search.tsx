import Colors from "@/constants/Colors";
import { useActionSheet } from "@expo/react-native-action-sheet";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import Text from "@/components/Text";
import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import {
  useCarYear,
  useMakeList,
  useManualSearch,
  useModelList,
  useSearchCarsCount,
} from "@/api/hooks/car-search";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { ScrollView } from "react-native-gesture-handler";

const priceList = [
  "5000",
  "10000",
  "15000",
  "20000",
  "30000",
  "50000",
  "75000",
  "100000",
  "150000",
  "200000",
];
const odometerList = ["5000", "10000", "20000", "50000", "100000", "150000", "99999999"];
const transmissionList = ["Automatic", "Manual"];
const fuelTypeList = ["Petrol", "LPG", "Diesel"];

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
  const { token } = useAuth();
  const {
    control,
    formState: { errors },
    getValues,
    setValue,
  } = useForm<FormData>({});
  const { makeList: makeData, loading: makeListLoading, error } = useMakeList();
  const { triggerModelFetch, modelsData, isMutating: isModelsLoading } = useModelList();
  const { triggerCarYearFetch, isCarYearLoading, carYearData, carYearError } = useCarYear();
  const { cars: carsCount, getCarsCount, isMutating: isCarsCountMutating } = useSearchCarsCount();

  const [makeList, setMakeList] = useState<string[]>([]);
  const [modelList, setModelList] = useState<string[]>([]);
  const [yearList, setYearList] = useState<string[]>([]);

  const fetchCars = () => {
    if (!token) return;
    getCarsCount({
      token,
      make: getValues("make") ?? undefined,
      model: getValues("model") ?? undefined,
      fromYear: getValues("fromYear") ?? undefined,
      toYear: getValues("toYear") ?? undefined,
      fromPrice: getValues("fromPrice") ?? undefined,
      toPrice: getValues("toPrice") ?? undefined,
      odometer: getValues("odometer") ?? undefined,
      transmission: getValues("transmission") ?? undefined,
      fuelType: getValues("fuelType") ?? undefined,
    });
  };

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (makeData && makeData.length > 0 && !makeListLoading) {
      setMakeList(makeData.map((m: { make: string }) => m?.make));
    }
  }, [makeData, makeListLoading]);

  useEffect(() => {
    if (modelsData && modelsData.length > 0 && !isModelsLoading) {
      setModelList(modelsData.map((m: { model: string }) => m?.model));
    }
  }, [modelsData, isModelsLoading]);

  useEffect(() => {
    if (carYearData && carYearData.length > 0 && !isCarYearLoading) {
      setYearList(carYearData.map((y: { year: string }) => y?.year));
    }
  }, [carYearData, isCarYearLoading]);

  const clearSearch = (includeMake: boolean) => {
    if (includeMake) {
      setValue("make", "");
    }
    setValue("model", "");
    setValue("fromYear", "");
    setValue("toYear", "");
    setValue("fromPrice", "");
    setValue("toPrice", "");
    setValue("odometer", "");
    setValue("transmission", "");
    setValue("fuelType", "");

    if (!token) return;
    getCarsCount({ token });
  };

  const onListOpen = (
    options: string[],
    fieldValue:
      | "make"
      | "model"
      | "fromYear"
      | "toYear"
      | "fromPrice"
      | "toPrice"
      | "odometer"
      | "transmission"
      | "fuelType"
  ) => {
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        if (!token) return;

        if (buttonIndex === cancelButtonIndex) {
          setValue(fieldValue, "");
          fetchCars();
          if (fieldValue === "make") {
            setModelList([]);
            setYearList([]);
          }

          if (fieldValue === "model") {
            setYearList([]);
          }
          return;
        }
        setValue(fieldValue, options[buttonIndex as number]);

        const selectedValue = options[buttonIndex as number];
        if (fieldValue === "make") {
          clearSearch(false);
          triggerModelFetch({ token, make: selectedValue });
          triggerCarYearFetch({ token, make: selectedValue, year: "all" });
        }

        if (fieldValue === "model") {
          setValue("fromYear", "");
          setValue("toYear", "");
          triggerCarYearFetch({
            token,
            make: getValues("make"),
            model: selectedValue,
            year: "all",
          });
        }

        fetchCars();
      }
    );
  };

  const showSearchResults = () => {
    router.push({
      pathname: "/search-results",
      params: {
        make: getValues("make"),
        model: getValues("model"),
        fromYear: getValues("fromYear"),
        toYear: getValues("toYear"),
        odometer: getValues("odometer"),
        transmission: getValues("transmission"),
        fuelType: getValues("fuelType"),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.wrapperMain}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 80 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Stack.Screen
          options={{ title: "Search", headerBackTitle: "", headerBackTitleVisible: false }}
        />
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.searchInput}
            onPress={() => router.push({ pathname: "/(tabs)/manual-search" })}
          >
            <Text
              style={{
                fontSize: 20,
                fontFamily: "SF_Pro_Display_Regular",
                color: Colors.textLight,
              }}
              maxFontSizeMultiplier={1.1}
            >
              Search Cars or Organisations...
            </Text>
          </TouchableOpacity>

          <Controller
            control={control}
            name="make"
            render={({ field: { value, name } }) => (
              <Pressable
                onPress={() => onListOpen([...makeList, "Cancel"], "make")}
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
              <Pressable
                onPress={() => onListOpen([...modelList, "Cancel"], "model")}
                style={styles.selector}
              >
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
                <Pressable
                  onPress={() => onListOpen([...yearList, "Cancel"], "fromYear")}
                  style={styles.selector}
                >
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
                <Pressable
                  onPress={() => onListOpen([...yearList, "Cancel"], "toYear")}
                  style={styles.selector}
                >
                  <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                    {value ? value : "To Year"}
                  </Text>
                  <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
                </Pressable>
              )}
            />
          </View>
          {/* <View style={styles.wrapper}>
        <Controller
          control={control}
          name="fromPrice"
          render={({ field: { value, name } }) => (
            <Pressable
              onPress={() => onListOpen([...priceList, "Cancel"], "fromPrice")}
              style={styles.selector}
            >
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
            <Pressable
              onPress={() => onListOpen([...priceList, "Cancel"], "toPrice")}
              style={styles.selector}
            >
              <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                {value ? value : "$ To"}
              </Text>
              <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
            </Pressable>
          )}
        />
      </View> */}
          <Controller
            control={control}
            name="odometer"
            render={({ field: { value, name } }) => (
              <Pressable
                onPress={() => onListOpen([...odometerList, "Cancel"], "odometer")}
                style={styles.selector}
              >
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
              <Pressable
                onPress={() => onListOpen([...transmissionList, "Cancel"], "transmission")}
                style={styles.selector}
              >
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
              <Pressable
                onPress={() => onListOpen([...fuelTypeList, "Cancel"], "fuelType")}
                style={styles.selector}
              >
                <Text style={[styles.valueStyle, value ? null : styles.placeholder]}>
                  {value ? value : "Fuel Type"}
                </Text>
                <AntDesign name="caretdown" size={16} color={Colors.iconGray} />
              </Pressable>
            )}
          />
          {isCarsCountMutating ? (
            <ActivityIndicator color={Colors.primary} size={"small"} />
          ) : carsCount && carsCount.length > 0 ? (
            carsCount[0].num ? (
              <View style={{ flexDirection: "row", paddingHorizontal: 10 }}>
                <Text style={styles.countText}>{`${carsCount[0].num}`}</Text>
                <Text
                  style={{
                    fontFamily: "SF_Pro_Display_Regular",
                    fontSize: 20,
                    color: Colors.textDark,
                  }}
                >
                  {" "}
                  matches
                </Text>
              </View>
            ) : null
          ) : null}
          <View style={{ height: 100, gap: 10 }}>
            <Button
              title="Show Results"
              onPress={showSearchResults}
              type={
                !getValues("make") || carsCount.length === 0 || carsCount[0].num === 0
                  ? "disabled"
                  : "primary"
              }
            />
            <Button
              title="Clear Search"
              onPress={() => clearSearch(true)}
              type={
                !getValues("make") || carsCount.length === 0 || carsCount[0].num === 0
                  ? "disabled"
                  : "secondary"
              }
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapperMain: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    gap: 15,
    padding: 12,
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
  countText: {
    fontFamily: "SF_Pro_Display_Bold",
    fontSize: 20,
    color: Colors.textDark,
  },
  searchInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderColor: Colors.borderGray,
    borderWidth: 2,
  },
});
