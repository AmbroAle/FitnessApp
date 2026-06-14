import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ProfileScreen() {
  const user = getAuth().currentUser;

  // Stati per i dati reali
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState(0);
  const [loading, setLoading] = useState(true);

  const userName = user?.displayName || user?.email?.split("@")[0] || "Utente";

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "workouts");

    const unsubscribe = onSnapshot(ref, (snap) => {
      // 1. Totale workout creati
      setTotalWorkouts(snap.docs.length);

      // 2. Calcolo dei workout creati "Questa Settimana" (ultimi 7 giorni)
      const setteGiorniFa = new Date();
      setteGiorniFa.setDate(setteGiorniFa.getDate() - 7);

      const counterSettimanale = snap.docs.filter(doc => {
        const data = doc.data();
        if (!data.createdAt) return false;
        
        const dataCreazione = new Date(data.createdAt);
        return dataCreazione >= setteGiorniFa;
      }).length;

      setThisWeekWorkouts(counterSettimanale);
      setLoading(false);
    }, (error) => {
      console.error("Errore nel recupero delle statistiche:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.profileCard}>
          
          {/* Avatar e Nome REALE */}
          <View style={styles.userInfoRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-outline" size={40} color="black" />
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>

          {/* Statistiche REALI */}
          <View style={styles.statsRow}>
            
            {/* Box 1: Workouts Totali */}
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="trophy-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>WORKOUTS</Text>
              </View>
              <Text style={styles.statValue}>{totalWorkouts}</Text>
            </View>

            {/* Box 2: Workout negli ultimi 7 giorni */}
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="trending-up-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>THIS WEEK</Text>
              </View>
              <Text style={styles.statValue}>{thisWeekWorkouts}</Text>
            </View>

          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Personal Records</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Workout History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>About</Text>
          </TouchableOpacity>
        </View>

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
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatarContainer: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "capitalize", 
  },
  userSubtitle: {
    color: "#888",
    fontSize: 15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 15,
  },
  statBox: {
    flex: 1,
    backgroundColor: "black",
    borderRadius: 15,
    padding: 15,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  statValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },
  menuContainer: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: "#1e1e1e",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  menuItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});