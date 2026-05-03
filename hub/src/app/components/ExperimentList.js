import styles from "../styles/Experiments.module.css";
import ExperimentItem from "./ExperimentItem";

export default function ExperimentList({ experiments }) {
  return (
    <div className={styles.listContainer}>
      {experiments.map((experiment, i) => (
        <ExperimentItem
          key={`${i}-${experiment.title}`}
          index={experiments.length - i - 1}
          experiment={experiment}
        />
      ))}
    </div>
  );
}
