import { View, Text, FlatList, TouchableOpacity, StyleSheet,  } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Workout } from "../../types/workout"; 

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
      <Text style = {styles.title}>My workout</Text>
      <FlatList
        data = {workouts}
        keyExtractor = {(item) => item.id}
        renderItem = {({item}) => (
          <Text>{item.name} </Text>
        )}
      />
      <TouchableOpacity style = {styles.button}>
        <Text style = {styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitle: {
    fontSize: 16,
    color: "#aaa",
    marginBottom: 30,
  },

  button: {
    backgroundColor: "#1DB954",
    padding: 15,
    height: 60,
    width: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 20,
    bottom: 30,
  },

  fabIcon: {
    fontSize: 32,
    color: "black",
    fontWeight: "bold",
    lineHeight: 32, // Aiuta a centrare verticalmente il "+" in alcuni font
  },
});