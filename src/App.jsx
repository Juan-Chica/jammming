import { useEffect, useState } from "react";
import SearchBar from "./Components/SearchBar.jsx";
import SearchResults from "./Components/SearchResults.jsx";
import Playlist from "./Components/Playlist.jsx";
import { Spotify } from "./util/Spotify.js";

export default function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [playlistName, setPlaylistName] = useState("New Playlist");
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [ searchTerm, setSearchTerm] = useState("");
  
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(Spotify.isLoggedIn());
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    setIsSpotifyConnected(Spotify.isLoggedIn());
  }, []);

  function addTrack(track) {
    const alreadyAdded = playlistTracks.some((t) => t.id === track.id);
    if (alreadyAdded) return;
    setPlaylistTracks((prev) => [...prev, track]);
  }

  function removeTrack(track) {
    setPlaylistTracks((prev) => prev.filter((t) => t.id !== track.id));
  }

  async function handleSearch(term) {
    try {
      setSearchError("");
      setIsSearching(true);

      const results = await Spotify.search(term);
      setSearchResults(results);
    } catch (e) {
      console.error(e);
      setSearchError("Search failed. Check console and make sure you're connected.");
    } finally {
      setIsSearching(false);
    }
  }

  async function savePlaylist() {
    try {
      const trackUris = playlistTracks.map((t) => t.uri);
      const result = await Spotify.savePlaylist(playlistName, trackUris);

      console.log("✅ Saved playlist:", result);

      setPlaylistName("New Playlist");
      setPlaylistTracks([]);
      alert("Playlist saved to Spotify!");
    } catch (e) {
      console.error(e);
      alert("Failed to save playlist. Check console.");
    }
  }

  return (
    <div className="App">
      <h1>
        Ja<span className="highlight">mmm</span>ing
      </h1>
      
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        <button
          type="button"
          onClick={async () => {
            try {
              const token = await Spotify.getAccessToken();
              if (token) setIsSpotifyConnected(true);
            } catch (e) {
              console.error(e);
              alert("Spotify connect failed. Check console.");
            }
          }}
        >
          {isSpotifyConnected ? "SPOTIFY CONNECTED ✅" : "CONNECT SPOTIFY"}
        </button>

        {isSpotifyConnected && (
          <button
            type="button"
            onClick={() => {
              Spotify.logout();
              setIsSpotifyConnected(false);
            }}
          >
            DISCONNECT
          </button>
        )}
      </div>

      <SearchBar 
        term={searchTerm}
        onTermChange={setSearchTerm}
        onSearch={handleSearch}
      />

      {isSearching && (
        <p style={{ textAlign: "center" }}>Searching...</p>
      )}

      {searchError && (
        <p style={{ textAlign: "center" }}>{searchError}</p>
      )}

      <div className="App-playlist">
        <SearchResults tracks={searchResults} onAdd={addTrack} />
        <Playlist 
          name={playlistName} 
          tracks={playlistTracks} 
          onRemove={removeTrack} 
          onNameChange={setPlaylistName} 
          onSave={savePlaylist} />
      </div>
    </div>
  );
}