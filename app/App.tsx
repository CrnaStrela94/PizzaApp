import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CartProvider from './CartContext';
import HomeScreen from './pages/homeScreen';
import ReviewPage from './pages/reviewScreen';
import SettingsScreen from './pages/SettingsScreen';
import ShoppingCartScreen from './pages/ShoppingCartScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <CartProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName: string = '';

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'ShoppingCart') {
              iconName = 'cart';
            } else if (route.name === 'Review') {
              iconName = 'create';
            } else if (route.name === 'Settings') {
              iconName = 'settings';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="ShoppingCart" component={ShoppingCartScreen} />
        <Tab.Screen name="Review" component={ReviewPage} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </CartProvider>
  );
}
