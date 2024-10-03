import Colors from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";

interface ModalProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  hideHeader?: boolean;
}

export default function Modal({ children, isVisible, onClose, hideHeader = false }: ModalProps) {
  return (
    <RNModal animationType="fade" transparent={true} visible={isVisible}>
      <View style={styles.modalContent}>
        {!hideHeader && (
          <View style={styles.headerContainer}>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color={Colors.primary} size={30} />
            </Pressable>
          </View>
        )}
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "100%",
    width: "100%",
    opacity: 1,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    height: "6%",
    zIndex: 10,
    top: 0,
    display: "flex",
    width: "100%",
    // backgroundColor: Colors.primary,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
