import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import SeletorData from '../components/SeletorData';
import { adicionarResenha } from '../services/gerenciadorResenhas';

function obterDataAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function validarData(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    return false;
  }

  const [ano, mes, dia] = data.split('-').map(Number);

  const dataVerificada = new Date(ano, mes - 1, dia);

  const dataExiste =
    dataVerificada.getFullYear() === ano &&
    dataVerificada.getMonth() === mes - 1 &&
    dataVerificada.getDate() === dia;

  if (!dataExiste) {
    return false;
  }

  const hoje = new Date();

  const dataAtual = `${hoje.getFullYear()}-${String(
    hoje.getMonth() + 1
  ).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  return data <= dataAtual;
}

export default function TelaFormularioResenha({ route, navigation }) {
  const { filme } = route.params;

  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState('');
  const [dataAssistida, setDataAssistida] = useState(obterDataAtual());
  const [carregando, setCarregando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvarResenha() {
    if (carregando) {
      return;
    }

    if (nota === 0) {
      Alert.alert('Atenção', 'Selecione uma nota para o filme.');
      return;
    }

    if (!texto.trim()) {
      Alert.alert('Atenção', 'Escreva sua resenha antes de salvar.');
      return;
    }

    if (!validarData(dataAssistida)) {
      Alert.alert(
        'Data inválida',
        'Informe uma data válida no formato AAAA-MM-DD.'
      );
      return;
    }

    setCarregando(true);

    try {
      await adicionarResenha({
        filmId: filme.id,
        filmTitle: filme.title,
        filmImage: filme.image || '',
        rating: nota,
        reviewText: texto.trim(),
        watchedAt: dataAssistida,
      });

      setSalvo(true);
    } catch (error) {
      console.log('Erro ao salvar resenha:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível salvar sua resenha.'
      );
    } finally {
      setCarregando(false);
    }
  }

  if (salvo) {
    return (
      <View style={styles.confirmacao}>
        <View style={styles.iconeSucesso}>
          <Text style={styles.textoIcone}>✓</Text>
        </View>

        <Text style={styles.tituloConfirmacao}>Resenha salva!</Text>

        <Text style={styles.mensagemConfirmacao}>
          Sua avaliação de {filme.title} foi registrada com sucesso no seu
          diário.
        </Text>

        <View style={styles.resumoConfirmacao}>
          <Text style={styles.rotuloResumo}>SUA AVALIAÇÃO</Text>

          <Text style={styles.estrelasResumo}>
            {'★'.repeat(nota)}
            {'☆'.repeat(5 - nota)}
          </Text>

          <Text style={styles.dataResumo}>Assistido em {dataAssistida}</Text>
        </View>

        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}>
          <Text style={styles.textoBotao}>Voltar ao filme</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.titulo}>Nova Resenha</Text>

      <Text style={styles.subtitulo}>
        Registre sua experiência com o filme.
      </Text>

      <View style={styles.cardFilme}>
        <Text style={styles.rotulo}>FILME SELECIONADO</Text>

        <Text style={styles.nomeFilme}>{filme.title}</Text>

        <Text style={styles.diretor}>
          {filme.director || 'Diretor não informado'}
        </Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Sua avaliação</Text>

        <Text style={styles.instrucao}>
          Que nota você daria para esse filme?
        </Text>

        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map((numero) => (
            <TouchableOpacity
              key={numero}
              onPress={() => setNota(numero)}
              activeOpacity={0.7}>
              <Text
                style={[styles.estrela, numero <= nota && styles.estrelaAtiva]}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.textoNota}>
          {nota === 0 ? 'Selecione sua nota' : `${nota} de 5 estrelas`}
        </Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Sua opinião</Text>

        <TextInput
          style={styles.campoResenha}
          placeholder="O que você achou do filme? Conte sua experiência..."
          value={texto}
          onChangeText={setTexto}
          multiline
          textAlignVertical="top"
          maxLength={1500}
        />

        <Text style={styles.contador}>{texto.length}/1500 caracteres</Text>
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Quando você assistiu?</Text>

        <SeletorData value={dataAssistida} onChange={setDataAssistida} />

        <Text style={styles.instrucao}>
          Informe a data no formato ano-mês-dia.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.botaoSalvar, carregando && styles.botaoDesabilitado]}
        onPress={salvarResenha}
        disabled={carregando}
        activeOpacity={0.8}>
        {carregando ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.textoBotao}>Salvar resenha</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },

  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#355C4B',
  },

  subtitulo: {
    fontSize: 14,
    color: '#888888',
    marginTop: 6,
    marginBottom: 22,
  },

  cardFilme: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 25,
  },

  rotulo: {
    fontSize: 11,
    color: '#999999',
    fontWeight: 'bold',
    marginBottom: 8,
  },

  nomeFilme: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#355C4B',
  },

  diretor: {
    color: '#888888',
    marginTop: 5,
  },

  secao: {
    marginBottom: 24,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#355C4B',
    marginBottom: 8,
  },

  instrucao: {
    color: '#888888',
    fontSize: 13,
  },

  estrelas: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 12,
  },

  estrela: {
    fontSize: 39,
    color: '#D5D5D5',
  },

  estrelaAtiva: {
    color: '#E5AC45',
  },

  textoNota: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 8,
  },

  campoResenha: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    minHeight: 150,
    fontSize: 15,
    color: '#333333',
    marginTop: 8,
  },

  contador: {
    textAlign: 'right',
    color: '#999999',
    fontSize: 11,
    marginTop: 5,
  },

  campoData: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 15,
    color: '#333333',
    marginTop: 8,
  },

  botaoSalvar: {
    backgroundColor: '#355C4B',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 5,
    width: '100%',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  confirmacao: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  iconeSucesso: {
    width: 85,
    height: 85,
    borderRadius: 43,
    backgroundColor: '#DDE5D8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 22,
  },

  textoIcone: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#355C4B',
  },

  tituloConfirmacao: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#355C4B',
    textAlign: 'center',
    marginBottom: 12,
  },

  mensagemConfirmacao: {
    fontSize: 15,
    color: '#777777',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 25,
  },

  resumoConfirmacao: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
  },

  rotuloResumo: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#999999',
    marginBottom: 10,
  },

  estrelasResumo: {
    fontSize: 27,
    color: '#E5AC45',
    letterSpacing: 3,
  },

  dataResumo: {
    fontSize: 13,
    color: '#888888',
    marginTop: 10,
  },
});
