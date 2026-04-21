import { View, Text, Button } from "react-native";
import { logout } from "../services/auth";

export default function HomeScreen() {
  return (
    <View>
      <Text>Sei loggato 🎉</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}