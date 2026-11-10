
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import firebase from '../config/config';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function login() {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);

    firebase.auth()
      .signInWithEmailAndPassword(
        email.trim().toLowerCase(),
        password
      )
      .catch(error => {
        console.log('Erro no login:', error.code, error.message);

        let message = 'Não foi possível realizar o login.';

        if (
          error.code === 'auth/user-not-found' ||
          error.code === 'auth/invalid-credential'
        ) {
          message = 'E-mail ou senha incorretos.';
        } else if (error.code === 'auth/wrong-password') {
          message = 'Senha incorreta.';
        } else if (error.code === 'auth/invalid-email') {
          message = 'O e-mail informado é inválido.';
        } else if (error.code === 'auth/user-disabled') {
          message = 'Esta conta foi desativada.';
        }

        Alert.alert('Erro no login', message);
      })
      .finally(() => setLoading(false));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>GhibliLog</Text>

        <Text style={styles.subtitle}>
          Seu diário de filmes
        </Text>

        <View style={styles.card}>
          <Text style={styles.title}>
            Bem-vindo de volta!
          </Text>

          <TextInput
            style={styles.input}
            placeholder="E-mail"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={login}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={login}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cadastro')}
          >
            <Text style={styles.link}>
              Não tem uma conta? Cadastre-se
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 35,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#355C4B',
    textAlign: 'center',
  },
  subtitle: {
    color: '#777777',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 35,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#355C4B',
    marginBottom: 22,
  },
  input: {
    backgroundColor: '#F5F1E8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 14,
    fontSize: 15,
    color: '#333333',
  },
  button: {
    backgroundColor: '#355C4B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#355C4B',
    textAlign: 'center',
    marginTop: 22,
  },
});
