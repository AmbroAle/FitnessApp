import React from 'react';
import { StyleSheet, TextInput, Keyboard } from "react-native";
import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Exercise } from "../../types/workout"; 
import { router } from "expo-router";


export default function SearchScreen() {
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const searchExercises = async () => {
    // Evita chiamate a vuoto se l'utente non ha scritto nulla
    if (!query.trim()) return; 

    setLoading(true);
    setError("");
    Keyboard.dismiss(); // Abbassa la tastiera del telefono

    try {
      const response = await fetch(
        `https://oss.exercisedb.dev/api/v1/exercises/search?search=${query}`
      );
      
      if (!response.ok) {
        throw new Error("Errore durante la ricerca");
      }

      const data = await response.json();
      setExercises(data);
      
    } catch (err) {
      console.error(err);
      setError("Impossibile caricare gli esercizi. Riprova.");
    } finally {
      setLoading(false);
    }
  };
    return (
        <SafeAreaView style = {styles.container}>
            <TextInput style = {styles.input}
                placeholder="Search"
                placeholderTextColor="#888"
                onChangeText={setSearch}
                value= {search}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },

  input: {
    backgroundColor: "#1e1e1e",
    color: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },

});