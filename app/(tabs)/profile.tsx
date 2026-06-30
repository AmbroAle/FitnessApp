import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function ProfileScreen() {
  const user = getAuth().currentUser;

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState(0);
  const [lastWorkout, setLastWorkout] = useState("N/A");
  const [monthlyAvg, setMonthlyAvg] = useState("0");
  
  const [loading, setLoading] = useState(true);

  const userName = user?.displayName || user?.email?.split("@")[0] || "Utente";

  useEffect(() => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "workouts");

    const unsubscribe = onSnapshot(ref, (snap) => {
      const totale = snap.docs.length;
      setTotalWorkouts(totale);

      if (totale === 0) {
        setThisWeekWorkouts(0);
        setLastWorkout("N/A");
        setMonthlyAvg("0");
        setLoading(false);
        return;
      }

      const oggi = new Date();
      const setteGiorniFa = new Date();
      setteGiorniFa.setDate(oggi.getDate() - 7);

      // Estraiamo tutte le date valide e le ordiniamo dalla più recente alla più vecchia
      const dateWorkouts = snap.docs
        .map(doc => {
          const data = doc.data();
          return data.createdAt ? new Date(data.createdAt) : null;
        })
        .filter((date): date is Date => date !== null)
        .sort((a, b) => b.getTime() - a.getTime());

      // 1. THIS WEEK
      const counterSettimanale = dateWorkouts.filter(data => data >= setteGiorniFa).length;
      setThisWeekWorkouts(counterSettimanale);

      // 2. ULTIMO ALLENAMENTO
      const ultimaData = dateWorkouts[0]; // La prima dell'array è la più recente
      // Calcolo differenza in giorni (arrotondata a mezzanotte per evitare bug con le ore)
      const diffTime = Date.UTC(oggi.getFullYear(), oggi.getMonth(), oggi.getDate()) - 
                       Date.UTC(ultimaData.getFullYear(), ultimaData.getMonth(), ultimaData.getDate());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) setLastWorkout("Oggi");
      else if (diffDays === 1) setLastWorkout("Ieri");
      else setLastWorkout(`${diffDays} gg fa`);

      // 3. MEDIA MENSILE
      const dataPiuVecchia = dateWorkouts[dateWorkouts.length - 1]; // L'ultima dell'array
      const giorniAttivi = (oggi.getTime() - dataPiuVecchia.getTime()) / (1000 * 60 * 60 * 24);
      // Trasformiamo i giorni in mesi (circa 30.44 giorni in un mese medio). Se è meno di 1 mese, usiamo 1.
      const mesiAttivi = Math.max(1, giorniAttivi / 30.44);
      
      const media = (totale / mesiAttivi).toFixed(1); // Mantiene solo 1 decimale (es. 12.5)
      setMonthlyAvg(media);

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
          
          <View style={styles.userInfoRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-outline" size={40} color="black" />
            </View>
            <View style={styles.userInfoText}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.userSubtitle}>Fitness Enthusiast</Text>
            </View>
          </View>

          {/* PRIMA RIGA DI STATISTICHE */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="trophy-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>WORKOUTS</Text>
              </View>
              <Text style={styles.statValue}>{totalWorkouts}</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="trending-up-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>THIS WEEK</Text>
              </View>
              <Text style={styles.statValue}>{thisWeekWorkouts}</Text>
            </View>
          </View>

          {/* SECONDA RIGA DI STATISTICHE (Nuova) */}
          <View style={[styles.statsRow, { marginTop: 15 }]}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="calendar-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>LATEST</Text>
              </View>
              {/* Ho ridotto un po' la dimensione del testo se la stringa è lunga ("12 gg fa") */}
              <Text style={[styles.statValue, { fontSize: 22 }]}>{lastWorkout}</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Ionicons name="stats-chart-outline" size={16} color="#1DB954" />
                <Text style={styles.statLabel}>MONTHLY AVG</Text>
              </View>
              <Text style={styles.statValue}>{monthlyAvg}</Text>
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