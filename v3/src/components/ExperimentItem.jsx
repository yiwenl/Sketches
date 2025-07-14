import './Experiments.css'

const ExperimentItem = ({ index, experiment: { cover, video, title } }) => {
  return (
    <div className="itemContainer">
      <a href={`/exps/${index}`}>
        <div
          className="imageWrapper"
          style={{
            width: 280,
            height: 280,
          }}
        >
          <img src={`/${cover}`} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </a>
    </div>
  )
}

export default ExperimentItem 