import BoxedIcon from "@/components/BoxedIcon";
import Colors from "@/constants/Colors";
import { defaultStyles } from "@/constants/Styles";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Animated, {
  CurvedTransition,
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const transition = CurvedTransition.delay(100);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const data = [
  {
    carId: "all316475",
    organisationId: "all",
    stockNo: null,
    dealerId: "all",
    importSource: null,
    year: "2008",
    make: "mercedes-benz",
    model: "vito",
    series: "my08",
    badge: "111cdi compact",
    body: "van ",
    doors: "4",
    seats: "2",
    colour: "white",
    interiorColour: "",
    gears: "6",
    transmission: "manual",
    fuelType: "diesel",
    price: 0,
    rego: "925ap3",
    odometer: 285566,
    cylinders: "4",
    capacity: "2.1",
    vin: "wdf63960123464901",
    engineNo: "64698051631485",
    month: "10",
    comments: null,
    options: null,
    nvic: null,
    redbookCode: null,
    egc: null,
    stockLocationCode: null,
    driveAwayAmount: null,
    dealerComments: null,
    isDriveAway: null,
    regoValid: null,
    wholesale: "1",
    engineType: null,
    videoUrl: null,
    receivedDate: null,
    status: null,
    appraisalNotes: null,
    dateCreate: "2024-06-09T22:27:33.000Z",
    dateUpdate: null,
    isDel: 0,
    dateDeleted: null,
    reconcileDataId: null,
    reconcileKey: null,
    isQuickItem: 0,
    quickItemUserId: null,
    images: [
      {
        carId: "all316475",
        carImageId: "all316475_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/all316475_1.jpg",
      },
      {
        carId: "all316475",
        carImageId: "all316475_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/all316475_2.jpg",
      },
      {
        carId: "all316475",
        carImageId: "all316475_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/all316475_3.jpg",
      },
      {
        carId: "all316475",
        carImageId: "all316475_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/all316475_4.jpg",
      },
      {
        carId: "all316475",
        carImageId: "all316475_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/all316475_5.jpg",
      },
    ],
    displayPrice: "1",
    organisation: {
      organisationId: "all",
      name: "Alliance Motor Auctions",
      address: "17 Greenhills Avenue Moorebank NSW 2170",
      phoneNumber: "",
      latitude: -33.9389606,
      longitude: 150.9312081,
      ownerUserId: "8b7cdb00-da92-11ee-a61c-1f9491802b10",
      dealerId: "17507",
      state: "NSW",
      dateCreate: "2018-06-15T11:57:42.000Z",
      dateUpdate: "2018-06-15T11:57:42.000Z",
      dateDeleted: null,
      isDel: false,
    },
  },
  {
    carId: "bet09001894",
    organisationId: "bet",
    stockNo: null,
    dealerId: "bet",
    importSource: null,
    year: "2012",
    make: "volkswagen",
    model: "passat",
    series: "125tdi dsg highline",
    badge: "type 3c my13",
    body: "sedan",
    doors: "4",
    seats: "5",
    colour: "black",
    interiorColour: "",
    gears: "6",
    transmission: "sports automatic dual clutch",
    fuelType: "diesel",
    price: 7490,
    rego: "cir86e",
    odometer: 219018,
    cylinders: "4",
    capacity: "2.0",
    vin: "wvwzzz3czdp002518",
    engineNo: "",
    month: "",
    comments: null,
    options: null,
    nvic: null,
    redbookCode: null,
    egc: null,
    stockLocationCode: null,
    driveAwayAmount: null,
    dealerComments: null,
    isDriveAway: null,
    regoValid: null,
    wholesale: "1",
    engineType: null,
    videoUrl: null,
    receivedDate: null,
    status: null,
    appraisalNotes: null,
    dateCreate: "2024-06-05T03:34:56.000Z",
    dateUpdate: null,
    isDel: 0,
    dateDeleted: null,
    reconcileDataId: null,
    reconcileKey: null,
    isQuickItem: 0,
    quickItemUserId: null,
    images: [
      {
        carId: "bet09001894",
        carImageId: "bet09001894_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_1.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_1.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_2.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_2.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_3.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_3.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_4.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_4.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_5.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_5.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_6.jpg",
        imageIndex: 6,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_6.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_6.jpg",
        imageIndex: 6,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_6.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_7.jpg",
        imageIndex: 7,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_7.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_7.jpg",
        imageIndex: 7,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_7.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_8.jpg",
        imageIndex: 8,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_8.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_8.jpg",
        imageIndex: 8,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_8.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_9.jpg",
        imageIndex: 9,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_9.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_9.jpg",
        imageIndex: 9,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_9.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_10.jpg",
        imageIndex: 10,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_10.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_10.jpg",
        imageIndex: 10,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_10.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_11.jpg",
        imageIndex: 11,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_11.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_11.jpg",
        imageIndex: 11,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_11.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_12.jpg",
        imageIndex: 12,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_12.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_12.jpg",
        imageIndex: 12,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_12.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_13.jpg",
        imageIndex: 13,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_13.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_14.jpg",
        imageIndex: 14,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_14.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_15.jpg",
        imageIndex: 15,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_15.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_16.jpg",
        imageIndex: 16,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_16.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_17.jpg",
        imageIndex: 17,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_17.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_18.jpg",
        imageIndex: 18,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_18.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_19.jpg",
        imageIndex: 19,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_19.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_20.jpg",
        imageIndex: 20,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_20.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_21.jpg",
        imageIndex: 21,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_21.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_22.jpg",
        imageIndex: 22,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_22.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_23.jpg",
        imageIndex: 23,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_23.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_24.jpg",
        imageIndex: 24,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_24.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_25.jpg",
        imageIndex: 25,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_25.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_26.jpg",
        imageIndex: 26,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_26.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_27.jpg",
        imageIndex: 27,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_27.jpg",
      },
      {
        carId: "bet09001894",
        carImageId: "bet09001894_28.jpg",
        imageIndex: 28,
        url: "https://storage.swiper.datalinks.nl/images/bet09001894_28.jpg",
      },
    ],
    displayPrice: "1",
    organisation: {
      organisationId: "bet",
      name: "Better Car Company",
      address: "4D Wolseley Grove, Zetland, New South Wales, Australia",
      phoneNumber: "+6182719313",
      latitude: -33.904547,
      longitude: 151.210989,
      ownerUserId: "bc524640-1127-11ef-9c35-956f72403d5c",
      dealerId: "12345",
      state: "NSW",
      dateCreate: "2016-12-31T14:00:00.000Z",
      dateUpdate: "2016-12-31T14:00:00.000Z",
      dateDeleted: null,
      isDel: false,
    },
  },
  {
    carId: "all316864",
    organisationId: "all",
    stockNo: null,
    dealerId: "all",
    importSource: null,
    year: "2017",
    make: "volkswagen",
    model: "amarok",
    series: "2h my17",
    badge: "v6 tdi 550 highline",
    body: "dual cab utility ",
    doors: "",
    seats: "5",
    colour: "",
    interiorColour: "",
    gears: "8",
    transmission: "automatic",
    fuelType: "diesel",
    price: 0,
    rego: "dg59xj",
    odometer: 151462,
    cylinders: "",
    capacity: "3.0",
    vin: "wv1zzz2hzha021624",
    engineNo: "ddx009594",
    month: "05",
    comments: null,
    options: null,
    nvic: null,
    redbookCode: null,
    egc: null,
    stockLocationCode: null,
    driveAwayAmount: null,
    dealerComments: null,
    isDriveAway: null,
    regoValid: null,
    wholesale: "1",
    engineType: null,
    videoUrl: null,
    receivedDate: null,
    status: null,
    appraisalNotes: null,
    dateCreate: "2024-06-04T23:49:34.000Z",
    dateUpdate: null,
    isDel: 0,
    dateDeleted: null,
    reconcileDataId: null,
    reconcileKey: null,
    isQuickItem: 0,
    quickItemUserId: null,
    images: [
      {
        carId: "all316864",
        carImageId: "all316864_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/all316864_1.jpg",
      },
      {
        carId: "all316864",
        carImageId: "all316864_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/all316864_2.jpg",
      },
      {
        carId: "all316864",
        carImageId: "all316864_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/all316864_3.jpg",
      },
      {
        carId: "all316864",
        carImageId: "all316864_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/all316864_4.jpg",
      },
      {
        carId: "all316864",
        carImageId: "all316864_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/all316864_5.jpg",
      },
    ],
    displayPrice: "1",
    organisation: {
      organisationId: "all",
      name: "Alliance Motor Auctions",
      address: "17 Greenhills Avenue Moorebank NSW 2170",
      phoneNumber: "",
      latitude: -33.9389606,
      longitude: 150.9312081,
      ownerUserId: "8b7cdb00-da92-11ee-a61c-1f9491802b10",
      dealerId: "17507",
      state: "NSW",
      dateCreate: "2018-06-15T11:57:42.000Z",
      dateUpdate: "2018-06-15T11:57:42.000Z",
      dateDeleted: null,
      isDel: false,
    },
  },
  {
    carId: "bet09001877",
    organisationId: "bet",
    stockNo: null,
    dealerId: "bet",
    importSource: null,
    year: "2015",
    make: "volkswagen",
    model: "golf",
    series: "103tsi dsg highline",
    badge: "vii my15",
    body: "hatchback",
    doors: "5",
    seats: "5",
    colour: "white",
    interiorColour: "",
    gears: "7",
    transmission: "sports automatic dual clutch",
    fuelType: "petrol - premium ulp",
    price: 16990,
    rego: "fgb92g",
    odometer: 101293,
    cylinders: "4",
    capacity: "1.4",
    vin: "wvwzzzauzfw247782",
    engineNo: "",
    month: "",
    comments: null,
    options: null,
    nvic: null,
    redbookCode: null,
    egc: null,
    stockLocationCode: null,
    driveAwayAmount: null,
    dealerComments: null,
    isDriveAway: null,
    regoValid: null,
    wholesale: "1",
    engineType: null,
    videoUrl: null,
    receivedDate: null,
    status: null,
    appraisalNotes: null,
    dateCreate: "2024-05-15T12:20:17.000Z",
    dateUpdate: null,
    isDel: 0,
    dateDeleted: null,
    reconcileDataId: null,
    reconcileKey: null,
    isQuickItem: 0,
    quickItemUserId: null,
    images: [
      {
        carId: "bet09001877",
        carImageId: "bet09001877_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_1.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_1.jpg",
        imageIndex: 1,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_1.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_2.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_2.jpg",
        imageIndex: 2,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_2.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_3.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_3.jpg",
        imageIndex: 3,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_3.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_4.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_4.jpg",
        imageIndex: 4,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_4.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_5.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_5.jpg",
        imageIndex: 5,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_5.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_6.jpg",
        imageIndex: 6,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_6.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_6.jpg",
        imageIndex: 6,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_6.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_7.jpg",
        imageIndex: 7,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_7.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_7.jpg",
        imageIndex: 7,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_7.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_8.jpg",
        imageIndex: 8,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_8.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_8.jpg",
        imageIndex: 8,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_8.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_9.jpg",
        imageIndex: 9,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_9.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_9.jpg",
        imageIndex: 9,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_9.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_10.jpg",
        imageIndex: 10,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_10.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_10.jpg",
        imageIndex: 10,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_10.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_11.jpg",
        imageIndex: 11,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_11.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_11.jpg",
        imageIndex: 11,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_11.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_12.jpg",
        imageIndex: 12,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_12.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_12.jpg",
        imageIndex: 12,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_12.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_13.jpg",
        imageIndex: 13,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_13.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_13.jpg",
        imageIndex: 13,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_13.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_14.jpg",
        imageIndex: 14,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_14.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_14.jpg",
        imageIndex: 14,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_14.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_15.jpg",
        imageIndex: 15,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_15.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_16.jpg",
        imageIndex: 16,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_16.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_17.jpg",
        imageIndex: 17,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_17.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_18.jpg",
        imageIndex: 18,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_18.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_19.jpg",
        imageIndex: 19,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_19.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_20.jpg",
        imageIndex: 20,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_20.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_21.jpg",
        imageIndex: 21,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_21.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_22.jpg",
        imageIndex: 22,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_22.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_23.jpg",
        imageIndex: 23,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_23.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_24.jpg",
        imageIndex: 24,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_24.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_25.jpg",
        imageIndex: 25,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_25.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_26.jpg",
        imageIndex: 26,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_26.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_27.jpg",
        imageIndex: 27,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_27.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_28.jpg",
        imageIndex: 28,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_28.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_29.jpg",
        imageIndex: 29,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_29.jpg",
      },
      {
        carId: "bet09001877",
        carImageId: "bet09001877_30.jpg",
        imageIndex: 30,
        url: "https://storage.swiper.datalinks.nl/images/bet09001877_30.jpg",
      },
    ],
    displayPrice: "1",
    organisation: {
      organisationId: "bet",
      name: "Better Car Company",
      address: "4D Wolseley Grove, Zetland, New South Wales, Australia",
      phoneNumber: "+6182719313",
      latitude: -33.904547,
      longitude: 151.210989,
      ownerUserId: "bc524640-1127-11ef-9c35-956f72403d5c",
      dealerId: "12345",
      state: "NSW",
      dateCreate: "2016-12-31T14:00:00.000Z",
      dateUpdate: "2016-12-31T14:00:00.000Z",
      dateDeleted: null,
      isDel: false,
    },
  },
];

export default function WatchlistPage() {
  const [watchListData, setWatchlistData] = useState(data);
  const [isEditing, setIsEditing] = useState(false);
  const editing = useSharedValue(-30);

  const onDelete = (item: any) => {
    setWatchlistData(watchListData.filter((i) => i.carId !== item.carId));
  };

  const onEdit = () => {
    let editingNew = !isEditing;
    editing.value = editingNew ? 0 : -30;
    setIsEditing(editingNew);
  };

  const animatedRowStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: withTiming(editing.value) }],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={onEdit}>
              <Text style={{ color: Colors.primary, fontSize: 18 }}>
                {isEditing ? "Done" : "Edit"}
              </Text>
            </TouchableOpacity>
          ),
        }}
      /> */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Animated.View layout={transition}>
          <Animated.FlatList
            skipEnteringExitingAnimations
            keyExtractor={(item) => item.carId}
            scrollEnabled={false}
            data={watchListData}
            itemLayoutAnimation={transition}
            renderItem={({ item, index }) => (
              <Animated.View
                style={defaultStyles.block}
                entering={FadeInUp.delay(index * 10)}
                exiting={FadeOutUp}
              >
                <Animated.View style={[defaultStyles.item]}>
                  {/* <AnimatedTouchableOpacity
                    onPress={() => onDelete(item)}
                    style={[animatedRowStyles]}
                  >
                    <Ionicons name="remove-circle" size={24} color={Colors.red} />
                  </AnimatedTouchableOpacity> */}
                  <Image
                    source={{ uri: item.images[0].url }}
                    style={{
                      width: 125,
                      height: "75%",
                      borderRadius: 10,
                      objectFit: "cover",
                      borderWidth: 1,
                      borderColor: Colors.lightGray,
                    }}
                  />
                  <View style={{ flex: 1, gap: 3, marginLeft: 5 }}>
                    <Text
                      style={{ fontSize: 18, textTransform: "capitalize", fontWeight: "600" }}
                    >{`${item.year} ${item.make} ${item.model}`}</Text>
                    <DetailsText text={`· ${item.transmission}`} />
                    <DetailsText text={`· ${item.body}`} />
                    <DetailsText text={`· ${item.odometer} KMs`} />
                    <DetailsText text={`· ${item.capacity} ${item.fuelType}`} />
                    <Text
                      style={{
                        fontSize: 18,
                        color: Colors.primary,
                        marginTop: 10,
                        fontWeight: "600",
                      }}
                    >{`${item.price && item.price > 0 ? `$${item.price}` : "Enquire"}`}</Text>
                  </View>
                  {/* <Ionicons name="chevron-forward" size={20} color={Colors.primary} /> */}
                </Animated.View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    paddingVertical: 10,
                    paddingHorizontal: 30,
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <TouchableOpacity>
                    <Ionicons name="call-outline" color={Colors.primary} size={26} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons name="send-outline" color={Colors.primary} size={26} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function DetailsText({ text }: { text: string }) {
  return <Text style={{ fontSize: 12, textTransform: "capitalize" }}>{text}</Text>;
}
