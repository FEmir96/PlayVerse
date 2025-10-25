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

// ----------------- Tipos del Stack raíz -----------------
export type RootStackParamList = {
  Login: undefined;
  Tabs: undefined;
  GameDetail: { gameId: string; initial?: any };
  AuthCallback: undefined;
  Notifications: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Stacks anidados para PERFIL y FAVORITOS
const ProfileStack = createNativeStackNavigator();
const FavoritesStack = createNativeStackNavigator();

function withPVHeader() {
  return {
    headerShown: true,
    title: '' as const,
    headerTitle: '' as const,
    header: ({ navigation, back }: any) => (
      <HeaderBar
        showBack={!!back}
        onBackPress={() => navigation.goBack()}
        showBell
        onBellPress={() => navigation.navigate('Notifications' as never)}
      />
    ),
  };
}

function ProfileStackNavigator(): React.ReactElement {
  return (
    <ProfileStack.Navigator screenOptions={withPVHeader()}>
      <ProfileStack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{ title: '', headerTitle: '' }}
      />
    </ProfileStack.Navigator>
  );
}

function FavoritesStackNavigator(): React.ReactElement {
  return (
    <FavoritesStack.Navigator screenOptions={withPVHeader()}>
      <FavoritesStack.Screen
        name="FavoritesHome"
        component={FavoritesScreen}
        options={{ title: '', headerTitle: '' }}
      />
    </FavoritesStack.Navigator>
  );
}

// ----------------- Tabs -----------------
type TabBarFn = (props: any) => React.ReactNode;
const renderTabBar: TabBarFn = (props) => <BottomTabBar {...props} />;

function Tabs(): React.ReactElement {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        title: '',
        headerTitle: '',
        header: () => (
          <HeaderBar
            showBack={false}
            showBell
            onBellPress={() => navigation.navigate('Notifications' as never)}
          />
        ),
      })}
    >
      <Tab.Screen name="MyGames" component={MyGamesScreen} options={{ title: '', headerTitle: '' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: '', headerTitle: '' }} />
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '', headerTitle: '' }} />

      {/* Estas usan su propio stack con el mismo header PV */}
      <Tab.Screen
        name="Favorites"
        component={FavoritesStackNavigator}
        options={{ headerShown: false, title: '', headerTitle: '' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{ headerShown: false, title: '', headerTitle: '' }}
      />
    </Tab.Navigator>
  );
}

// ----------------- Stack raíz -----------------
export default function AppNavigator(): React.ReactElement {
  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: true,
        title: '',
        headerTitle: '',
        header: ({ navigation, back }) => (
          <HeaderBar
            showBack={!!back}
            onBackPress={() => navigation.goBack()}
            showBell
            onBellPress={() => navigation.navigate('Notifications' as never)}
          />
        ),
      }}
    >
      <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GameDetail" component={GameDetailScreen} />
      <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
