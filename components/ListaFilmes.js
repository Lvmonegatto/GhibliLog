import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

import { observarFilmes, removerFilme } from '../services/gerenciadorFilmes';

export default function ListaFilmes({ lista, titulo, navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelarObservacao;

    try {
      cancelarObservacao = observarFilmes(lista, (dados) => {
        setFilmes(dados);
        setCarregando(false);
      });
    } catch (error) {
      console.log('Erro ao carregar filmes:', error);
      setCarregando(false);
      Alert.alert('Erro', 'Não foi possível carregar seus filmes.');
    }

    return () => {
      if (cancelarObservacao) {
        cancelarObservacao();
      }
    };
  }, [lista]);

  async function excluirFilme(filme) {
    try {
      await removerFilme(lista, filme.id);
      Alert.alert('Sucesso', 'Filme removido da lista.');
    } catch (error) {
      console.log('Erro ao remover filme:', error);
      Alert.alert('Erro', 'Não foi possível remover o filme.');
    }
  }

  function confirmarRemocao(filme) {
    Alert.alert(
      'Remover filme',
      `Deseja remover "${filme.title}" da sua lista?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => excluirFilme(filme),
        },
      ]
    );
  }

  function renderizarFilme({ item }) {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.areaFilme}
          onPress={() =>
            navigation.navigate('Detalhes do Filme', {
              filme: item,
            })
          }>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.poster}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.posterAlternativo}>
              <Text style={styles.semImagem}>Sem imagem</Text>
            </View>
          )}

          <View style={styles.informacoes}>
            <Text style={styles.titulo} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.diretor}>{item.director}</Text>

            <Text style={styles.ano}>{item.release_date}</Text>

            <Text style={styles.verDetalhes}>Ver detalhes →</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoRemover}
          onPress={() => confirmarRemocao(item)}>
          <Text style={styles.textoRemover}>Remover</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#355C4B" />
        <Text style={styles.mensagemCarregamento}>Carregando filmes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.tituloPagina}>{titulo}</Text>
        <Text style={styles.quantidade}>
          {filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}
        </Text>
      </View>

      <FlatList
        data={filmes}
        keyExtractor={(item) => item.id}
        renderItem={renderizarFilme}
        contentContainerStyle={
          filmes.length === 0 ? styles.listaVazia : styles.lista
        }
        ListEmptyComponent={
          <View style={styles.centralizado}>
            <Text style={styles.iconeVazio}>
              {lista === 'favorites' ? '♡' : '▣'}
            </Text>

            <Text style={styles.tituloVazio}>Sua lista está vazia</Text>

            <Text style={styles.descricaoVazia}>
              Explore o catálogo e adicione filmes aqui.
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  cabecalho: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  tituloPagina: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  quantidade: {
    color: '#888888',
    marginTop: 5,
    fontSize: 13,
  },
  lista: {
    padding: 15,
    paddingBottom: 30,
  },
  listaVazia: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  areaFilme: {
    flexDirection: 'row',
  },
  poster: {
    width: 95,
    height: 130,
    borderRadius: 9,
    backgroundColor: '#E5E5E5',
  },
  posterAlternativo: {
    width: 95,
    height: 130,
    borderRadius: 9,
    backgroundColor: '#DDE5D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semImagem: {
    color: '#355C4B',
    fontSize: 11,
  },
  informacoes: {
    flex: 1,
    paddingLeft: 13,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  diretor: {
    fontSize: 13,
    color: '#666666',
    marginTop: 9,
  },
  ano: {
    fontSize: 13,
    color: '#888888',
    marginTop: 5,
  },
  verDetalhes: {
    fontSize: 13,
    color: '#355C4B',
    fontWeight: 'bold',
    marginTop: 12,
  },
  botaoRemover: {
    alignSelf: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8,
  },
  textoRemover: {
    color: '#B34E54',
    fontWeight: 'bold',
    fontSize: 13,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  mensagemCarregamento: {
    color: '#666666',
    marginTop: 12,
  },
  iconeVazio: {
    fontSize: 55,
    color: '#A8B99C',
  },
  tituloVazio: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#355C4B',
    marginTop: 15,
  },
  descricaoVazia: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 8,
  },
});
