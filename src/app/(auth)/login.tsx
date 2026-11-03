import { Link, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { loginUser } from "@/services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleLogin() {
    setErro("");

    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }

    setCarregando(true);

    try {
      await loginUser(email, senha);
      router.replace("/");
    } catch (error) {
      setErro(
        error instanceof Error ? error.message : "Não foi possível entrar.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.marca}>GhibliLog</Text>
      <Text style={styles.titulo}>Entrar</Text>

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
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable
        style={styles.botao}
        onPress={handleLogin}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Entrar</Text>
        )}
      </Pressable>

      <Link href="/(auth)/cadastro">Ainda não tem conta? Cadastre-se</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  marca: {
    fontSize: 28,
    fontWeight: "bold",
  },
  titulo: {
    fontSize: 20,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
  },
  erro: {
    color: "red",
  },
  botao: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#287a52",
    borderRadius: 8,
    padding: 12,
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "bold",
  },
});
