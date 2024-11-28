import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';
import { CartProvider } from './CartContext';
import HomeScreen from './pages/home';
import SettingsScreen from './pages/SettingsScreen';
import ShoppingCartScreen from './pages/ShoppingCartScreen';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <CartProvider>
      <Drawer.Navigator initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="settings" component={SettingsScreen} />
        <Drawer.Screen name="ShoppingCart" component={ShoppingCartScreen} />
      </Drawer.Navigator>
    </CartProvider>
  );
}
