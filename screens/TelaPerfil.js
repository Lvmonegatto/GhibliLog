
import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import firebase from '../config/config';
import { buscarResenhas } from '../services/gerenciadorResenhas';

const COLORS = {
  background: '#F5F1E8',
  primary: '#355C4B',
  secondary: '#A8B99C',
  white: '#FFFFFF',
  text: '#333333',
  muted: '#888888',
  border: '#E5E0D5',
  danger: '#B34E54',
};

const AVATARES = [
  { id: 'leaf', icon: 'leaf', label: 'Natureza', background: '#DDE9D5' },
  { id: 'paw', icon: 'paw', label: 'Animal', background: '#F2E1CC' },
  { id: 'moon', icon: 'moon', label: 'Lua', background: '#E5E0F2' },
  { id: 'star', icon: 'star', label: 'Estrela', background: '#F5EBCB' },
  { id: 'flower', icon: 'flower', label: 'Flor', background: '#F2DDE5' },
  { id: 'planet', icon: 'planet', label: 'Espaço', background: '#DCE5F0' },
  { id: 'fish', icon: 'fish', label: 'Mar', background: '#D8EAE9' },
  { id: 'cloud', icon: 'cloud', label: 'Nuvem', background: '#E8E8E8' },
];

export default function TelaPerfil() {
  const [nome, setNome] = useState('');
  const [nomeEditado, setNomeEditado] = useState('');
  const [email, setEmail] = useState('');

  const [totalFilmes, setTotalFilmes] = useState(0);
  const [totalResenhas, setTotalResenhas] = useState(0);

  const [avatar, setAvatar] = useState('leaf');
  const [avatarSelecionado, setAvatarSelecionado] = useState('leaf');

  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [editandoAvatar, setEditandoAvatar] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [salvandoAvatar, setSalvandoAvatar] = useState(false);
  const [confirmandoSaida, setConfirmandoSaida] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('');

  const avatarAtual =
    AVATARES.find((item) => item.id === avatar) || AVATARES[0];

  const avatarTemporario =
    AVATARES.find((item) => item.id === avatarSelecionado) || AVATARES[0];

  const carregarPerfil = useCallback(async () => {
    try {
      setMensagem('');

      const usuario = firebase.auth().currentUser;

      if (!usuario) {
        setCarregando(false);
        return;
      }

      setEmail(usuario.email || '');

      const snapshot = await firebase.database()
        .ref('users/' + usuario.uid + '/profile')
        .once('value');

      const perfil = snapshot.val();

      const nomeUsuario =
        perfil?.displayName ||
        usuario.displayName ||
        'Usuário';

      const avatarSalvo = perfil?.avatar || 'leaf';

      setNome(nomeUsuario);
      setNomeEditado(nomeUsuario);
      setAvatar(avatarSalvo);
      setAvatarSelecionado(avatarSalvo);

      const resenhas = await buscarResenhas();

      setTotalResenhas(resenhas.length);

      const filmes = new Set(
        resenhas.map((resenha) => resenha.filmId)
      );

      setTotalFilmes(filmes.size);

    } catch (error) {
      console.log('Erro ao carregar perfil:', error);

      setMensagem('Não foi possível carregar todas as informações.');
      setTipoMensagem('erro');

    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [carregarPerfil])
  );

  async function salvarAvatar() {
    const usuario = firebase.auth().currentUser;

    if (!usuario || salvandoAvatar) return;

    setSalvandoAvatar(true);
    setMensagem('');

    try {
      await firebase.database()
        .ref('users/' + usuario.uid + '/profile')
        .update({
          avatar: avatarSelecionado,
        });

      setAvatar(avatarSelecionado);
      setEditandoAvatar(false);

      setMensagem('Avatar atualizado com sucesso!');
      setTipoMensagem('sucesso');

    } catch (error) {
      console.log('Erro ao atualizar avatar:', error);

      setMensagem('Não foi possível atualizar seu avatar.');
      setTipoMensagem('erro');

    } finally {
      setSalvandoAvatar(false);
    }
  }

  function cancelarAvatar() {
    setAvatarSelecionado(avatar);
    setEditandoAvatar(false);
    setMensagem('');
  }

  async function salvarNome() {
    const novoNome = nomeEditado.trim();

    if (!novoNome) {
      setMensagem('Informe um nome válido.');
      setTipoMensagem('erro');
      return;
    }

    const usuario = firebase.auth().currentUser;

    if (!usuario) return;

    setSalvando(true);
    setMensagem('');

    try {
      await firebase.database()
        .ref('users/' + usuario.uid + '/profile')
        .update({
          displayName: novoNome,
        });

      await usuario.updateProfile({
        displayName: novoNome,
      });

      setNome(novoNome);
      setNomeEditado(novoNome);
      setEditando(false);

      setMensagem('Nome atualizado com sucesso!');
      setTipoMensagem('sucesso');

    } catch (error) {
      console.log('Erro ao atualizar nome:', error);

      setMensagem('Não foi possível atualizar seu nome.');
      setTipoMensagem('erro');

    } finally {
      setSalvando(false);
    }
  }

  function cancelarEdicao() {
    setNomeEditado(nome);
    setEditando(false);
    setMensagem('');
  }

  async function sairDaConta() {
    try {
      await firebase.auth().signOut();

    } catch (error) {
      console.log('Erro ao sair da conta:', error);

      setConfirmandoSaida(false);
      setMensagem('Não foi possível sair da conta. Tente novamente.');
      setTipoMensagem('erro');
    }
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.textoCarregando}>
          Carregando perfil...
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
        <Text style={styles.titulo}>Meu Perfil</Text>

        <Text style={styles.subtitulo}>
          Suas informações e atividades no GhibliLog.
        </Text>
      </View>

      
      <View style={styles.cartaoPerfil}>

        
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatarAtual.background },
          ]}
        >
          <Ionicons
            name={avatarAtual.icon}
            size={48}
            color={COLORS.primary}
          />
        </View>

        
        {editandoAvatar ? (
          <View style={styles.areaAvatares}>
            <Text style={styles.tituloAvatares}>
              Escolha seu avatar
            </Text>

            <Text style={styles.subtituloAvatares}>
              Selecione uma opção para personalizar seu perfil.
            </Text>

            <View style={styles.gradeAvatares}>
              {AVATARES.map((item) => {
                const selecionado =
                  avatarSelecionado === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.opcaoAvatar,
                      selecionado && styles.avatarSelecionado,
                    ]}
                    onPress={() => setAvatarSelecionado(item.id)}
                    disabled={salvandoAvatar}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.iconeOpcaoAvatar,
                        { backgroundColor: item.background },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={27}
                        color={COLORS.primary}
                      />
                    </View>

                    <Text
                      style={[
                        styles.nomeOpcaoAvatar,
                        selecionado && styles.nomeAvatarSelecionado,
                      ]}
                    >
                      {item.label}
                    </Text>

                    {selecionado && (
                      <Ionicons
                        name="checkmark-circle"
                        size={17}
                        color={COLORS.primary}
                        style={styles.marcaAvatar}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.acoesEdicao}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={cancelarAvatar}
                disabled={salvandoAvatar}
              >
                <Text style={styles.textoCancelar}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarAvatar}
                disabled={salvandoAvatar}
              >
                {salvandoAvatar ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Text style={styles.textoSalvar}>
                    Salvar avatar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.nomeUsuario}>
              {nome}
            </Text>

            <Text style={styles.emailUsuario}>
              {email}
            </Text>

            
            <View style={styles.acoesPerfil}>
              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => {
                  setAvatarSelecionado(avatar);
                  setMensagem('');
                  setEditandoAvatar(true);
                  setEditando(false);
                }}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={17}
                  color={COLORS.primary}
                />

                <Text style={styles.textoBotaoEditar}>
                  Alterar avatar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoEditar}
                onPress={() => {
                  setNomeEditado(nome);
                  setMensagem('');
                  setEditando(true);
                  setEditandoAvatar(false);
                }}
              >
                <Ionicons
                  name="pencil-outline"
                  size={16}
                  color={COLORS.primary}
                />

                <Text style={styles.textoBotaoEditar}>
                  Editar nome
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        
        {editando && (
          <View style={styles.areaEdicao}>
            <Text style={styles.rotuloCampo}>
              Nome de exibição
            </Text>

            <TextInput
              style={styles.input}
              value={nomeEditado}
              onChangeText={setNomeEditado}
              placeholder="Digite seu nome"
              maxLength={40}
              autoCapitalize="words"
            />

            <View style={styles.acoesEdicao}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={cancelarEdicao}
                disabled={salvando}
              >
                <Text style={styles.textoCancelar}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSalvar}
                onPress={salvarNome}
                disabled={salvando}
              >
                {salvando ? (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />
                ) : (
                  <Text style={styles.textoSalvar}>
                    Salvar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      
      {mensagem ? (
        <View
          style={[
            styles.mensagemContainer,
            tipoMensagem === 'erro'
              ? styles.mensagemErro
              : styles.mensagemSucesso,
          ]}
        >
          <Text style={styles.textoMensagem}>
            {mensagem}
          </Text>
        </View>
      ) : null}

      
      <Text style={styles.tituloSecao}>
        Minha atividade
      </Text>

      <View style={styles.gradeResumo}>
        <View style={styles.cartaoResumo}>
          <Ionicons
            name="film-outline"
            size={27}
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
            size={27}
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

      
      <View style={styles.cartaoInformacoes}>
        <Text style={styles.tituloSecao}>
          Informações da conta
        </Text>

        <View style={styles.linhaInformacao}>
          <Ionicons
            name="mail-outline"
            size={21}
            color={COLORS.primary}
          />

          <View style={styles.conteudoInformacao}>
            <Text style={styles.rotuloInformacao}>
              E-mail
            </Text>

            <Text style={styles.valorInformacao}>
              {email}
            </Text>
          </View>
        </View>

        <View style={styles.linhaInformacao}>
          <Ionicons
            name="person-outline"
            size={21}
            color={COLORS.primary}
          />

          <View style={styles.conteudoInformacao}>
            <Text style={styles.rotuloInformacao}>
              Nome de exibição
            </Text>

            <Text style={styles.valorInformacao}>
              {nome}
            </Text>
          </View>
        </View>
      </View>

      
      <View style={styles.areaSair}>
        {!confirmandoSaida ? (
          <TouchableOpacity
            style={styles.botaoSair}
            onPress={() => {
              setMensagem('');
              setConfirmandoSaida(true);
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={21}
              color={COLORS.danger}
            />

            <Text style={styles.textoSair}>
              Sair da conta
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.confirmacaoSaida}>
            <Text style={styles.textoConfirmacao}>
              Deseja realmente sair da sua conta?
            </Text>

            <View style={styles.acoesEdicao}>
              <TouchableOpacity
                style={styles.botaoCancelar}
                onPress={() => setConfirmandoSaida(false)}
              >
                <Text style={styles.textoCancelar}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoConfirmarSaida}
                onPress={sairDaConta}
              >
                <Text style={styles.textoConfirmarSaida}>
                  Sim, sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Text style={styles.rodape}>
        GhibliLog · Sua jornada cinematográfica.
      </Text>
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
  },

  textoCarregando: {
    color: COLORS.primary,
    marginTop: 12,
    fontSize: 15,
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

  cartaoPerfil: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },

  avatar: {
    width: 95,
    height: 95,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  nomeUsuario: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
  },

  emailUsuario: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
  },

  acoesPerfil: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 10,
  },

  botaoEditar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
    padding: 10,
  },

  textoBotaoEditar: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  areaAvatares: {
    width: '100%',
    alignItems: 'center',
  },

  tituloAvatares: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },

  subtituloAvatares: {
    fontSize: 12,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: 15,
  },

  gradeAvatares: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },

  opcaoAvatar: {
    width: '21%',
    minWidth: 65,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  avatarSelecionado: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F4ED',
  },

  iconeOpcaoAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  nomeOpcaoAvatar: {
    fontSize: 10,
    color: COLORS.muted,
    marginTop: 6,
  },

  nomeAvatarSelecionado: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },

  marcaAvatar: {
    position: 'absolute',
    top: 2,
    right: 2,
  },

  areaEdicao: {
    width: '100%',
    marginTop: 15,
  },

  rotuloCampo: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },

  input: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  acoesEdicao: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 13,
  },

  botaoCancelar: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  textoCancelar: {
    color: COLORS.muted,
    fontWeight: 'bold',
    fontSize: 13,
  },

  botaoSalvar: {
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    paddingHorizontal: 22,
    borderRadius: 9,
    minWidth: 90,
    alignItems: 'center',
  },

  textoSalvar: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },

  mensagemContainer: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },

  mensagemErro: {
    backgroundColor: '#F8E5E5',
  },

  mensagemSucesso: {
    backgroundColor: '#DDE5D8',
  },

  textoMensagem: {
    fontSize: 13,
    color: COLORS.text,
    textAlign: 'center',
  },

  tituloSecao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 13,
  },

  gradeResumo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },

  cartaoResumo: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 15,
    padding: 18,
    minHeight: 130,
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
    marginTop: 4,
  },

  cartaoInformacoes: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 19,
    marginBottom: 22,
  },

  linhaInformacao: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  conteudoInformacao: {
    flex: 1,
    marginLeft: 13,
  },

  rotuloInformacao: {
    fontSize: 12,
    color: COLORS.muted,
  },

  valorInformacao: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginTop: 4,
  },

  areaSair: {
    marginTop: 5,
  },

  botaoSair: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  textoSair: {
    color: COLORS.danger,
    fontWeight: 'bold',
    fontSize: 14,
  },

  confirmacaoSaida: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 17,
  },

  textoConfirmacao: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },

  botaoConfirmarSaida: {
    backgroundColor: COLORS.danger,
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 9,
  },

  textoConfirmarSaida: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },

  rodape: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 25,
  },
});
