import { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signOut, 
  updateEmail, 
  updatePassword, 
  deleteUser 
} from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // 🔹 Update Email
  const updateEmailAuth = async (email) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await updateEmail(auth.currentUser, email);
    // Update local user state
    setUser({ ...auth.currentUser, email });
  };

  // 🔹 Update Password
  const updatePasswordAuth = async (password) => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await updatePassword(auth.currentUser, password);
  };

  // 🔹 Delete Account
  const deleteUserAuth = async () => {
    if (!auth.currentUser) throw new Error("No user logged in");
    await deleteUser(auth.currentUser);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      logout,
      updateEmailAuth,
      updatePasswordAuth,
      deleteUserAuth
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
