import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import appJson from '../app.json';

AppRegistry.registerComponent(appJson.expo.name, () => App);

export default App;