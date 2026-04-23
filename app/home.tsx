import { View, Text, FlatList, TouchableOpacity, StyleSheet,  } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Workout } from "../types/workout"; 

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const user = getAuth().currentUser;

  const loadWorkouts = async () => {

    if (!user) return;
    const ref = collection(db, "users", user.uid, "workouts");
    const snap = await getDocs(ref);
    const data: Workout[] = snap.docs.map(doc => ({
      id: doc.id,
      ...(doc.data() as Omit<Workout, "id">),
    }));
    setWorkouts(data);

  };

  useEffect(() => {
    loadWorkouts();
  }, []);
  
  return (
    <SafeAreaView style = {styles.container}>
      <Text>My workout</Text>
      <FlatList
        data = {workouts}
        keyExtractor = {(item) => item.id}
        renderItem = {({item}) => (
          <Text>{item.name} </Text>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});