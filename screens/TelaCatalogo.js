
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';

const API_URL = 'https://ghibliapi.vercel.app/films';

export default function TelaCatalogo({ navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function buscarFilmes() {
    try {
      setErro('');
      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error('Não foi possível carregar os filmes.');
      }

      const dados = await resposta.json();
      setFilmes(dados);
    } catch (error) {
      setErro('Não foi possível carregar o catálogo. Verifique sua conexão.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    buscarFilmes();
  }, []);

  function renderizarFilme({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('Detalhes do Filme', { filme: item })
        }
      >
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.poster}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.posterAlternativo}>
            <Text style={styles.posterTexto}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.informacoes}>
          <Text style={styles.titulo} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.diretor}>
            {item.director}
          </Text>

          <Text style={styles.ano}>
            {item.release_date}
          </Text>
        </View>

        <Text style={styles.seta}>›</Text>
      </TouchableOpacity>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#355C4B" />
        <Text style={styles.mensagem}>Carregando filmes...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.centralizado}>
        <Text style={styles.mensagem}>{erro}</Text>

        <TouchableOpacity
          style={styles.botaoTentar}
          onPress={() => {
            setCarregando(true);
            buscarFilmes();
          }}
        >
          <Text style={styles.textoBotao}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.tituloPagina}>Universo Ghibli</Text>
        <Text style={styles.subtitulo}>
          Explore histórias que encantam gerações.
        </Text>
        <Text style={styles.contagem}>
          {filmes.length} filmes encontrados
        </Text>
      </View>

      <FlatList
        data={filmes}
        keyExtractor={(item) => item.id}
        renderItem={renderizarFilme}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={carregando}
            onRefresh={() => {
              setCarregando(true);
              buscarFilmes();
            }}
            colors={['#355C4B']}
          />
        }
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
    paddingBottom: 15,
  },
  tituloPagina: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  subtitulo: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  contagem: {
    fontSize: 12,
    color: '#355C4B',
    marginTop: 12,
    fontWeight: 'bold',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
  },
  poster: {
    width: 85,
    height: 115,
    borderRadius: 9,
    backgroundColor: '#E5E5E5',
  },
  posterAlternativo: {
    width: 85,
    height: 115,
    borderRadius: 9,
    backgroundColor: '#DDE5D8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterTexto: {
    fontSize: 11,
    color: '#355C4B',
  },
  informacoes: {
    flex: 1,
    marginLeft: 13,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#355C4B',
    marginBottom: 8,
  },
  diretor: {
    fontSize: 13,
    color: '#555555',
  },
  ano: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },
  seta: {
    fontSize: 27,
    color: '#A8B99C',
    paddingHorizontal: 7,
  },
  centralizado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F1E8',
    padding: 25,
  },
  mensagem: {
    color: '#555555',
    marginTop: 12,
    textAlign: 'center',
  },
  botaoTentar: {
    backgroundColor: '#355C4B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
