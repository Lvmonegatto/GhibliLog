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

import { registerUser } from "@/services/auth";

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function handleCadastro() {
    setErro("");

    if (!nome.trim() || !email.trim() || !senha) {
      setErro("Preencha nome, e-mail e senha.");
      return;
    }

    setCarregando(true);

    try {
      await registerUser({ name: nome, email, password: senha });
      router.replace("/");
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a conta.",
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Criar conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
        autoCapitalize="words"
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
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      {erro ? <Text style={styles.erro}>{erro}</Text> : null}

      <Pressable
        style={styles.botao}
        onPress={handleCadastro}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.textoBotao}>Cadastrar</Text>
        )}
      </Pressable>
      <Link href="/(auth)/login">Já tem conta? Entrar</Link>
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
  titulo: {
    fontSize: 28,
    fontWeight: "bold",
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
