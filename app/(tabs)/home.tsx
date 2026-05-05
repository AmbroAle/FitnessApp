import { Text, FlatList, TouchableOpacity, StyleSheet, Modal, View, Pressable, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Workout } from "../../types/workout"; 
import { router } from "expo-router";

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nameWorkout, setNameWorkout] = useState("");
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
      <TouchableOpacity style = {styles.button} onPress={() => setModalVisible(true)}>
        <Text style = {styles.fabIcon}>+</Text>
      </TouchableOpacity>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} // Fondamentale per il tasto "Indietro" di Android
      >
        {/* Sfondo semi-trasparente: se cliccato chiude il modale */}
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          
          {/* Riquadro del contenuto: "Assorbe" i click per non farli arrivare allo sfondo */}
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Workout</Text>
            {/* Qui metterai i TextInput per creare il workout */}
            <TextInput
              style = {styles.input}
              placeholder="Name workout"
              placeholderTextColor="#888"
              onChangeText={setNameWorkout}
              value={nameWorkout}
              />
          </Pressable>

        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Sfondo oscurato al 60%
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",           // Occupa l'80% della larghezza dello schermo
    height: "40%",          // Occupa il 40% dell'altezza dello schermo
    backgroundColor: "#1e1e1e", // Grigio scuro per staccare dal nero
    borderRadius: 20,       // Bordi belli arrotondati
    padding: 24,            // Spazio interno
    // alignItems: "center", // Decommenta se vuoi centrare tutto il contenuto orizzontalmente
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  
  modalContainer: {
    backgroundColor: "gray",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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