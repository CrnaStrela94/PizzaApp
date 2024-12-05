import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as React from 'react';
import HomeScreen from './pages/home';
import SettingsScreen from './pages/SettingsScreen';
import ShoppingCartScreen from './pages/ShoppingCartScreen';
import CartProvider from './CartContext';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <Drawer.Navigator initialRouteName="Home">
          <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="settings" component={SettingsScreen} />
          <Drawer.Screen name="ShoppingCart" component={ShoppingCartScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}
