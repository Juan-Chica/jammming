import Track from "./Track";

export default function TrackList({ tracks, onAdd, onRemove }) {
  return (
    <div className="TrackList">
      {tracks.map((track) => (
        <Track key={track.id} track={track} onAdd={onAdd} onRemove={onRemove}/>
      ))}
    </div>
  );
}