
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
  TextInput,
  ScrollView,
} from 'react-native';

const API_URL = 'https://ghibliapi.vercel.app/films';

export default function TelaCatalogo({ navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [pesquisa, setPesquisa] = useState('');
  const [diretorSelecionado, setDiretorSelecionado] = useState('Todos');
  const [ordenacao, setOrdenacao] = useState('A-Z');

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

  // Obtém os diretores disponíveis na API.
  const diretores = [
    'Todos',
    ...new Set(filmes.map((filme) => filme.director).filter(Boolean)),
  ].sort((a, b) => {
    if (a === 'Todos') return -1;
    if (b === 'Todos') return 1;
    return a.localeCompare(b);
  });

  // Aplica pesquisa, filtro e ordenação.
  const filmesFiltrados = filmes
    .filter((filme) => {
      const titulo = (filme.title || '').toLowerCase();
      const termo = pesquisa.trim().toLowerCase();

      const correspondePesquisa = titulo.includes(termo);

      const correspondeDiretor =
        diretorSelecionado === 'Todos' ||
        filme.director === diretorSelecionado;

      return correspondePesquisa && correspondeDiretor;
    })
    .sort((a, b) => {
      const comparacao = (a.title || '').localeCompare(
        b.title || '',
        'pt-BR'
      );

      return ordenacao === 'A-Z' ? comparacao : -comparacao;
    });

  function limparFiltros() {
    setPesquisa('');
    setDiretorSelecionado('Todos');
    setOrdenacao('A-Z');
  }

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

  const existemFiltros =
    pesquisa.trim() !== '' ||
    diretorSelecionado !== 'Todos' ||
    ordenacao !== 'A-Z';

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.tituloPagina}>Universo Ghibli</Text>

        <Text style={styles.subtitulo}>
          Explore histórias que encantam gerações.
        </Text>

        <Text style={styles.contagem}>
          {filmesFiltrados.length} de {filmes.length} filmes encontrados
        </Text>
      </View>

      {/* Campo de pesquisa */}
      <View style={styles.areaPesquisa}>
        <Text style={styles.iconePesquisa}>⌕</Text>

        <TextInput
          style={styles.inputPesquisa}
          placeholder="Pesquisar filme pelo título..."
          placeholderTextColor="#999999"
          value={pesquisa}
          onChangeText={setPesquisa}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Filtro por diretor */}
      <View style={styles.areaFiltros}>
        <Text style={styles.tituloFiltro}>Filtrar por diretor</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listaFiltros}
        >
          {diretores.map((diretor) => (
            <TouchableOpacity
              key={diretor}
              style={[
                styles.filtro,
                diretorSelecionado === diretor && styles.filtroSelecionado,
              ]}
              onPress={() => setDiretorSelecionado(diretor)}
            >
              <Text
                style={[
                  styles.textoFiltro,
                  diretorSelecionado === diretor &&
                    styles.textoFiltroSelecionado,
                ]}
              >
                {diretor}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ordenação */}
      <View style={styles.areaOrdenacao}>
        <Text style={styles.tituloFiltro}>Ordenar por título</Text>

        <View style={styles.opcoesOrdenacao}>
          <TouchableOpacity
            style={[
              styles.botaoOrdenacao,
              ordenacao === 'A-Z' && styles.ordenacaoSelecionada,
            ]}
            onPress={() => setOrdenacao('A-Z')}
          >
            <Text
              style={[
                styles.textoOrdenacao,
                ordenacao === 'A-Z' && styles.textoOrdenacaoSelecionado,
              ]}
            >
              A - Z
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.botaoOrdenacao,
              ordenacao === 'Z-A' && styles.ordenacaoSelecionada,
            ]}
            onPress={() => setOrdenacao('Z-A')}
          >
            <Text
              style={[
                styles.textoOrdenacao,
                ordenacao === 'Z-A' && styles.textoOrdenacaoSelecionado,
              ]}
            >
              Z - A
            </Text>
          </TouchableOpacity>

          {existemFiltros && (
            <TouchableOpacity
              style={styles.botaoLimpar}
              onPress={limparFiltros}
            >
              <Text style={styles.textoLimpar}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de filmes */}
      <FlatList
        data={filmesFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={renderizarFilme}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
        ListEmptyComponent={
          <View style={styles.semResultados}>
            <Text style={styles.iconeVazio}>⌕</Text>

            <Text style={styles.tituloVazio}>
              Nenhum filme encontrado
            </Text>

            <Text style={styles.textoVazio}>
              Tente outro título ou selecione um diretor diferente.
            </Text>

            <TouchableOpacity
              style={styles.botaoLimparVazio}
              onPress={limparFiltros}
            >
              <Text style={styles.textoBotao}>
                Limpar filtros
              </Text>
            </TouchableOpacity>
          </View>
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
    paddingBottom: 12,
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
  areaPesquisa: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 15,
    paddingHorizontal: 14,
    borderRadius: 12,
    height: 48,
    elevation: 2,
  },
  iconePesquisa: {
    fontSize: 25,
    color: '#789080',
    marginRight: 10,
  },
  inputPesquisa: {
    flex: 1,
    fontSize: 14,
    color: '#355C4B',
  },
  areaFiltros: {
    marginBottom: 12,
  },
  tituloFiltro: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#355C4B',
    marginHorizontal: 20,
    marginBottom: 8,
  },
  listaFiltros: {
    paddingHorizontal: 16,
  },
  filtro: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E7E5DC',
    marginRight: 8,
  },
  filtroSelecionado: {
    backgroundColor: '#355C4B',
  },
  textoFiltro: {
    fontSize: 12,
    color: '#555555',
  },
  textoFiltroSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  areaOrdenacao: {
    marginBottom: 12,
  },
  opcoesOrdenacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  botaoOrdenacao: {
    borderWidth: 1,
    borderColor: '#A8B99C',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  ordenacaoSelecionada: {
    backgroundColor: '#DDE5D8',
    borderColor: '#355C4B',
  },
  textoOrdenacao: {
    fontSize: 12,
    color: '#555555',
  },
  textoOrdenacaoSelecionado: {
    color: '#355C4B',
    fontWeight: 'bold',
  },
  botaoLimpar: {
    marginLeft: 'auto',
    padding: 7,
  },
  textoLimpar: {
    fontSize: 12,
    color: '#A05C48',
    fontWeight: 'bold',
  },
  lista: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
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
  semResultados: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 45,
  },
  iconeVazio: {
    fontSize: 42,
    color: '#A8B99C',
    marginBottom: 10,
  },
  tituloVazio: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#355C4B',
  },
  textoVazio: {
    fontSize: 13,
    color: '#777777',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
  },
  botaoLimparVazio: {
    backgroundColor: '#355C4B',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 18,
  },
});
