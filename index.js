import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// El nombre del componente raíz ("Principal") debe coincidir con
// MainActivity.getMainComponentName() en el lado nativo (main/java/com/principal/MainActivity.java).
AppRegistry.registerComponent(appName, () => App);
