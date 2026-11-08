
import firebase from '../config/config';

function obterUID() {
  const usuario = firebase.auth().currentUser;

  if (!usuario) {
    throw new Error('Nenhum usuário autenticado.');
  }

  return usuario.uid;
}

function obterCaminho() {
  return 'users/' + obterUID() + '/reviews';
}

export async function adicionarResenha(resenha) {
  if (!resenha || !resenha.filmId || !resenha.filmTitle) {
    throw new Error('Dados do filme inválidos.');
  }

  if (!resenha.reviewText || !resenha.reviewText.trim()) {
    throw new Error('A resenha não pode estar vazia.');
  }

  if (
    typeof resenha.rating !== 'number' ||
    resenha.rating < 1 ||
    resenha.rating > 5
  ) {
    throw new Error('A nota deve estar entre 1 e 5.');
  }

  const referencia = firebase.database()
    .ref(obterCaminho())
    .push();

  const dados = {
    filmId: resenha.filmId,
    filmTitle: resenha.filmTitle,
    filmImage: resenha.filmImage || '',
    rating: resenha.rating,
    reviewText: resenha.reviewText.trim(),
    watchedAt: resenha.watchedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await referencia.set(dados);

  return referencia.key;
}

export async function buscarResenhas() {
  const snapshot = await firebase.database()
    .ref(obterCaminho())
    .once('value');

  const dados = snapshot.val();

  if (!dados) {
    return [];
  }

  return Object.entries(dados).map(([id, resenha]) => ({
    id,
    ...resenha,
  }));
}

export function observarResenhas(callback) {
  const referencia = firebase.database().ref(obterCaminho());

  const listener = referencia.on('value', snapshot => {
    const dados = snapshot.val();

    const resenhas = dados
      ? Object.entries(dados).map(([id, resenha]) => ({
          id,
          ...resenha,
        }))
      : [];

    callback(resenhas);
  });

  return () => referencia.off('value', listener);
}

export async function atualizarResenha(id, alteracoes) {
  if (!id) {
    throw new Error('Identificador da resenha inválido.');
  }

  const atualizacoes = {};

  if (alteracoes.rating !== undefined) {
    if (
      typeof alteracoes.rating !== 'number' ||
      alteracoes.rating < 1 ||
      alteracoes.rating > 5
    ) {
      throw new Error('A nota deve estar entre 1 e 5.');
    }

    atualizacoes.rating = alteracoes.rating;
  }

  if (alteracoes.reviewText !== undefined) {
    if (!alteracoes.reviewText.trim()) {
      throw new Error('A resenha não pode estar vazia.');
    }

    atualizacoes.reviewText = alteracoes.reviewText.trim();
  }

  if (alteracoes.watchedAt !== undefined) {
    atualizacoes.watchedAt = alteracoes.watchedAt;
  }

  atualizacoes.updatedAt = new Date().toISOString();

  await firebase.database()
    .ref(obterCaminho() + '/' + id)
    .update(atualizacoes);
}

export async function removerResenha(id) {
  if (!id) {
    throw new Error('Identificador da resenha inválido.');
  }

  await firebase.database()
    .ref(obterCaminho() + '/' + id)
    .remove();
}

export async function buscarResenhaPorId(id) {
  if (!id) {
    throw new Error('Identificador da resenha inválido.');
  }

  const snapshot = await firebase.database()
    .ref(obterCaminho() + '/' + id)
    .once('value');

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id,
    ...snapshot.val(),
  };
}
