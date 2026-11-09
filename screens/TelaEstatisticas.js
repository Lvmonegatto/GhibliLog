
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { buscarResenhas } from '../services/gerenciadorResenhas';

const COLORS = {
  background: '#F5F1E8',
  primary: '#355C4B',
  secondary: '#A8B99C',
  white: '#FFFFFF',
  text: '#333333',
  muted: '#888888',
  border: '#E5E0D5',
  gold: '#D6A84F',
};

const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function formatarNota(nota) {
  return Number(nota || 0).toFixed(1).replace('.', ',');
}

function calcularAtividadeMensal(resenhas) {
  const hoje = new Date();

  const meses = [];

  // Prepara os últimos seis meses, incluindo o atual.
  for (let i = 5; i >= 0; i--) {
    const data = new Date(
      hoje.getFullYear(),
      hoje.getMonth() - i,
      1
    );

    const ano = data.getFullYear();
    const mes = data.getMonth() + 1;

    meses.push({
      chave: `${ano}-${String(mes).padStart(2, '0')}`,
      nome: MESES[data.getMonth()],
      ano,
      quantidade: 0,
      filmes: new Set(),
    });
  }

  // Conta filmes distintos em cada mês.
  resenhas.forEach((resenha) => {
    const dataTexto = resenha.watchedAt || resenha.createdAt;

    if (!dataTexto) return;

    const partes = String(dataTexto).substring(0, 10).split('-');

    if (partes.length !== 3) return;

    const ano = Number(partes[0]);
    const mes = Number(partes[1]);
    const dia = Number(partes[2]);

    if (
      !Number.isInteger(ano) ||
      !Number.isInteger(mes) ||
      !Number.isInteger(dia) ||
      mes < 1 ||
      mes > 12 ||
      dia < 1 ||
      dia > 31
    ) {
      return;
    }

    const chave = `${ano}-${String(mes).padStart(2, '0')}`;

    const mesEncontrado = meses.find(
      (item) => item.chave === chave
    );

    if (mesEncontrado) {
      const identificador = resenha.filmId || resenha.filmTitle;

      if (identificador) {
        mesEncontrado.filmes.add(identificador);
      }
    }
  });

  return meses.map((mes) => ({
    ...mes,
    quantidade: mes.filmes.size,
  }));
}

