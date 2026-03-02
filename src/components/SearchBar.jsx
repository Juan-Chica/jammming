export default function SearchBar({ term, onTermChange, onSearch }) {
  function handleSubmit(e) {
    e.preventDefault();
    onSearch(term);
  }
  
  return (
    <form className="SearchBar" onSubmit={handleSubmit}>
      <input 
        className="SearchBar-input"
        value={term}
        onChange={(e) => onTermChange(e.target.value)} 
        placeholder="Enter a song name" 
      />

      <button 
       className="SearchBar-button"
       type="submit"
      >
       SEARCH
      </button>
    </form>
  );
}