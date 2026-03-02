import TrackList from "./TrackList";

export default function Playlist({ name, tracks, onRemove, onNameChange, onSave }) {
  return (
    <div className="Playlist">
      <input className="Playlist-name" 
             value={name} 
             onChange={(e) => onNameChange(e.target.value)}
      />
      
      <TrackList tracks={tracks} onRemove={onRemove} />
      
      <button className="Playlist-save" onClick={onSave}>SAVE TO SPOTIFY</button>
    </div>
  );
}