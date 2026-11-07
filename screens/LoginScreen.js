
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
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
  console.log('Erro no cadastro:', error.code, error.message);

  let message = 'Não foi possível criar sua conta.';

  if (error.code === 'auth/email-already-in-use') {
    message = 'Este e-mail já está cadastrado.';
  } else if (error.code === 'auth/weak-password') {
    message = 'A senha é muito fraca.';
  } else if (error.code === 'auth/invalid-email') {
    message = 'O e-mail informado é inválido.';
  } else if (
    error.code === 'PERMISSION_DENIED' ||
    error.code === 'database/permission-denied'
  ) {
    message = 'Conta criada, mas não foi possível salvar o perfil. Verifique as regras do banco.';
  }

  Alert.alert('Erro no cadastro', message);
})
      .finally(() => setLoading(false));
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GhibliLog</Text>
      <Text style={styles.subtitle}>Seu diário de filmes</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Bem-vindo de volta!</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={login}
          disabled={loading}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#355C4B',
    textAlign: 'center',
  },
  subtitle: {
    color: '#777',
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
  },
  button: {
    backgroundColor: '#355C4B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
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
