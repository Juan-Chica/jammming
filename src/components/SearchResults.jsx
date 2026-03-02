import TrackList from "./TrackList";

export default function SearchResults({ tracks, onAdd }) {
  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <TrackList tracks={tracks} onAdd={onAdd} />
    </div>
  );
}