import Colors from "@/constants/Colors";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { Modal as RNModal, View, Pressable, StyleSheet } from "react-native";

interface ModalProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
}

export default function Modal({ children, isVisible, onClose }: ModalProps) {
  return (
    <RNModal animationType="slide" transparent={true} visible={isVisible}>
      <View style={styles.modalContent}>
        <View style={styles.headerContainer}>
          <Pressable onPress={onClose}>
            <MaterialIcons name="close" color={Colors.background} size={30} />
          </Pressable>
        </View>
        {children}
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    height: "95%",
    width: "100%",
    // backgroundColor: Colors.borderGray,
    opacity: 1,
    borderTopRightRadius: 18,
    borderTopLeftRadius: 18,
    position: "absolute",
    bottom: 0,
  },
  headerContainer: {
    height: "8%",
    zIndex: 10,
    position: "absolute",
    top: 0,
    display: "flex",
    width: "100%",
    backgroundColor: Colors.primary,
    opacity: 0.6,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
