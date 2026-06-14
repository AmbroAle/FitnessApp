import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{
        headerShown: false, 
        tabBarShowLabel: false,
        tabBarStyle: { 
          backgroundColor: '#121212', 
          borderTopColor: '#333'
        },
        tabBarActiveTintColor: '#1DB954', 
        tabBarInactiveTintColor: '#888',  
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ) 
        }} 
      />
      
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ) 
        }} 
      />
      
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ) 
        }} 
      />

    </Tabs>
  );
}