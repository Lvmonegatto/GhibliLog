import React, { useEffect, useState, useRef } from 'react';

import {
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import SeletorData from '../components/SeletorData';
import {
  buscarResenhaPorId,
  atualizarResenha,
  removerResenha,
} from '../services/gerenciadorResenhas';

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

function formatarData(data) {
  if (!data) {
    return 'Data não informada';
  }

  const partes = data.split('-');

  if (partes.length === 3) {
    return `${partes[2].substring(0, 2)}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

export default function TelaDetalhesResenha({ route, navigation }) {
  const resenhaInicial = route.params.resenha;

  const scrollRef = useRef(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [resenha, setResenha] = useState(resenhaInicial);
  const [nota, setNota] = useState(resenhaInicial.rating || 0);
  const [texto, setTexto] = useState(resenhaInicial.reviewText || '');
  const [dataAssistida, setDataAssistida] = useState(
    resenhaInicial.watchedAt || ''
  );

  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [carregandoTela, setCarregandoTela] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarResenha() {
      try {
        const resultado = await buscarResenhaPorId(resenhaInicial.id);

        if (ativo && resultado) {
          setResenha(resultado);
          setNota(resultado.rating || 0);
          setTexto(resultado.reviewText || '');
          setDataAssistida(resultado.watchedAt || '');
        }
      } catch (error) {
        console.log('Erro ao carregar resenha:', error);

        if (ativo) {
          Alert.alert(
            'Erro',
            'Não foi possível carregar os detalhes da resenha.'
          );
        }
      } finally {
        if (ativo) {
          setCarregandoTela(false);
        }
      }
    }

    carregarResenha();

    return () => {
      ativo = false;
    };
  }, [resenhaInicial.id]);

  async function salvarAlteracoes() {
    if (nota === 0) {
      Alert.alert('Atenção', 'Selecione uma nota para o filme.');
      return;
    }

    if (!texto.trim()) {
      Alert.alert('Atenção', 'A resenha não pode ficar vazia.');
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
      await atualizarResenha(resenha.id, {
        rating: nota,
        reviewText: texto.trim(),
        watchedAt: dataAssistida,
      });

      setResenha({
        ...resenha,
        rating: nota,
        reviewText: texto.trim(),
        watchedAt: dataAssistida,
        updatedAt: new Date().toISOString(),
      });

      setEditando(false);

      Alert.alert('Sucesso', 'Sua resenha foi atualizada!');
    } catch (error) {
      console.log('Erro ao atualizar resenha:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível atualizar sua resenha.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function cancelarEdicao() {
    setNota(resenha.rating || 0);
    setTexto(resenha.reviewText || '');
    setDataAssistida(resenha.watchedAt || '');
    setEditando(false);
  }

  function confirmarExclusao() {
    setMostrarConfirmacao(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    }, 600);
  }

  async function excluirResenha() {
    if (!resenha || !resenha.id) {
      console.log('ID da resenha inválido:', resenha);
      return;
    }

    setCarregando(true);

    try {
      console.log('Excluindo resenha:', resenha.id);

      await removerResenha(resenha.id);

      console.log('Resenha excluída com sucesso!');

      setMostrarConfirmacao(false);

      navigation.goBack();
    } catch (error) {
      console.log('Erro ao excluir resenha:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível excluir sua resenha.'
      );
    } finally {
      setCarregando(false);
    }
  }

  if (carregandoTela) {
    return (
      <View style={styles.carregamento}>
        <ActivityIndicator size="large" color="#355C4B" />

        <Text style={styles.textoCarregamento}>Carregando resenha...</Text>
      </View>
    );
  }

  if (!resenha) {
    return (
      <View style={styles.carregamento}>
        <Text style={styles.titulo}>Resenha não encontrada.</Text>

        <TouchableOpacity
          style={styles.botaoPrincipal}
          onPress={() => navigation.goBack()}>
          <Text style={styles.textoBotaoPrincipal}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {resenha.filmImage ? (
        <View style={styles.areaPoster}>
          <Image
            source={{ uri: resenha.filmImage }}
            style={styles.posterFundo}
            resizeMode="cover"
            blurRadius={18}
          />

          <View style={styles.sobreposicaoPoster} />

          <Image
            source={{ uri: resenha.filmImage }}
            style={styles.poster}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.posterAlternativo}>
          <Text style={styles.textoPoster}>Imagem indisponível</Text>
        </View>
      )}

      <View style={styles.informacoes}>
        <Text style={styles.tituloFilme}>{resenha.filmTitle}</Text>

        <Text style={styles.data}>
          Assistido em {formatarData(resenha.watchedAt)}
        </Text>

        <View style={styles.divisor} />

        {editando ? (
          <>
            <Text style={styles.tituloSecao}>Editar avaliação</Text>

            <Text style={styles.instrucao}>Selecione sua nova nota:</Text>

            <View style={styles.estrelas}>
              {[1, 2, 3, 4, 5].map((numero) => (
                <TouchableOpacity
                  key={numero}
                  onPress={() => setNota(numero)}
                  disabled={carregando}>
                  <Text
                    style={[
                      styles.estrela,
                      numero <= nota && styles.estrelaAtiva,
                    ]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.textoNota}>{nota} de 5 estrelas</Text>

            <Text style={styles.tituloSecao}>Sua opinião</Text>

            <TextInput
              style={styles.campoResenha}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escreva sua resenha..."
              multiline
              textAlignVertical="top"
              maxLength={1500}
            />

            <Text style={styles.contador}>{texto.length}/1500 caracteres</Text>

            <Text style={styles.tituloSecao}>Data em que assistiu</Text>

            <SeletorData value={dataAssistida} onChange={setDataAssistida} />

            <TouchableOpacity
              style={[
                styles.botaoPrincipal,
                carregando && styles.botaoDesabilitado,
              ]}
              onPress={salvarAlteracoes}
              disabled={carregando}>
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotaoPrincipal}>
                  Salvar alterações
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={cancelarEdicao}
              disabled={carregando}>
              <Text style={styles.textoCancelar}>Cancelar edição</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.tituloSecao}>Minha avaliação</Text>

            <View style={styles.avaliacao}>
              <Text style={styles.estrelas}>
                {'★'.repeat(resenha.rating || 0)}
                {'☆'.repeat(5 - (resenha.rating || 0))}
              </Text>

              <Text style={styles.nota}>{resenha.rating}/5</Text>
            </View>

            <Text style={styles.tituloSecao}>Minha resenha</Text>

            <View style={styles.cardResenha}>
              <Text style={styles.textoResenha}>{resenha.reviewText}</Text>
            </View>

            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={() => setEditando(true)}>
              <Text style={styles.textoBotaoPrincipal}>Editar resenha</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoExcluir}
              onPress={confirmarExclusao}
              disabled={carregando}>
              <Text style={styles.textoExcluir}>Excluir resenha</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      {mostrarConfirmacao && (
        <View style={styles.fundoConfirmacao}>
          <View style={styles.caixaConfirmacao}>
            <Text style={styles.tituloConfirmacao}>Excluir resenha?</Text>

            <Text style={styles.textoConfirmacao}>
              Tem certeza de que deseja excluir esta resenha? Essa ação não pode
              ser desfeita.
            </Text>

            <TouchableOpacity
              style={styles.botaoConfirmarExclusao}
              onPress={excluirResenha}
              disabled={carregando}>
              {carregando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.textoBotaoConfirmar}>
                  Confirmar exclusão
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelarConfirmacao}
              onPress={() => setMostrarConfirmacao(false)}
              disabled={carregando}>
              <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },

  conteudo: {
    paddingBottom: 35,
  },

  carregamento: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  textoCarregamento: {
    color: '#888888',
    marginTop: 12,
  },

  areaPoster: {
    width: '100%',
    height: 340,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  posterFundo: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  sobreposicaoPoster: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },

  poster: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  posterAlternativo: {
    height: 300,
    backgroundColor: '#DDE5D8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoPoster: {
    color: '#355C4B',
  },

  informacoes: {
    padding: 20,
  },

  tituloFilme: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#355C4B',
  },

  data: {
    fontSize: 13,
    color: '#888888',
    marginTop: 7,
  },

  divisor: {
    height: 1,
    backgroundColor: '#DDDDDD',
    marginVertical: 22,
  },

  tituloSecao: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#355C4B',
    marginTop: 18,
    marginBottom: 10,
  },

  instrucao: {
    color: '#888888',
    fontSize: 13,
  },

  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  estrelas: {
    fontSize: 29,
    color: '#E5AC45',
    letterSpacing: 2,
  },

  estrela: {
    fontSize: 39,
    color: '#D5D5D5',
  },

  estrelaAtiva: {
    color: '#E5AC45',
  },

  nota: {
    color: '#777777',
    fontSize: 14,
    marginLeft: 10,
  },

  textoNota: {
    textAlign: 'center',
    color: '#888888',
    marginTop: 8,
  },

  cardResenha: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginTop: 5,
  },

  textoResenha: {
    color: '#555555',
    fontSize: 15,
    lineHeight: 24,
  },

  campoResenha: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    minHeight: 150,
    fontSize: 15,
    color: '#333333',
    marginTop: 5,
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
    marginTop: 5,
  },

  botaoPrincipal: {
    backgroundColor: '#355C4B',
    padding: 17,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
  },

  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  botaoCancelar: {
    backgroundColor: '#DDE5D8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },

  textoCancelar: {
    color: '#355C4B',
    fontSize: 15,
    fontWeight: 'bold',
  },

  botaoExcluir: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#C65B65',
  },

  textoExcluir: {
    color: '#C65B65',
    fontSize: 15,
    fontWeight: 'bold',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },
  fundoConfirmacao: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
  },

  caixaConfirmacao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 22,
  },

  tituloConfirmacao: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#355C4B',
    marginBottom: 12,
  },

  textoConfirmacao: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
  },

  botaoConfirmarExclusao: {
    backgroundColor: '#C65B65',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  textoBotaoConfirmar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  botaoCancelarConfirmacao: {
    padding: 14,
    alignItems: 'center',
    marginTop: 5,
  },

  textoBotaoCancelar: {
    color: '#355C4B',
    fontWeight: 'bold',
  },
});
