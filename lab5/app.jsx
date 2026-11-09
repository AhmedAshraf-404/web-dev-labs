const { useState } = React;

// Lets the user pick 1-5 stars by clicking
function StarPicker({ rating, onChange }) {
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={n <= rating ? "star on" : "star"}
          onClick={() => onChange(n)}
          aria-label={n + " star" + (n > 1 ? "s" : "")}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

function MovieForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);

  function handleSubmit(e) {
    e.preventDefault();
    if (title.trim() === "") return;
    onAdd({ title: title.trim(), review: review.trim(), rating: rating });
    setTitle("");
    setReview("");
    setRating(0);
  }

  return (
    <form className="movie-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Movie title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Write a short review..."
        value={review}
        onChange={(e) => setReview(e.target.value)}
      />
      <div className="form-row">
        <StarPicker rating={rating} onChange={setRating} />
        <button type="submit" className="add-btn">
          Add movie
        </button>
      </div>
    </form>
  );
}

function MovieCard({ movie, onRemove }) {
  return (
    <li className="movie-card">
      <div className="card-top">
        <h3>{movie.title}</h3>
        <button className="remove-btn" onClick={() => onRemove(movie.id)}>
          Remove
        </button>
      </div>
      <p className="stars">
        {movie.rating > 0 ? "⭐".repeat(movie.rating) : "Not rated"}
        {movie.rating > 0 && <span className="count"> {movie.rating}/5</span>}
      </p>
      {movie.review && <p className="review">{movie.review}</p>}
    </li>
  );
}

function App() {
  const [movies, setMovies] = useState([]);
  const [nextId, setNextId] = useState(1);

  function handleAdd(movie) {
    setMovies([...movies, { ...movie, id: nextId }]);
    setNextId(nextId + 1);
  }

  function handleRemove(id) {
    setMovies(movies.filter((m) => m.id !== id));
  }

  const totalStars = movies.reduce((sum, m) => sum + m.rating, 0);

  return (
    <main className="app">
      <h1>Movies Watch List</h1>
      <MovieForm onAdd={handleAdd} />

      <p className="summary">
        {movies.length} watched · {totalStars} ⭐ given in total
      </p>

      {movies.length === 0 ? (
        <p className="empty">No movies yet. Add the first one above.</p>
      ) : (
        <ul className="movie-list">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onRemove={handleRemove} />
          ))}
        </ul>
      )}
    </main>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
