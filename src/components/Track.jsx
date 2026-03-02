export default function Track({ track, onAdd, onRemove }) {
  function handleClick() {
    if (onAdd) onAdd(track);
    else if (onRemove) onRemove(track);
  }

  return (
    <div className="Track">
      <div>
        <h4>{track.name}</h4>
        <p>
          {track.artist} | {track.album}
        </p>
      </div>

      <button onClick={handleClick} aria-label="Track action">
        {onAdd ? "+" : "-"}
      </button>
    </div>
  );
}