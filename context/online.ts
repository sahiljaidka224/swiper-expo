import { create } from "zustand";

interface StatusStore {
  onlineStatuses: Map<string, string>;
  setUserStatus: (userId: string, status: string) => void;
}

export const useStatusStore = create<StatusStore>((set) => ({
  onlineStatuses: new Map<string, string>(),
  setUserStatus: (userId, status) =>
    set((state) => {
      const updatedStatuses = new Map(state.onlineStatuses);
      updatedStatuses.set(userId, status);
      return { onlineStatuses: updatedStatuses };
    }),
}));

export const useUserStatus = (userId: string): boolean => {
  return useStatusStore((state) => state.onlineStatuses.get(userId) === "online");
};
