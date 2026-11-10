import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { vibrarAdicao, vibrarRemocao } from '../services/feedbackVibracao';

import {
  adicionarFilme,
  removerFilme,
  verificarFilme,
} from '../services/gerenciadorFilmes';

export default function TelaDetalhesFilme({ route, navigation }) {
  const { filme } = route.params;

  const [favorito, setFavorito] = useState(false);
  const [naLista, setNaLista] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    async function verificarListas() {
      try {
        const [estaFavoritado, estaNaLista] = await Promise.all([
          verificarFilme('favorites', filme.id),
          verificarFilme('watchlist', filme.id),
        ]);

        setFavorito(estaFavoritado);
        setNaLista(estaNaLista);
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível consultar suas listas.');
      } finally {
        setCarregando(false);
      }
    }

    verificarListas();
  }, [filme.id]);

  async function alternarLista(lista, estadoAtual, atualizarEstado) {
    if (atualizando) return;

    setAtualizando(true);

    try {
      if (estadoAtual) {
        await removerFilme(lista, filme.id);
        atualizarEstado(false);

        vibrarRemocao();

        Alert.alert('Sucesso', 'Filme removido da sua lista.');
      } else {
        await adicionarFilme(lista, filme);
        atualizarEstado(true);

        vibrarAdicao();

        Alert.alert('Sucesso', 'Filme adicionado à sua lista!');
      }
    } catch (error) {
      console.log('Erro ao atualizar lista:', error);

      Alert.alert(
        'Erro',
        'Não foi possível atualizar sua lista. Tente novamente.'
      );
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}>
      {filme.image ? (
        <View style={styles.areaPoster}>
          <Image
            source={{ uri: filme.image }}
            style={styles.posterFundo}
            resizeMode="cover"
            blurRadius={18}
          />

          <View style={styles.sobreposicaoPoster} />

          <Image
            source={{ uri: filme.image }}
            style={styles.poster}
            resizeMode="contain"
          />
        </View>
      ) : (
        <View style={styles.posterAlternativo}>
          <Text style={styles.semImagem}>Imagem indisponível</Text>
        </View>
      )}

      <View style={styles.informacoes}>
        <Text style={styles.titulo}>{filme.title}</Text>

        <Text style={styles.tituloOriginal}>{filme.original_title}</Text>

        <View style={styles.dados}>
          <View style={styles.dado}>
            <Text style={styles.rotulo}>Lançamento</Text>
            <Text style={styles.valor}>{filme.release_date}</Text>
          </View>

          <View style={styles.dado}>
            <Text style={styles.rotulo}>Diretor</Text>
            <Text style={styles.valor}>{filme.director}</Text>
          </View>

          <View style={styles.dado}>
            <Text style={styles.rotulo}>Duração</Text>
            <Text style={styles.valor}>{filme.running_time} minutos</Text>
          </View>
        </View>

        <Text style={styles.tituloSecao}>Sobre o filme</Text>

        <Text style={styles.descricao}>{filme.description}</Text>

        <Text style={styles.tituloSecao}>Minhas listas</Text>

        {carregando ? (
          <ActivityIndicator
            size="large"
            color="#355C4B"
            style={styles.carregamento}
          />
        ) : (
          <>
            <TouchableOpacity
              style={[styles.botao, favorito && styles.botaoFavoritoAtivo]}
              disabled={atualizando}
              onPress={() => alternarLista('favorites', favorito, setFavorito)}>
              <Text style={styles.icone}>{favorito ? '♥' : '♡'}</Text>

              <Text style={styles.textoBotao}>
                {favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, naLista && styles.botaoListaAtivo]}
              disabled={atualizando}
              onPress={() => alternarLista('watchlist', naLista, setNaLista)}>
              <Text style={styles.icone}>{naLista ? '✓' : '+'}</Text>

              <Text style={styles.textoBotao}>
                {naLista
                  ? 'Remover de Quero Assistir'
                  : 'Adicionar a Quero Assistir'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => navigation.navigate('Nova Resenha', { filme })}>
              <Text style={styles.textoBotao}>Escrever uma resenha</Text>
            </TouchableOpacity>

            {atualizando && (
              <ActivityIndicator color="#355C4B" style={{ marginTop: 12 }} />
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  conteudo: {
    paddingBottom: 30,
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
  semImagem: {
    color: '#355C4B',
  },
  informacoes: {
    padding: 20,
  },
  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  tituloOriginal: {
    fontSize: 15,
    color: '#888888',
    marginTop: 5,
  },
  dados: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    gap: 13,
  },
  dado: {
    gap: 3,
  },
  rotulo: {
    fontSize: 12,
    color: '#888888',
  },
  valor: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '600',
  },
  tituloSecao: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#355C4B',
    marginTop: 25,
    marginBottom: 10,
  },
  descricao: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 23,
    textAlign: 'justify',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A8B99C',
  },
  botaoFavoritoAtivo: {
    backgroundColor: '#F7E4E5',
    borderColor: '#C65B65',
  },
  botaoListaAtivo: {
    backgroundColor: '#DDE5D8',
    borderColor: '#355C4B',
  },
  icone: {
    fontSize: 20,
    marginRight: 10,
    color: '#355C4B',
  },
  textoBotao: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  carregamento: {
    marginVertical: 20,
  },
});
