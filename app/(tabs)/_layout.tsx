import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false, // Nasconde la barra in alto
        tabBarStyle: { 
          backgroundColor: '#121212', // Colore del footer
          borderTopColor: '#333'
        },
        tabBarActiveTintColor: '#1DB954', // Colore verde quando selezionato
      }}
    >
      {/* Il nome (name) deve corrispondere ESATTAMENTE al nome del file .tsx */}
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🏠</Text> 
        }} 
      />
      
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>🔍</Text> 
        }} 
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: () => <Text style={{ fontSize: 20 }}>👤</Text> 
        }} 
      />
    </Tabs>
  );
}