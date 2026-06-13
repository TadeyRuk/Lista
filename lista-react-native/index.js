// Polyfills required by @stellar/stellar-sdk in React Native.
// MUST be imported before anything that touches the SDK / crypto.
import 'react-native-get-random-values';

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
