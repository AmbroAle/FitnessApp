import { Text, FlatList, TouchableOpacity, StyleSheet, Modal, View, Pressable, TextInput } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { addDoc, collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Workout } from "../../types/workout"; 

export default function HomeScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nameWorkout, setNameWorkout] = useState("");
  const user = getAuth().currentUser;

  useEffect(() => {
    console.log("L'utente attuale è:", user?.uid); 
    
    if (!user) return;

    const ref = collection(db, "users", user.uid, "workouts");

    const unsubscribe = onSnapshot(
      ref, 
      (snap) => {
        console.log("Numero di workout scaricati:", snap.docs.length);
        const data: Workout[] = snap.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Workout, "id">),
        }));

        data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
        setWorkouts(data);
      },
      (error) => {
        console.error("ERRORE ONSNAPSHOT:", error.message);
      }
    );

    return () => unsubscribe(); 
  }, [user?.uid]);

  const handleCreateWorkout = async () => {
    if(!user || nameWorkout.trim() === "") return;
    
    try {
      const ref = collection(db, "users", user.uid, "workouts");
      
      await addDoc(ref, {
        name: nameWorkout.trim(),
        createdAt: new Date().toISOString(),
      });
      
      setNameWorkout("");
      setModalVisible(false);

    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    return date.toLocaleDateString("it-IT", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric" 
    });
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My workouts</Text>
      
      <FlatList
        data={workouts}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.workoutCard}>
             <Text style={styles.workoutName}>{item.name}</Text>
             <Text style={styles.workoutDate}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
      />
      
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
      
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)} 
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Workout</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Name workout"
              placeholderTextColor="#888"
              onChangeText={setNameWorkout}
              value={nameWorkout}
            />
            
            <TouchableOpacity style={styles.createButton} onPress={handleCreateWorkout}>
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
            
          </Pressable>

        </Pressable>
      </Modal>
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
  workoutCard: {
    backgroundColor: "#1e1e1e",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
  },
  workoutName: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
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
    lineHeight: 32, 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", 
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",           
    backgroundColor: "#1e1e1e", 
    borderRadius: 20,       
    padding: 24,            
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "black",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "#010101",
    fontWeight: "bold",
    fontSize: 16,
  },
  workoutDate: {
    color: "#888", 
    fontSize: 14,
  },
});