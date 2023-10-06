import styles from "../../styles/Experiments.module.css";
import Link from "next/link";

import SiteData from "../../model/data";

export async function generateMetadata({ params }) {
  const index = parseInt(params.id);
  const { url, title, cover } = SiteData[index];

  return {
    title: `Sketches | ${title}`,
    description: "WebGL Sketches by Yi-Wen Lin",
    metadataBase: new URL("https://yiwenl.github.io/Sketches"),
    openGraph: {
      title: `Sketches | ${title}`,
      type: "website",
      description: "WebGL Sketches by Yi-Wen Lin",
      url,
      image: `https://yiwenl.github.io/Sketches/${cover}`,
      images: [
        {
          url: `https://yiwenl.github.io/Sketches/${cover}`,
        },
      ],
    },
    twitter: {
      card: "photo",
      creator: "@yiwenl",
      title: `Sketches | ${title}`,
      description: "WebGL Sketches by Yi-Wen Lin",
      url,
      image: `https://yiwenl.github.io/Sketches/${cover}`,
    },
    viewport: {
      width: "device-width",
      initialScale: 1,
      maximumScale: 1,
    },
  };
}

export default function ExperimentPage({ params }) {
  const index = parseInt(params.id);
  const { url } = SiteData[index];
  return (
    <div>
      <Link href="/" as={`/`} className={styles.closeButton}>
        <svg width="512px" height="512px" viewBox="0 0 512 512">
          <path
            d="M437.5,386.6L306.9,256l130.6-130.6c14.1-14.1,14.1-36.8,0-50.9c-14.1-14.1-36.8-14.1-50.9,0L256,205.1L125.4,74.5
    				c-14.1-14.1-36.8-14.1-50.9,0c-14.1,14.1-14.1,36.8,0,50.9L205.1,256L74.5,386.6c-14.1,14.1-14.1,36.8,0,50.9
    				c14.1,14.1,36.8,14.1,50.9,0L256,306.9l130.6,130.6c14.1,14.1,36.8,14.1,50.9,0C451.5,423.4,451.5,400.6,437.5,386.6z"
          />
        </svg>
      </Link>
      <iframe src={url} scrolling="no" className={styles.experimentContainer} />
    </div>
  );
}

export async function generateStaticParams() {
  const experiments = SiteData;

  const ids = experiments.map((experiment, index) => {
    return { id: index.toString() };
  });

  return ids;
}
