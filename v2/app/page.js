import styles from "./page.module.css";
import SiteData from "./model/data";

// components
import Header from "./components/Header";
import ExperimentList from "./components/ExperimentList";

export default async function Home() {
  const { experiments } = await getData();

  const data = experiments.concat();
  data.reverse();
  return (
    <div>
      <Header />
      <div className={styles.container}>
        <ExperimentList experiments={data} />
      </div>
    </div>
  );
}

async function getData() {
  return {
    experiments: SiteData,
  };
}
