import Head from "next/Head";

const Meta = ({ title }) => {
  const _title = title === undefined ? `Yi-Wen Lin | Sketches` : title;
  const _url = `https://yiwenl.github.io/Sketches/`;
  const _cover = `http://yiwenl.github.io/Sketches/assets/img/coverSketches.jpg`;
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:title" content={_title} />
        <meta property="og:url" content={_url} />
        <meta property="og:type" content="website" />
        <meta
          property="og:description"
          content="Freelance Creative Coder based in UK"
        />
        <meta property="og:image" content={_cover} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:creator" content="Yi-Wen Lin" />
        <meta name="twitter:url" content={_url} />
        <meta name="twitter:title" content={_title} />
        <meta
          name="twitter:description"
          content="Freelance Creative Coder based in UK"
        />
        <meta name="twitter:image" content={_cover} />
        <title>{_title}</title>
      </Head>
    </>
  );
};

export default Meta;
