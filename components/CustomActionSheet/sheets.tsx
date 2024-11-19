import { registerSheet, SheetDefinition } from "react-native-actions-sheet";
import CameraActionSheet from "./CameraActionSheet";
import WatchlistActionSheet from "./WatchlistActionSheet";

registerSheet("camera-sheet", CameraActionSheet);
registerSheet("watchlist-sheet", WatchlistActionSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module "react-native-actions-sheet" {
  interface Sheets {
    "camera-sheet": SheetDefinition<{
      returnValue: "camera" | "gallery";
    }>;
    "watchlist-sheet": SheetDefinition<{
      payload: {
        deleteVisible?: boolean;
        testDriveVisible?: boolean;
      };
      returnValue: "delete" | "test-drive";
    }>;
  }
}

export {};
