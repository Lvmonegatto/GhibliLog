import React, { useEffect, useState } from 'react';

import { View, ActivityIndicator } from 'react-native';

import firebase from './config/config';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import TelaCatalogo from './screens/TelaCatalogo';
import TelaDetalhesFilme from './screens/TelaDetalhesFilme';
import TelaFavoritos from './screens/TelaFavoritos';
import TelaQueroAssistir from './screens/TelaQueroAssistir';
import TelaFormularioResenha from './screens/TelaFormularioResenha';
import TelaDiario from './screens/TelaDiario';
import TelaDetalhesResenha from './screens/TelaDetalhesResenha';
import TelaEstatisticas from './screens/TelaEstatisticas';
import TelaPerfil from './screens/TelaPerfil';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Ionicons } from '@expo/vector-icons';
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const COLORS = {
  background: '#F5F1E8',
  primary: '#355C4B',
  secondary: '#A8B99C',
  white: '#FFFFFF',
  text: '#333333',
};

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
              case 'Perfil':
              iconName = 'person-circle-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Catálogo" component={TelaCatalogo} />
      <Tab.Screen name="Favoritos" component={TelaFavoritos} />
      <Tab.Screen name="Quero Assistir" component={TelaQueroAssistir} />
      <Tab.Screen name="Diário" component={TelaDiario} />
      <Tab.Screen name="Estatísticas" component={TelaEstatisticas} />
      <Tab.Screen name="Perfil" component={TelaPerfil} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoAutenticacao, setVerificandoAutenticacao] = useState(true);

  useEffect(() => {
    const cancelarObservacao = firebase
      .auth()
      .onAuthStateChanged((usuarioAtual) => {
        setUsuario(usuarioAtual);
        setVerificandoAutenticacao(false);
      });

    return cancelarObservacao;
  }, []);

  if (verificandoAutenticacao) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

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
        }}>
        {usuario ? (
          <>
            <Stack.Screen
              name="Principal"
              component={TabNavigator}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Detalhes do Filme"
              component={TelaDetalhesFilme}
            />

            <Stack.Screen
              name="Nova Resenha"
              component={TelaFormularioResenha}
              options={{ title: 'Nova Resenha' }}
            />
            <Stack.Screen
              name="Detalhes da Resenha"
              component={TelaDetalhesResenha}
              options={{ title: 'Detalhes da Resenha' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="Cadastro"
              component={RegisterScreen}
              options={{ title: 'Criar conta' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
