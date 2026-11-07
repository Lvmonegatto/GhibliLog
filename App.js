
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Cores do aplicativo
const COLORS = {
  background: '#F5F1E8',
  primary: '#355C4B',
  secondary: '#A8B99C',
  white: '#FFFFFF',
  text: '#333333',
};

// Componente reutilizável para as telas provisórias
function BaseScreen({ title, description }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

// Telas principais
function CatalogScreen() {
  return (
    <BaseScreen
      title="Catálogo"
      description="Explore os filmes do Studio Ghibli."
    />
  );
}

function FavoritesScreen() {
  return (
    <BaseScreen
      title="Favoritos"
      description="Seus filmes favoritos aparecerão aqui."
    />
  );
}

function WatchlistScreen() {
  return (
    <BaseScreen
      title="Quero Assistir"
      description="Organize os filmes que deseja assistir."
    />
  );
}

function DiaryScreen() {
  return (
    <BaseScreen
      title="Meu Diário"
      description="Suas resenhas e experiências com os filmes."
    />
  );
}

function StatisticsScreen() {
  return (
    <BaseScreen
      title="Estatísticas"
      description="Acompanhe suas atividades no GhibliLog."
    />
  );
}

// Telas secundárias
function FilmDetailScreen() {
  return (
    <BaseScreen
      title="Detalhes do Filme"
      description="Informações completas sobre o filme."
    />
  );
}

function ReviewFormScreen() {
  return (
    <BaseScreen
      title="Nova Resenha"
      description="Registre sua experiência com o filme."
    />
  );
}

function ReviewDetailScreen() {
  return (
    <BaseScreen
      title="Detalhes da Resenha"
      description="Visualize sua resenha."
    />
  );
}

// Navegação das cinco abas
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: {
          backgroundColor: COLORS.background,
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarStyle: {
          backgroundColor: COLORS.white,
          height: 65,
          paddingBottom: 8,
          paddingTop: 5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#999999',
        tabBarLabelStyle: {
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Catálogo':
              iconName = 'film-outline';
              break;
            case 'Favoritos':
              iconName = 'heart-outline';
              break;
            case 'Quero Assistir':
              iconName = 'bookmark-outline';
              break;
            case 'Diário':
              iconName = 'book-outline';
              break;
            case 'Estatísticas':
              iconName = 'stats-chart-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Catálogo" component={CatalogScreen} />
      <Tab.Screen name="Favoritos" component={FavoritesScreen} />
      <Tab.Screen name="Quero Assistir" component={WatchlistScreen} />
      <Tab.Screen name="Diário" component={DiaryScreen} />
      <Tab.Screen name="Estatísticas" component={StatisticsScreen} />
    </Tab.Navigator>
  );
}

// Navegação principal
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background,
          },
          headerTintColor: COLORS.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: COLORS.background,
          },
        }}
      >
        <Stack.Screen
          name="Principal"
          component={TabNavigator}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Detalhes do Filme"
          component={FilmDetailScreen}
        />

        <Stack.Screen
          name="Nova Resenha"
          component={ReviewFormScreen}
        />

        <Stack.Screen
          name="Detalhes da Resenha"
          component={ReviewDetailScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 23,
  },
});
