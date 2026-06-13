import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Modal, 
  TextInput, 
  ActivityIndicator,
  Pressable
} from "react-native";
import { useState, useEffect } from "react";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { WorkoutExercise } from "@/types/workout";
import { Alert } from "react-native";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = getAuth().currentUser;

  const [workoutName, setWorkoutName] = useState("Loading...");
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Stati per il Modale
  const [modalVisible, setModalVisible] = useState(false);
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");

  useEffect(() => {
    if (!user || !id) return;

    const fetchWorkoutInfo = async () => {
      try {
        const workoutRef = doc(db, "users", user.uid, "workouts", id);
        const workoutSnap = await getDoc(workoutRef);
        if (workoutSnap.exists()) {
          setWorkoutName(workoutSnap.data().name);
        } else {
          setWorkoutName("Allenamento non trovato");
        }
      } catch (error) {
        console.error("Errore nel recupero dell'allenamento:", error);
      }
    };

    fetchWorkoutInfo();

    const exercisesRef = collection(db, "users", user.uid, "workouts", id, "exercises");
    const unsubscribe = onSnapshot(exercisesRef, (snap) => {
      const data: WorkoutExercise[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<WorkoutExercise, "id">),
      }));

      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });

      setExercises(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, id]);

  const handleAddExercise = async () => {
    // 1. Controllo campi vuoti
    if (!user || !id || !exerciseName.trim() || !sets.trim() || !reps.trim()) {
        Alert.alert("Attenzione", "Compila tutti i campi prima di aggiungere l'esercizio.");
        return;
    }

    // 2. Convertiamo le stringhe in numeri
    const setsNumber = Number(sets.trim());
    const repsNumber = Number(reps.trim());

    // 3. Controllo Numeri Interi e Maggiori di Zero
    if (!Number.isInteger(setsNumber) || setsNumber <= 0 || !Number.isInteger(repsNumber) || repsNumber <= 0) {
        Alert.alert("Errore", "Serie e Ripetizioni devono essere numeri interi validi maggiori di zero.");
        return;
    }

    try {
      const exercisesRef = collection(db, "users", user.uid, "workouts", id, "exercises");
      
      await addDoc(exercisesRef, {
        name: exerciseName.trim(),
        sets: setsNumber,
        reps: repsNumber, 
        createdAt: new Date().toISOString(),
      });

      setExerciseName("");
      setSets("");
      setReps("");
      setModalVisible(false);
    } catch (error) {
      console.error("Errore durante il salvataggio:", error);
      Alert.alert("Errore", "Impossibile salvare l'esercizio. Riprova.");
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/"); 
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.customHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {workoutName}
        </Text>
      </View>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>Nessun esercizio. Clicca il pulsante in basso per iniziare!</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{item.name}</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Serie</Text>
                <Text style={styles.statValue}>{item.sets}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Ripetizioni</Text>
                <Text style={styles.statValue}>{item.reps}</Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <TouchableOpacity style={styles.addListItemButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addListItemText}>+ Aggiungi Esercizio</Text>
          </TouchableOpacity>
        )}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Aggiungi Esercizio</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nome Esercizio (es. Panca piana)"
              placeholderTextColor="#888"
              value={exerciseName}
              onChangeText={setExerciseName}
            />
            
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Serie (es. 4)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={sets}
                onChangeText={setSets}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="Reps (es. 10)"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={reps}
                onChangeText={setReps}
              />
            </View>
            
            <TouchableOpacity style={styles.createButton} onPress={handleAddExercise}>
              <Text style={styles.createButtonText}>Aggiungi</Text>
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
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "black",
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  backButton: {
    backgroundColor: "#1e1e1e",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  backArrow: {
    color: "#1DB954",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: -2,
  },
  headerTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    textTransform: "capitalize",
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40, 
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 40, 
    fontSize: 16,
  },
  exerciseCard: {
    backgroundColor: "#1e1e1e",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  exerciseName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: "black",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    color: "#1DB954",
    fontSize: 18,
    fontWeight: "bold",
  },
  
  addListItemButton: {
    backgroundColor: "#1e1e1e", 
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1DB954",
    borderStyle: "solid",  
    marginTop: 5,
  },
  addListItemText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", 
    justifyContent: "flex-end", 
  },
  modalContent: {
    width: "100%",           
    backgroundColor: "#1e1e1e", 
    borderTopLeftRadius: 30,  
    borderTopRightRadius: 30,     
    padding: 24, 
    paddingBottom: 40,           
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
    marginBottom: 15,
    fontSize: 16,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  createButton: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#010101",
    fontWeight: "bold",
    fontSize: 18,
  },
});