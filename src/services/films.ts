const FILMS_ENDPOINT = "https://ghibliapi.vercel.app/films";

export type Film = {
  id: string;
  title: string;
  original_title: string;
  original_title_romanised: string;
  image: string;
  movie_banner: string;
  description: string;
  director: string;
  producer: string;
  release_date: string;
  running_time: string;
  rt_score: string;
};

export async function fetchFilms(signal?: AbortSignal): Promise<Film[]> {
  const response = await fetch(FILMS_ENDPOINT, { signal });

  if (!response.ok) {
    throw new Error("Não foi possível carregar o catálogo agora.");
  }

  return (await response.json()) as Film[];
}

export async function fetchFilmById(id: string, signal?: AbortSignal): Promise<Film> {
  const response = await fetch(`${FILMS_ENDPOINT}/${encodeURIComponent(id)}`, { signal });

  if (!response.ok) {
    throw new Error("Não foi possível encontrar este filme.");
  }

  return (await response.json()) as Film;
}
