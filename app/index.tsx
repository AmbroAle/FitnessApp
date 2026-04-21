import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { router } from "expo-router";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    }
  }, [user, loading]);

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
}