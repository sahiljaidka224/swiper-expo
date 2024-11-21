import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = Map<string, Map<string, { read: boolean }>>;

export interface HideSenderContextType {
  users: User;
  setUsers: (users: User) => void;
  updateGroupReadStatus: (userId: string, groupId: string, read: boolean) => void;
  addGroupToUser: (userId: string, groupId: string) => void;
  hasReadGroup: (userId: string) => boolean;
}

interface HideSenderContextProviderProps {
  children: React.ReactNode;
}

const HideSenderContext = createContext<HideSenderContextType | undefined>(undefined);

const saveUsersToAsyncStorage = async (users: Map<string, Map<string, { read: boolean }>>) => {
  const serializedUsers = Array.from(users).map(([userId, groupMap]) => [
    userId,
    Array.from(groupMap), // Convert inner Map to an array
  ]);
  await AsyncStorage.setItem("users", JSON.stringify(serializedUsers));
};

const loadUsersFromAsyncStorage = async (): Promise<
  Map<string, Map<string, { read: boolean }>>
> => {
  try {
    const savedUsers = await AsyncStorage.getItem("users");
    if (!savedUsers) {
      return new Map();
    }

    const parsedUsers = JSON.parse(savedUsers);
    return new Map(
      parsedUsers.map(([userId, groupArray]: [string, [string, { read: boolean }][]]) => [
        userId,
        new Map(groupArray),
      ])
    );
  } catch (error) {
    console.error("Failed to load users from AsyncStorage:", error);
    return new Map();
  }
};

export const HideSenderContextProvider: React.FC<HideSenderContextProviderProps> = ({
  children,
}) => {
  const [users, setUsers] = useState<User>(new Map());

  useEffect(() => {
    const loadUsers = async () => {
      const loadedUsers = await loadUsersFromAsyncStorage();
      console.log("Saved users", loadedUsers);

      setUsers(loadedUsers);
      // const savedUsers = await AsyncStorage.getItem("users");
      // if (savedUsers) {
      //   const parsedUsers = new Map<string, Map<string, { read: boolean }>>(JSON.parse(savedUsers));
      //   const validUsers = new Map<string, Map<string, { read: boolean }>>();

      //   parsedUsers.forEach((userGroups, userId) => {
      //     if (userGroups.size > 0) {
      //       validUsers.set(userId, userGroups);
      //     }
      //   });
      //   console.log("Loaded users from AsyncStorage", validUsers);
      //   setUsers(validUsers);
      // }
    };
    loadUsers();
  }, []);

  // Save users to AsyncStorage whenever users change
  useEffect(() => {
    const saveUsers = async () => {
      await saveUsersToAsyncStorage(users);
    };

    saveUsers();
  }, [users]);

  const updateGroupReadStatus = (userId: string, groupId: string, read: boolean) => {
    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      const userGroups = newUsers.get(userId);
      if (userGroups) {
        const group = userGroups.get(groupId);
        if (group) {
          group.read = read;
        }
      }

      return newUsers;
    });
  };

  const addGroupToUser = (userId: string, groupId: string) => {
    setUsers((prevUsers) => {
      const newUsers = new Map(prevUsers);

      let userGroups = newUsers.get(userId) || new Map<string, { read: boolean }>();
      if (!userGroups) {
        userGroups = new Map();
        newUsers.set(userId, userGroups);
      }

      userGroups.set(groupId, { read: false });

      return newUsers;
    });
  };

  const hasReadGroup = (userId: string): boolean => {
    const userGroups = users.get(userId) || new Map<string, { read: boolean }>();
    if (!userGroups || userGroups.size === 0) {
      return true;
    }

    for (let group of userGroups.values()) {
      if (group.read) {
        return true;
      }
    }

    return false;
  };

  return (
    <HideSenderContext.Provider
      value={{ users, setUsers, addGroupToUser, updateGroupReadStatus, hasReadGroup }}
    >
      {children}
    </HideSenderContext.Provider>
  );
};

export const useHideSenderContext = () => {
  const context = useContext(HideSenderContext);
  if (context === undefined) {
    throw new Error("useHideSenderContext must be used within a HideSenderProvider");
  }
  return context;
};