export default function TelaEstatisticas() {
  const [resenhas, setResenhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const carregarEstatisticas = useCallback(async () => {
    try {
      setErro('');

      const dados = await buscarResenhas();

      setResenhas(dados || []);
    } catch (error) {
      console.log('Erro ao carregar estatísticas:', error);

      setErro('Não foi possível carregar suas estatísticas.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarEstatisticas();
    }, [carregarEstatisticas])
  );

  const totalResenhas = resenhas.length;

  const filmesUnicos = new Set(
    resenhas.map((resenha) => resenha.filmId)
  );

  const totalFilmes = filmesUnicos.size;

  const somaNotas = resenhas.reduce(
    (total, resenha) => total + Number(resenha.rating || 0),
    0
  );

  const mediaNotas =
    totalResenhas > 0 ? somaNotas / totalResenhas : 0;

  const distribuicaoNotas = [5, 4, 3, 2, 1].map((nota) => ({
    nota,
    quantidade: resenhas.filter(
      (resenha) => Number(resenha.rating) === nota
    ).length,
  }));

  const maiorQuantidade = Math.max(
    1,
    ...distribuicaoNotas.map((item) => item.quantidade)
  );

  const melhoresFilmes = [...resenhas]
    .sort((a, b) => Number(b.rating) - Number(a.rating))
    .slice(0, 5);

  const atividadeMensal = calcularAtividadeMensal(resenhas);

  const maiorAtividade = Math.max(
    1,
    ...atividadeMensal.map((item) => item.quantidade)
  );

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.textoCarregando}>
          Carregando estatísticas...
        </Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.carregando}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color={COLORS.primary}
        />

        <Text style={styles.textoErro}>
          {erro}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>
          Suas estatísticas
        </Text>

        <Text style={styles.subtitulo}>
          Acompanhe sua jornada pelo universo dos filmes.
        </Text>
      </View>

      {totalResenhas === 0 ? (
        <View style={styles.estadoVazio}>
          <Ionicons
            name="stats-chart-outline"
            size={55}
            color={COLORS.secondary}
          />

          <Text style={styles.vazioTitulo}>
            Ainda não há estatísticas
          </Text>

          <Text style={styles.vazioTexto}>
            Escreva sua primeira resenha no Diário para começar
            a acompanhar suas atividades.
          </Text>
        </View>
      ) : (
        <>
          {/* Resumo geral */}
          <View style={styles.gradeResumo}>
            <View style={styles.cartaoResumo}>
              <Ionicons
                name="film-outline"
                size={25}
                color={COLORS.primary}
              />

              <Text style={styles.numeroResumo}>
                {totalFilmes}
              </Text>

              <Text style={styles.rotuloResumo}>
                Filmes assistidos
              </Text>
            </View>

            <View style={styles.cartaoResumo}>
              <Ionicons
                name="book-outline"
                size={25}
                color={COLORS.primary}
              />

              <Text style={styles.numeroResumo}>
                {totalResenhas}
              </Text>

              <Text style={styles.rotuloResumo}>
                Resenhas escritas
              </Text>
            </View>
          </View>

          {/* Média das avaliações */}
          <View style={styles.cartaoMedia}>
            <View>
              <Text style={styles.rotuloMedia}>
                Sua média de avaliações
              </Text>

              <Text style={styles.numeroMedia}>
                {formatarNota(mediaNotas)}
                <Text style={styles.mediaMaxima}> / 5</Text>
              </Text>
            </View>

            <View style={styles.estrelasMedia}>
              <Ionicons
                name="star"
                size={34}
                color={COLORS.gold}
              />
            </View>
          </View>

          {/* Atividade mensal */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>
              Atividade mensal
            </Text>

            <Text style={styles.descricaoSecao}>
              Filmes assistidos nos últimos seis meses.
            </Text>

            <View style={styles.grafico}>
              {atividadeMensal.map((item) => {
                const altura =
                  item.quantidade > 0
                    ? (item.quantidade / maiorAtividade) * 115
                    : 4;

                return (
                  <View
                    key={item.chave}
                    style={styles.colunaGrafico}
                  >
                    <Text style={styles.valorGrafico}>
                      {item.quantidade}
                    </Text>

                    <View style={styles.areaBarra}>
                      <View
                        style={[
                          styles.barraMensal,
                          {
                            height: altura,
                            opacity: item.quantidade > 0 ? 1 : 0.35,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.mesGrafico}>
                      {item.nome}
                    </Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.legendaGrafico}>
              Quantidade de filmes diferentes assistidos por mês.
            </Text>
          </View>

          {/* Distribuição das avaliações */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>
              Distribuição das avaliações
            </Text>

            <Text style={styles.descricaoSecao}>
              Veja como você avaliou os filmes.
            </Text>

            {distribuicaoNotas.map((item) => (
              <View
                key={item.nota}
                style={styles.linhaNota}
              >
                <View style={styles.rotuloNota}>
                  <Text style={styles.textoNota}>
                    {item.nota}
                  </Text>

                  <Ionicons
                    name="star"
                    size={14}
                    color={COLORS.gold}
                  />
                </View>

                <View style={styles.fundoBarra}>
                  <View
                    style={[
                      styles.barra,
                      {
                        width: `${
                          (item.quantidade / maiorQuantidade) * 100
                        }%`,
                      },
                    ]}
                  />
                </View>

                <Text style={styles.quantidadeNota}>
                  {item.quantidade}
                </Text>
              </View>
            ))}
          </View>

          {/* Melhores avaliações */}
          <View style={styles.secao}>
            <Text style={styles.tituloSecao}>
              Melhores avaliações
            </Text>

            <Text style={styles.descricaoSecao}>
              Seus filmes com as maiores notas.
            </Text>

            {melhoresFilmes.map((resenha) => (
              <View
                key={resenha.id}
                style={styles.linhaFilme}
              >
                <View style={styles.iconeFilme}>
                  <Ionicons
                    name="film-outline"
                    size={22}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.informacoesFilme}>
                  <Text
                    style={styles.nomeFilme}
                    numberOfLines={2}
                  >
                    {resenha.filmTitle}
                  </Text>

                  <Text style={styles.notaFilme}>
                    {formatarNota(resenha.rating)} / 5 estrelas
                  </Text>
                </View>

                <Ionicons
                  name="star"
                  size={20}
                  color={COLORS.gold}
                />
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  conteudo: {
    padding: 20,
    paddingBottom: 35,
  },

  carregando: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  textoCarregando: {
    color: COLORS.primary,
    marginTop: 12,
    fontSize: 15,
  },

  textoErro: {
    color: COLORS.text,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },

  cabecalho: {
    marginBottom: 22,
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  subtitulo: {
    fontSize: 14,
    color: COLORS.muted,
    marginTop: 6,
    lineHeight: 21,
  },

  gradeResumo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  cartaoResumo: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 17,
    minHeight: 135,
    justifyContent: 'center',
  },

  numeroResumo: {
    fontSize: 29,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 9,
  },

  rotuloResumo: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 3,
  },

  cartaoMedia: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rotuloMedia: {
    fontSize: 14,
    color: COLORS.muted,
  },

  numeroMedia: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 5,
  },

  mediaMaxima: {
    fontSize: 17,
    fontWeight: 'normal',
    color: COLORS.muted,
  },

  estrelasMedia: {
    backgroundColor: '#F8F1DF',
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secao: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 19,
    marginBottom: 20,
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  descricaoSecao: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 5,
    marginBottom: 20,
  },

  // Gráfico mensal
  grafico: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingTop: 5,
  },

  colunaGrafico: {
    flex: 1,
    alignItems: 'center',
  },

  valorGrafico: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },

  areaBarra: {
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  barraMensal: {
    width: 23,
    backgroundColor: COLORS.secondary,
    borderRadius: 7,
    minHeight: 4,
  },

  mesGrafico: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 9,
    textTransform: 'capitalize',
  },

  legendaGrafico: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 17,
  },

  // Distribuição das notas
  linhaNota: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 13,
  },

  rotuloNota: {
    width: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  textoNota: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },

  fundoBarra: {
    flex: 1,
    height: 10,
    backgroundColor: '#EEECE5',
    borderRadius: 10,
    overflow: 'hidden',
  },

  barra: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
  },

  quantidadeNota: {
    width: 28,
    textAlign: 'right',
    fontSize: 13,
    color: COLORS.muted,
  },

  // Melhores filmes
  linhaFilme: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  iconeFilme: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EDF1E9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  informacoesFilme: {
    flex: 1,
    marginHorizontal: 12,
  },

  nomeFilme: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  notaFilme: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
  },

  estadoVazio: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 15,
  },

  vazioTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 15,
  },

  vazioTexto: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
});
