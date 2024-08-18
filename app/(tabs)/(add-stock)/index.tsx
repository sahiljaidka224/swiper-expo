import AddStock from "@/components/AddStock";
import Button from "@/components/Button";
import ManualForm from "@/components/ManualModeForm";
import RegoForm from "@/components/RegoForm";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";

export default function AddStockPage() {
  const [mode, setMode] = useState<"rego" | "manual">("rego");

  const changeMode = () => {
    if (mode === "rego") {
      setMode("manual");
      return;
    }

    if (mode === "manual") setMode("rego");
  };

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
          {mode === "rego" ? <RegoForm /> : <ManualForm />}
          <Button
            title={mode === "rego" ? "Don't have Rego? Add Manually" : "Switch to Rego Mode"}
            onPress={changeMode}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
