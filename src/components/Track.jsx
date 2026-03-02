export default function Track({ track, onAdd, onRemove }) {
  function handleClick() {
    if (onAdd) onAdd(track);
    if (onRemove) onRemove(track);
  }

  return (
    <div className="Track">
      <div>
      <h4>{track.name}</h4>
      <p>
        {track.artist} | {track.album}
      </p>
      </div>

      <button onCLick={handleClick} aria-label="Track action">
        {onAdd ? "+" : "-"}
      </button>
    </div>
  );
}