import type { Movie, TVShow } from "@/types";

interface MovieJsonLdProps {
  media: Movie | TVShow;
  mediaType: "movie" | "tv";
  url: string;
}

export function MovieJsonLd({ media, mediaType, url }: MovieJsonLdProps) {
  const title =
    mediaType === "movie" ? (media as Movie).title : (media as TVShow).name;
  const datePublished =
    mediaType === "movie"
      ? (media as Movie).releaseDate
      : (media as TVShow).firstAirDate;
  const image = media.posterPath
    ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
    : undefined;
  const genres = media.genres?.map((g) => g.name) || [];
  const actors = media.credits?.cast?.slice(0, 5).map((c) => c.name) || [];
  const rating = media.voteAverage
    ? {
        "@type": "AggregateRating" as const,
        ratingValue: media.voteAverage.toFixed(1),
        bestRating: "10",
        worstRating: "1",
        ratingCount: media.voteCount,
      }
    : undefined;

  const jsonLd =
    mediaType === "movie"
      ? {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: title,
          description: media.overview?.slice(0, 200) || "",
          image,
          datePublished,
          genre: genres,
          actor: actors.map((a) => ({
            "@type": "Person" as const,
            name: a,
          })),
          aggregateRating: rating,
          url,
        }
      : {
          "@context": "https://schema.org",
          "@type": "TVSeries",
          name: title,
          description: media.overview?.slice(0, 200) || "",
          image,
          datePublished,
          genre: genres,
          actor: actors.map((a) => ({
            "@type": "Person" as const,
            name: a,
          })),
          aggregateRating: rating,
          numberOfSeasons: (media as TVShow).numberOfSeasons,
          numberOfEpisodes: (media as TVShow).numberOfEpisodes,
          url,
        };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
