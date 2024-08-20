import AddStock from "@/components/AddStock";
import ManualForm from "@/components/ManualModeForm";
import RegoForm from "@/components/RegoForm";
import { SegmentedControl } from "@/components/SegmentedControl";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

const options = ["Rego Lookup", "Manual Mode"];
export default function AddStockPage() {
  const [mode, setMode] = useState<string>("Rego Lookup");

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <AddStock />

        <View style={{ flex: 1, padding: 12 }}>
          <View
            style={{
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <SegmentedControl options={options} selectedOption={mode} onOptionPress={setMode} />
          </View>
          {mode === "Rego Lookup" ? <RegoForm /> : <ManualForm />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
