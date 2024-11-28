import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

type RootStackParamList = {
  Home: undefined;
  settings: undefined;
};

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [paymentSettings, setPaymentSettings] = useState('');
  const [email, setEmail] = useState('');

  const handleSave = () => {
    // Handle save logic here
    console.log('Settings saved:', { username, firstName, lastName, password, paymentSettings, email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Settings</Text>
      <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} />
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Payment Settings"
        value={paymentSettings}
        onChangeText={setPaymentSettings}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <View style={styles.buttonsContainer}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Go to Home" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff3e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: '100%',
    height: 100,
    marginTop: 20,
  },
});
