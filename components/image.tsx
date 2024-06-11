export function Image({ src, alt }) {
  return (
    <figure>
      <img src={src} alt={alt} />
      <figcaption>{alt}</figcaption>
    </figure>
  );
}
