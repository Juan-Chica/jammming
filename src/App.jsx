import { useState } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Playlist from "./components/Playlist";

export default function App() {
  const [searchResults] = useState([
    { id: 1, name: "Good Day", artist: "IU", album: "Real", uri: "spotify:track:111" },
    { id: 2, name: "LILAC", artist: "IU", album: "LILAC", uri: "spotify:track:222" },
    { id: 3, name: "Palette", artist: "IU", album: "Palette", uri: "spotify:track:333" },
  ]);

  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([
    { id: 4, name: "Strawberry Moon", artist: "IU", album: "Strawberry Moon", uri: "spotify:track:444" },
  ]);
  
  const [ searchTerm, setSearchTerm] = useState("");

  function handleSearch(term) {
    console.log("Searching for:", term);
  }

  function addTrack(track) {
    const alreadyAdded = playlistTracks.some((t) => t.id === track.id);
    if (alreadyAdded) return;
    setPlaylistTracks((prev) => [...prev, track]);
  }

  function removeTrack(track) {
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== track.id));
  }

  function updatePlaylistName(name) {
    setPlaylistName(name);
  }

  function savePlaylist() {
    const trackUris = playlistTracks.map((t) => t.uri);

    console.log("Saving playlist:", playlistName);
    console.log("Track URIs", trackUris);

    setPlaylistName("New Playlist");
    setPlaylistTracks([]);
  }

  return (
    <div className="App">
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>

      <SearchBar 
        term={searchTerm}
        onTermChange={setSearchTerm}
        onSearch={handleSearch}
      />

      <div className="App-playlist">
        <SearchResults tracks={searchResults} onAdd={addTrack} />
        <Playlist name={playlistName} tracks={playlistTracks} onRemove={removeTrack} onNameChange={updatePlaylistName} onSave={savePlaylist} />
      </div>
    </div>
  );
}