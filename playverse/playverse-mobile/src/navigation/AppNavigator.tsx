// playverse/playverse-mobile/src/navigation/AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import GameDetailScreen from '../screens/GameDetailScreen';
import CatalogScreen from '../screens/CatalogScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyGamesScreen from '../screens/MyGamesScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

import BottomTabBar from './BottomTabBar';
import HeaderBar from '../components/HeaderBar';

// Stack tipado. El Tab queda SIN genéricos para evitar choques.
export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  GameDetail: { gameId: string; initial?: any };
  AuthCallback: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TITLES: Record<string, string> = {
  Home: 'Inicio',
  Catalog: 'Catálogo',
  MyGames: 'Mis juegos',
  Favorites: 'Favoritos',
  Profile: 'Perfil',
};

// 👇 Wrapper *función* estricta. NO es un componente, NO usa tipos de RN.
type TabBarFn = (props: any) => React.ReactNode;
const renderTabBar: TabBarFn = (props) => <BottomTabBar {...props} />;

function Tabs(): React.ReactElement {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      // 👈 PASAR UNA FUNCIÓN, NO <BottomTabBar />
      tabBar={renderTabBar}
      screenOptions={({ route, navigation }) => ({
        headerShown: true,
        header: () => (
          <HeaderBar
            title={TITLES[route.name] ?? route.name}
            onBellPress={() => navigation.navigate('Notifications' as never)}
          />
        ),
      })}
    >
      <Tab.Screen name="MyGames" component={MyGamesScreen} options={{ title: 'Mis juegos' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catálogo' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favoritos' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator(): React.ReactElement {
  return (
    <Stack.Navigator initialRouteName="Tabs" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Tabs" component={Tabs} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
