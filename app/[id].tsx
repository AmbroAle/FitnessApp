import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Image, 
  ScrollView,
  TouchableOpacity 
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ExerciseDetail } from "@/types/workout";


export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const [exercise, setExercise] = useState<ExerciseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExerciseDetail = async () => {
      if (!id) return;
      
      try {
        const response = await fetch(`https://oss.exercisedb.dev/api/v1/exercises/${id}`);
        if (!response.ok) throw new Error("Errore durante il caricamento");

        const json = await response.json();
        
        if (json.success) {
          setExercise(json.data);
        } else {
          setError("Esercizio non trovato.");
        }
      } catch (err) {
        console.error(err);
        setError("Impossibile caricare i dettagli.");
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseDetail();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  if (error || !exercise) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {exercise.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: exercise.gifUrl }} 
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.badgesContainer}>
          {exercise.equipments.map((eq, index) => (
            <View key={`eq-${index}`} style={styles.badge}>
              <Text style={styles.badgeText}>{eq}</Text>
            </View>
          ))}
          {exercise.targetMuscles.map((tm, index) => (
            <View key={`tm-${index}`} style={[styles.badge, styles.badgeSecondary]}>
              <Text style={styles.badgeTextSecondary}>{tm}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {exercise.instructions.map((step, index) => (
            <View key={index} style={styles.instructionRow}>
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{step}</Text>
            </View>
          ))}
        </View>

        {exercise.secondaryMuscles.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Secondary muscles</Text>
            <Text style={styles.secondaryMusclesText}>
              {exercise.secondaryMuscles.join(", ")}
            </Text>
          </View>
        )}

      </ScrollView>
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
  backButtonText: {
    color: "#1DB954",
    fontSize: 16,
    marginTop: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textTransform: "capitalize",
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: "100%",
    height: 350,
    backgroundColor: "white",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textTransform: "capitalize",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  badgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 25,
    gap: 10,
  },
  badge: {
    backgroundColor: "#1e1e1e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  badgeText: {
    color: "white",
    fontSize: 14,
    textTransform: "capitalize",
  },
  badgeSecondary: {
    backgroundColor: "#1DB95420",
    borderColor: "#1DB954",
  },
  badgeTextSecondary: {
    color: "#1DB954",
    fontSize: 14,
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  instructionRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 2,
  },
  numberText: {
    color: "black",
    fontWeight: "bold",
    fontSize: 14,
  },
  instructionText: {
    flex: 1,
    color: "#ccc",
    fontSize: 16,
    lineHeight: 24,
  },
  secondaryMusclesText: {
    color: "#aaa",
    fontSize: 16,
    textTransform: "capitalize",
    fontStyle: "italic",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
  },
});