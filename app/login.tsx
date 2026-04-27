import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { login } from "../services/auth";
import { router } from "expo-router";
import { styles } from "../styles/loginStyles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async () => {

  try {

    await login(email, password);

    router.replace("/home");

  } catch (e) {

    console.log("ERRORE LOGIN:", e); 

    alert(e); 

  }

};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bentornato 👋</Text>
      <Text style={styles.subtitle}>Accedi al tuo account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        style={styles.input}
        onChangeText={setEmail}
        value ={email}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
        value = {password}
      />

      <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}