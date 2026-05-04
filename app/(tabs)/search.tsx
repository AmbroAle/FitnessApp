import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
  Image,
  ScrollView, // Aggiunto ScrollView
} from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Exercise } from "@/types/workout";

// Lista dei gruppi muscolari principali
const BODY_PARTS = [
  "chest", 
  "back", 
  "shoulders", 
  "upper arms", 
  "lower arms", 
  "upper legs", 
  "lower legs", 
  "core",
  "cardio"
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);

  // 1. Ricerca tramite testo (SearchBar)
  const searchExercises = async () => {
    if (!query.trim()) return; 

    setSelectedBodyPart(null); // Resetta il filtro a bottoni se l'utente cerca del testo
    setLoading(true);
    setError("");
    Keyboard.dismiss();

    try {
      const response = await fetch(
        `https://oss.exercisedb.dev/api/v1/exercises/search?search=${query}`
      );
      
      if (!response.ok) throw new Error("Errore durante la ricerca");

      const responseJson = await response.json();
      if (responseJson.success) {
        setExercises(responseJson.data); 
      } else {
        setExercises([]);
      }
    } catch (err) {
      console.error(err);
      setError("Impossibile caricare gli esercizi. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Ricerca tramite i bottoni (Gruppi Muscolari)
  const searchByBodyPart = async (part: string) => {
    setSelectedBodyPart(part); // Evidenzia il bottone cliccato
    setQuery(""); // Svuota la barra di ricerca
    setLoading(true);
    setError("");
    Keyboard.dismiss();

    try {
      // Uso la chiamata API specifica per i gruppi muscolari
      const response = await fetch(
        `https://oss.exercisedb.dev/api/v1/exercises/bodyparts?bodyParts=${part}`
      );
      
      if (!response.ok) throw new Error("Errore durante il caricamento della categoria");

      const responseJson = await response.json();
      if (responseJson.success) {
        setExercises(responseJson.data); 
      } else {
        setExercises([]); 
      }
    } catch (err) {
      console.error(err);
      setError("Impossibile caricare gli esercizi. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Trova Esercizio</Text>

      {/* BARRA DI RICERCA */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Cerca (es. curl)..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={searchExercises}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchExercises}>
          <Text style={styles.searchButtonText}>Cerca</Text>
        </TouchableOpacity>
      </View>

      {/* FILTRI ORIZZONTALI (Gruppi Muscolari) */}
      <View style={styles.filtersWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {BODY_PARTS.map((part) => {
            const isActive = selectedBodyPart === part;
            return (
              <TouchableOpacity 
                key={part} 
                style={[styles.filterButton, isActive && styles.filterButtonActive]}
                onPress={() => searchByBodyPart(part)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {part}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* GESTIONE STATI */}
      {loading && <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* LISTA RISULTATI */}
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.exerciseId}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={() => (
          !loading && <Text style={styles.emptyText}>Nessun esercizio trovato.</Text>
        )}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image 
                source={{ uri: item.gifUrl }}
                style={styles.cardImage}
                resizeMode="cover"
            />
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.name}</Text>
            </View>
          </View>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15, // Ridotto per fare spazio ai filtri
  },
  input: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: "#1DB954",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  searchButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  // STILI PER I FILTRI
  filtersWrapper: {
    marginBottom: 15,
    marginRight: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10, // Crea spazio tra i bottoni (disponibile nelle versioni recenti di React Native)
  },
  filterButton: {
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, // Li rende arrotondati (a forma di pillola)
    borderWidth: 1,
    borderColor: "#333",
  },
  filterButtonActive: {
    backgroundColor: "#1DB954", // Diventa verde quando selezionato
    borderColor: "#1DB954",
  },
  filterText: {
    color: "#ccc",
    fontSize: 14,
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: "black", // Testo nero sul bottone verde per leggibilità
    fontWeight: "bold",
  },
  // RESTO DEGLI STILI
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: "#ff4444",
    textAlign: "center",
    marginTop: 10,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1e1e1e",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: "white", 
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});