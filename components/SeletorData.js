
import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

function obterDataAtual() {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}

function converterData(data) {
  if (!data) return new Date();

  const [ano, mes, dia] = data.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

function formatarData(data) {
  if (!data) return '';

  const [ano, mes, dia] = data.split('-');

  return `${dia}/${mes}/${ano}`;
}

const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const DIAS_SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function SeletorData({ value, onChange }) {
  const hoje = obterDataAtual();
  const dataAtual = converterData(hoje);

  const [mesExibido, setMesExibido] = useState(() => {
    const data = converterData(value || hoje);

    return new Date(data.getFullYear(), data.getMonth(), 1);
  });

  useEffect(() => {
    if (value) {
      const data = converterData(value);

      setMesExibido(
        new Date(data.getFullYear(), data.getMonth(), 1)
      );
    }
  }, [value]);

  const ano = mesExibido.getFullYear();
  const mes = mesExibido.getMonth();

  const primeiroDia = new Date(ano, mes, 1).getDay();
  const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

  const mesFuturo =
    ano > dataAtual.getFullYear() ||
    (ano === dataAtual.getFullYear() &&
      mes >= dataAtual.getMonth());

  function mudarMes(direcao) {
    setMesExibido(
      new Date(ano, mes + direcao, 1)
    );
  }

  function selecionarDia(dia) {
    const dataSelecionada = new Date(ano, mes, dia);

    if (dataSelecionada > dataAtual) return;

    const novaData =
      `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

    onChange(novaData);
  }

  return (
    <View style={styles.container}>
      <View style={styles.resumo}>
        <View>
          <Text style={styles.rotulo}>DATA SELECIONADA</Text>
          <Text style={styles.dataSelecionada}>
            {formatarData(value)}
          </Text>
        </View>

        <Text style={styles.iconeCalendario}>▦</Text>
      </View>

      <View style={styles.calendario}>
        <View style={styles.navegacao}>
          <TouchableOpacity
            style={styles.botaoMes}
            onPress={() => mudarMes(-1)}
            activeOpacity={0.7}
          >
            <Text style={styles.seta}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.nomeMes}>
            {NOMES_MESES[mes]} {ano}
          </Text>

          <TouchableOpacity
            style={[
              styles.botaoMes,
              mesFuturo && styles.botaoDesabilitado,
            ]}
            onPress={() => mudarMes(1)}
            disabled={mesFuturo}
            activeOpacity={0.7}
          >
            <Text style={styles.seta}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grade}>
          {DIAS_SEMANA.map((dia, indice) => (
            <View key={indice} style={styles.celula}>
              <Text style={styles.diaSemana}>{dia}</Text>
            </View>
          ))}

          {Array.from({ length: primeiroDia }).map((_, indice) => (
            <View key={`vazio-${indice}`} style={styles.celula} />
          ))}

          {Array.from({ length: quantidadeDias }).map((_, indice) => {
            const dia = indice + 1;

            const data =
              `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

            const selecionado = value === data;
            const futuro = data > hoje;

            return (
              <View key={dia} style={styles.celula}>
                <TouchableOpacity
                  style={[
                    styles.botaoDia,
                    selecionado && styles.diaSelecionado,
                    futuro && styles.diaFuturo,
                  ]}
                  onPress={() => selecionarDia(dia)}
                  disabled={futuro}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.textoDia,
                      selecionado && styles.textoDiaSelecionado,
                      futuro && styles.textoDiaFuturo,
                    ]}
                  >
                    {dia}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <Text style={styles.legenda}>
          Selecione o dia em que assistiu ao filme.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  resumo: {
    backgroundColor: '#DDE5D8',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  rotulo: {
    color: '#718273',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  dataSelecionada: {
    color: '#355C4B',
    fontSize: 23,
    fontWeight: 'bold',
  },

  iconeCalendario: {
    fontSize: 35,
    color: '#355C4B',
  },

  calendario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
  },

  navegacao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  nomeMes: {
    color: '#355C4B',
    fontSize: 17,
    fontWeight: 'bold',
  },

  botaoMes: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#DDE5D8',
  },

  botaoDesabilitado: {
    opacity: 0.3,
  },

  seta: {
    color: '#355C4B',
    fontSize: 29,
    lineHeight: 32,
  },

  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  celula: {
    width: '14.2857%',
    height: 43,
    justifyContent: 'center',
    alignItems: 'center',
  },

  diaSemana: {
    color: '#888888',
    fontSize: 12,
    fontWeight: 'bold',
  },

  botaoDia: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
  },

  diaSelecionado: {
    backgroundColor: '#355C4B',
  },

  diaFuturo: {
    opacity: 0.3,
  },

  textoDia: {
    color: '#333333',
    fontSize: 14,
  },

  textoDiaSelecionado: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  textoDiaFuturo: {
    color: '#AAAAAA',
  },

  legenda: {
    color: '#999999',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 12,
  },
});
