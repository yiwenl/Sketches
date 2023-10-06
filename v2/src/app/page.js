import styles from "./page.module.css";
import SiteData from "./model/data";

// components
import Header from "./components/Header";
import ExperimentList from "./components/ExperimentList";

export const metadata = {
  title: "Sketches | Yi-Wen Lin",
  description: "WebGL Sketches by Yi-Wen Lin",
  metadataBase: new URL("https://yiwenl.github.io/Sketches"),
  openGraph: {
    title: "Sketches | Yi-Wen Lin",
    type: "website",
    description: "WebGL Sketches by Yi-Wen Lin",
    url: "http://yiwenl.github.io/Sketches/",
    image: "/coverSketches.jpg",
    images: [
      {
        url: "https://yiwenl.github.io/Sketches/coverSketches.jpg",
      },
    ],
  },
  twitter: {
    card: "photo",
    creator: "@yiwenl",
    title: "Sketches | Yi-Wen Lin",
    description: "WebGL Sketches by Yi-Wen Lin",
    url: "http://yiwenl.github.io/Sketches/",
    image: "https://yiwenl.github.io/Sketches/coverSketches.jpg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default async function Home() {
  const { experiments } = await getData();

  const data = experiments.concat();
  data.reverse();

  return (
    <main className={styles.main}>
      <Header />
      <div className={styles.container}>
        <ExperimentList experiments={data} />
      </div>
    </main>
  );
}

async function getData() {
  return {
    experiments: SiteData,
  };
}
