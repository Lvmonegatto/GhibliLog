
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import {
  observarFilmes,
  removerFilme,
} from '../services/gerenciadorFilmes';

export default function ListaFilmes({ lista, titulo, navigation }) {
  const [filmes, setFilmes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filmeSelecionado, setFilmeSelecionado] = useState(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let cancelarObservacao;

    try {
      cancelarObservacao = observarFilmes(lista, (dados) => {
        setFilmes(dados);
        setCarregando(false);
      });
    } catch (error) {
      console.log('Erro ao carregar filmes:', error);
      setErro('Não foi possível carregar seus filmes.');
      setCarregando(false);
    }

    return () => {
      if (cancelarObservacao) {
        cancelarObservacao();
      }
    };
  }, [lista]);

  function confirmarRemocao(filme) {
    setErro('');
    setFilmeSelecionado(filme.id);
  }

  function cancelarRemocao() {
    if (excluindo) return;

    setFilmeSelecionado(null);
    setErro('');
  }

  async function excluirFilme(filme) {
    if (excluindo) return;

    setExcluindo(true);
    setErro('');

    try {
      await removerFilme(lista, filme.id);

      setFilmes(filmesAtuais =>
        filmesAtuais.filter(item => item.id !== filme.id)
      );

      setFilmeSelecionado(null);
    } catch (error) {
      console.log('Erro ao remover filme:', error);
      setErro('Não foi possível remover o filme. Tente novamente.');
    } finally {
      setExcluindo(false);
    }
  }

  function renderizarFilme({ item }) {
    const mostrarConfirmacao = filmeSelecionado === item.id;

    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.areaFilme}
          activeOpacity={0.8}
          disabled={excluindo}
          onPress={() =>
            navigation.navigate('Detalhes do Filme', {
              filme: item,
            })
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
              <Text style={styles.semImagem}>Sem imagem</Text>
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

            <Text style={styles.verDetalhes}>
              Ver detalhes →
            </Text>
          </View>
        </TouchableOpacity>

        {mostrarConfirmacao ? (
          <View style={styles.confirmacao}>
            <Text style={styles.textoConfirmacao}>
              Deseja remover este filme da sua lista?
            </Text>

            <View style={styles.acoesConfirmacao}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={cancelarRemocao}
                disabled={excluindo}
              >
                <Text style={styles.textoCancelar}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.botaoConfirmar,
                  excluindo && styles.botaoDesabilitado,
                ]}
                onPress={() => excluirFilme(item)}
                disabled={excluindo}
              >
                {excluindo ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.textoConfirmar}>
                    Confirmar remoção
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.botaoRemover}
            onPress={() => confirmarRemocao(item)}
            disabled={excluindo}
          >
            <Text style={styles.textoRemover}>
              Remover
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.centralizado}>
        <ActivityIndicator size="large" color="#355C4B" />
        <Text style={styles.mensagemCarregamento}>
          Carregando filmes...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.tituloPagina}>
          {titulo}
        </Text>

        <Text style={styles.quantidade}>
          {filmes.length} {filmes.length === 1 ? 'filme' : 'filmes'}
        </Text>
      </View>

      {erro ? (
        <Text style={styles.mensagemErro}>
          {erro}
        </Text>
      ) : null}

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

            <Text style={styles.tituloVazio}>
              Sua lista está vazia
            </Text>

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

  confirmacao: {
    marginTop: 13,
    padding: 13,
    backgroundColor: '#F8F3EA',
    borderRadius: 10,
  },

  textoConfirmacao: {
    fontSize: 13,
    color: '#444444',
    marginBottom: 12,
    fontWeight: '500',
  },

  acoesConfirmacao: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },

  botaoCancelar: {
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  textoCancelar: {
    color: '#666666',
    fontSize: 12,
    fontWeight: 'bold',
  },

  botaoConfirmar: {
    backgroundColor: '#B34E54',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 8,
    minWidth: 125,
    alignItems: 'center',
  },

  textoConfirmar: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  botaoDesabilitado: {
    opacity: 0.6,
  },

  mensagemErro: {
    color: '#B34E54',
    fontSize: 13,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
