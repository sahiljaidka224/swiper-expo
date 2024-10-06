import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import {
  Platform,
  Pressable,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  TextInput,
  SectionList,
} from "react-native";
import * as Contacts from "expo-contacts";
import Avatar from "@/components/Avatar";
import Text from "@/components/Text";
import Colors from "@/constants/Colors";
import * as SMS from "expo-sms";

import * as Linking from "expo-linking";
import { showToast } from "@/components/Toast";

export default function InviteFriendsPage() {
  const [phoneContacts, setPhoneContacts] = useState<Contacts.Contact[]>([]);

  const [searchText, setSearchText] = useState("");

  const keyboardVerticalOffset = Platform.OS === "ios" ? 100 : 0;

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      console.log("status", status);
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setPhoneContacts(data);
        }
      } else if (status === Contacts.PermissionStatus.DENIED) {
        await Linking.openSettings();
      }
    })();
  }, []);

  const filteredPhoneContacts = phoneContacts.filter((contact) => {
    if (!contact.name) {
      return false;
    }
    const [firstName, lastName] = contact.name.toLowerCase().split(" ");
    return (
      firstName?.startsWith(searchText.toLowerCase()) ||
      lastName?.startsWith(searchText.toLowerCase())
    );
  });

  const groupPhoneContacts = filteredPhoneContacts.reduce((acc, contact) => {
    if (!contact.name) {
      return acc;
    }
    const firstLetter = contact.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(contact);
    return acc;
  }, {} as Record<string, Contacts.Contact[]>);

  const phoneSections = Object.keys(groupPhoneContacts)
    .sort()
    .map((letter) => ({
      title: letter,
      data: groupPhoneContacts[letter],
    }));

  const keyExtractor = (_: Contacts.Contact, index: number) => {
    return String(index);
  };

  const renderItem = ({ item }: { item: Contacts.Contact }) => {
    const onPress = async () => {
      let message =
        "Let’s Chat on Swiper. It’s my main app for all car messaging. Lots of cool features and FREE PPSR searches, download Swiper for Apple: https://testflight.apple.com/join/gsP284QH";

      const isAvailable = await SMS.isAvailableAsync();

      if (isAvailable && item.phoneNumbers && item.phoneNumbers[0].number) {
        const { result } = await SMS.sendSMSAsync([item.phoneNumbers[0].number], message);
        if (result === "sent") {
          showToast("Success", "SMS sent successfully ✅", "success");
        } else {
          showToast("Error", "SMS failed to send ❌", "error");
        }
      } else {
        showToast("Error", "SMS is not available on this device ❌", "error");
      }
    };

    return (
      <Pressable style={styles.userContainer} onPress={onPress}>
        <View style={styles.leftContainer}>
          <View style={styles.avatarContainer}>
            <Avatar userId={""} />
          </View>
          <View>
            <Text style={styles.name}>{item.name}</Text>
            {item.phoneNumbers && (
              <Text style={styles.orgName}>{item?.phoneNumbers[0]?.number}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      keyboardVerticalOffset={keyboardVerticalOffset}
      behavior="padding"
    >
      <Stack.Screen
        options={{
          title: "Phone Contacts",
        }}
      />
      <TextInput
        style={styles.searchInput}
        placeholder="Search Phone Contacts..."
        value={searchText}
        onChangeText={setSearchText}
        clearButtonMode="while-editing"
      />

      <SectionList
        sections={phoneSections}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingBottom: 60,
  },
  leftContainer: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarContainer: { width: 50, height: 50, borderRadius: 25, overflow: "hidden" },
  userContainer: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: Colors.background,
    alignItems: "center",
    marginHorizontal: 5,
    padding: 5,
    justifyContent: "space-between",
  },
  name: {
    color: Colors.textDark,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Medium",
    textTransform: "capitalize",
  },
  orgName: {
    color: Colors.textDark,
    fontSize: 14,
    fontFamily: "SF_Pro_Display_Light",
    marginTop: 2,
  },
  searchInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 10,
    borderRadius: 20,
    borderColor: Colors.borderGray,
    borderWidth: 2,
    fontSize: 20,
    fontFamily: "SF_Pro_Display_Regular",
  },
  sendMessageInput: {
    backgroundColor: Colors.background,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 10,
    borderRadius: 12,
    borderColor: Colors.borderGray,
    borderWidth: 2,
    fontSize: 20,
    maxHeight: 120,
    fontFamily: "SF_Pro_Display_Regular",
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingVertical: 5,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  sectionHeaderText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: "SF_Pro_Display_Bold",
  },
  selectedContainer: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 9999,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
});
