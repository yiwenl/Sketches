import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Experiments.module.css";
import { basePath } from "../../../next.config";

const ExperimentItem = ({ index, experiment: { cover, video, title } }) => {
  return (
    <div className={styles.itemContainer}>
      <Link href="/exps/[id]" as={`/exps/${index}`}>
        <div
          className={styles.imageWrapper}
          style={{
            width: 280,
            height: 280,
          }}
        >
          <Image src={`${basePath}/${cover}`} alt="" fill />
        </div>
      </Link>
    </div>
  );
};

export default ExperimentItem;
