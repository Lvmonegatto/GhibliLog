
import React, {
  useCallback,
  useState,
} from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

import {
  buscarResenhas,
  removerResenha,
} from '../services/gerenciadorResenhas';

// Formata a data para o padrão brasileiro
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

export default function TelaDiario({ navigation }) {
  const [resenhas, setResenhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState(null);

  // Atualiza as resenhas sempre que a aba recebe foco
  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      async function carregarResenhas() {
        try {
          setCarregando(true);

          const resultado = await buscarResenhas();

          if (ativo) {
            // Ordena da resenha mais recente para a mais antiga
            resultado.sort((a, b) => {
              const dataA = new Date(
                a.createdAt || a.watchedAt
              ).getTime();

              const dataB = new Date(
                b.createdAt || b.watchedAt
              ).getTime();

              return dataB - dataA;
            });

            setResenhas(resultado);
          }
        } catch (error) {
          console.log('Erro ao carregar diário:', error);

          if (ativo) {
            Alert.alert(
              'Erro',
              'Não foi possível carregar suas resenhas.'
            );
          }
        } finally {
          if (ativo) {
            setCarregando(false);
          }
        }
      }

      carregarResenhas();

      return () => {
        ativo = false;
      };
    }, [])
  );

  // Abre os detalhes da resenha selecionada
  function abrirDetalhes(resenha) {
    navigation.navigate('Detalhes da Resenha', {
      resenha,
    });
  }

  // Exclui a resenha do Firebase
  async function executarExclusao(resenha) {
    if (excluindoId) {
      return;
    }

    setExcluindoId(resenha.id);

    try {
      await removerResenha(resenha.id);

      // Remove o cartão imediatamente da tela
      setResenhas(resenhasAtuais =>
        resenhasAtuais.filter(
          item => item.id !== resenha.id
        )
      );

      Alert.alert(
        'Sucesso',
        'Sua resenha foi excluída do diário.'
      );
    } catch (error) {
      console.log('Erro ao excluir resenha:', error);

      Alert.alert(
        'Erro',
        error.message || 'Não foi possível excluir a resenha.'
      );
    } finally {
      setExcluindoId(null);
    }
  }

  // Solicita confirmação antes de excluir
  function confirmarExclusao(resenha) {
    Alert.alert(
      'Excluir resenha',
      `Deseja realmente excluir sua resenha de "${resenha.filmTitle}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => executarExclusao(resenha),
        },
      ]
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.titulo}>
          Meu Diário
        </Text>

        <Text style={styles.subtitulo}>
          Todas as suas experiências com os filmes.
        </Text>

        <View style={styles.resumo}>
          <Text style={styles.numeroResenhas}>
            {resenhas.length}
          </Text>

          <Text style={styles.textoResumo}>
            {resenhas.length === 1
              ? 'resenha registrada'
              : 'resenhas registradas'}
          </Text>
        </View>

        {carregando ? (
          <View style={styles.estadoCarregamento}>
            <ActivityIndicator
              size="large"
              color="#355C4B"
            />

            <Text style={styles.textoCarregamento}>
              Carregando seu diário...
            </Text>
          </View>
        ) : resenhas.length === 0 ? (
          <View style={styles.estadoVazio}>
            <Text style={styles.iconeVazio}>
              📖
            </Text>

            <Text style={styles.tituloVazio}>
              Seu diário está vazio
            </Text>

            <Text style={styles.textoVazio}>
              Escreva uma resenha sobre um filme
              que você assistiu para começar
              a registrar suas experiências.
            </Text>
          </View>
        ) : (
          <View style={styles.lista}>
            {resenhas.map(resenha => (
              <View
                key={resenha.id}
                style={styles.card}
              >
                {/* Área clicável para abrir os detalhes */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => abrirDetalhes(resenha)}
                  disabled={excluindoId === resenha.id}
                >
                  <View style={styles.cabecalhoCard}>
                    {resenha.filmImage ? (
                      <Image
                        source={{ uri: resenha.filmImage }}
                        style={styles.poster}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.posterAlternativo}>
                        <Text style={styles.textoPoster}>
                          Sem imagem
                        </Text>
                      </View>
                    )}

                    <View style={styles.informacoes}>
                      <Text style={styles.nomeFilme}>
                        {resenha.filmTitle}
                      </Text>

                      <Text style={styles.data}>
                        Assistido em {formatarData(resenha.watchedAt)}
                      </Text>

                      <View style={styles.avaliacao}>
                        <Text style={styles.estrelas}>
                          {'★'.repeat(resenha.rating || 0)}
                          {'☆'.repeat(5 - (resenha.rating || 0))}
                        </Text>

                        <Text style={styles.nota}>
                          {resenha.rating}/5
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divisor} />

                  <Text style={styles.rotuloResenha}>
                    MINHA RESENHA
                  </Text>

                  <Text style={styles.textoResenha}>
                    {resenha.reviewText}
                  </Text>

                  <Text style={styles.linkDetalhes}>
                    Ver detalhes →
                  </Text>
                </TouchableOpacity>

                {/* Botão de exclusão */}
                <View style={styles.areaExcluir}>
                  <TouchableOpacity
                    style={[
                      styles.botaoExcluir,
                      excluindoId === resenha.id &&
                        styles.botaoDesabilitado,
                    ]}
                    activeOpacity={0.7}
                    onPress={() => confirmarExclusao(resenha)}
                    disabled={excluindoId !== null}
                  >
                    {excluindoId === resenha.id ? (
                      <ActivityIndicator
                        size="small"
                        color="#C65B65"
                      />
                    ) : (
                      <Text style={styles.textoExcluir}>
                        Excluir resenha
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },

  conteudo: {
    padding: 20,
    paddingBottom: 35,
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
    marginBottom: 20,
  },

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DDE5D8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 22,
  },

  numeroResenhas: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#355C4B',
    marginRight: 10,
  },

  textoResumo: {
    fontSize: 14,
    color: '#526B58',
  },

  estadoCarregamento: {
    paddingVertical: 60,
    alignItems: 'center',
  },

  textoCarregamento: {
    color: '#888888',
    marginTop: 12,
    fontSize: 14,
  },

  estadoVazio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 10,
  },

  iconeVazio: {
    fontSize: 45,
    marginBottom: 15,
  },

  tituloVazio: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#355C4B',
    marginBottom: 10,
  },

  textoVazio: {
    color: '#888888',
    textAlign: 'center',
    lineHeight: 22,
    fontSize: 14,
  },

  lista: {
    gap: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
  },

  cabecalhoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  poster: {
    width: 95,
    height: 135,
    borderRadius: 9,
    backgroundColor: '#E5E5E5',
  },

  posterAlternativo: {
    width: 95,
    height: 135,
    borderRadius: 9,
    backgroundColor: '#DDE5D8',
    justifyContent: 'center',
    alignItems: 'center',
  },

  textoPoster: {
    color: '#355C4B',
    fontSize: 11,
  },

  informacoes: {
    flex: 1,
    marginLeft: 14,
  },

  nomeFilme: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#355C4B',
  },

  data: {
    fontSize: 12,
    color: '#888888',
    marginTop: 8,
  },

  avaliacao: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },

  estrelas: {
    color: '#E5AC45',
    fontSize: 18,
    letterSpacing: 1,
  },

  nota: {
    color: '#777777',
    fontSize: 12,
    marginLeft: 6,
  },

  divisor: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 15,
  },

  rotuloResenha: {
    color: '#999999',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 7,
  },

  textoResenha: {
    color: '#555555',
    fontSize: 14,
    lineHeight: 22,
  },

  linkDetalhes: {
    color: '#355C4B',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 15,
    textAlign: 'right',
  },

  areaExcluir: {
    alignItems: 'flex-end',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },

  botaoExcluir: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    minWidth: 110,
    alignItems: 'center',
  },

  textoExcluir: {
    color: '#C65B65',
    fontSize: 13,
    fontWeight: 'bold',
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },
});
