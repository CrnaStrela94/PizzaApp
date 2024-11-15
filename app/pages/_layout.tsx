import { Drawer } from 'expo-router/drawer';

export default function Layout() {
  return (
    <Drawer initialRouteName="Home">
      <Drawer.Screen name="Home" options={{ title: 'Home' }} />
      <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
    </Drawer>
  );
}