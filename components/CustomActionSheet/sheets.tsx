import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import CameraActionSheet from "./CameraActionSheet";

registerSheet("camera-sheet", CameraActionSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "react-native-actions-sheet" {
  interface Sheets {
    "camera-sheet": SheetDefinition<{
      returnValue: "camera" | "gallery";
    }>;
  }
}

export {};
