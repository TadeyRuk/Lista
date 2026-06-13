import 'react-native-gesture-handler';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';

import { AppProvider } from './src/context/AppContext';
import { colors } from './src/theme';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import TabViewerScreen from './src/screens/TabViewerScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import BayadScreen from './src/screens/BayadScreen';
import ReceiptScreen from './src/screens/ReceiptScreen';
import CustomerScreen from './src/screens/CustomerScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.navyDeep, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Onboarding"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.paper },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="TabViewer" component={TabViewerScreen} />
            <Stack.Screen name="Scanner" component={ScannerScreen} options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="AddItem" component={AddItemScreen} />
            <Stack.Screen name="Bayad" component={BayadScreen} />
            <Stack.Screen name="Receipt" component={ReceiptScreen} />
            <Stack.Screen name="Customer" component={CustomerScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
