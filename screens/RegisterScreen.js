
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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  
async function register() {
  console.log('1. Botão de cadastro acionado');

  if (!name.trim() || !email.trim() || !password) {
    Alert.alert('Atenção', 'Preencha todos os campos.');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  setLoading(true);

  try {
    console.log('2. Criando usuário no Authentication...');

    const credential = await firebase.auth()
      .createUserWithEmailAndPassword(
        email.trim().toLowerCase(),
        password
      );

    const uid = credential.user.uid;

    console.log('3. Usuário criado. UID:', uid);
    console.log(
      '4. Usuário autenticado:',
      firebase.auth().currentUser ? 'SIM' : 'NÃO'
    );

    console.log('5. Salvando perfil no banco...');

    await firebase.database()
      .ref('users/' + uid + '/profile')
      .set({
        displayName: name.trim(),
        createdAt: new Date().toISOString(),
      });

    console.log('6. Perfil salvo com sucesso!');

    Alert.alert(
      'Sucesso',
      'Conta criada e perfil salvo no banco de dados!'
    );

  } catch (error) {
    console.log('ERRO NO CADASTRO:', error.code, error.message);

    let message = 'Não foi possível concluir o cadastro.';

    if (error.code === 'auth/email-already-in-use') {
      message = 'Este e-mail já está cadastrado. Faça login.';
    } else if (error.code === 'auth/weak-password') {
      message = 'A senha é muito fraca.';
    } else if (error.code === 'auth/invalid-email') {
      message = 'O e-mail informado é inválido.';
    } else if (
      error.code === 'PERMISSION_DENIED' ||
      error.code === 'database/permission-denied'
    ) {
      message = 'A conta foi criada, mas o banco recusou a gravação. Verifique as regras.';
    }

    Alert.alert('Erro no cadastro', message);

  } finally {
    setLoading(false);
  }
}


  return (
    <View style={styles.container}>
      <Text style={styles.logo}>GhibliLog</Text>
      <Text style={styles.subtitle}>Crie sua conta</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Vamos começar!</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />

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
          placeholder="Senha (mínimo 6 caracteres)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={register}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Criando conta...' : 'Criar conta'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>
            Já possui uma conta? Faça login
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
