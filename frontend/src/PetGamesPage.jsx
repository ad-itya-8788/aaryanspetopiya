import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const gameArt = {
  'guess-the-animal': '🐾',
  'pet-knowledge-quiz': '🧠',
  'animal-crossword': '🧩',
};

async function publicRequest(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { 'X-Pet-Game-Token': token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const validationMessage = data.errors && Object.values(data.errors).flat()[0];
    throw new Error(validationMessage || data.message || 'Something went wrong. Please try again.');
  }
  return data;
}

function normalizeMobile(value) {
  const compact = value.replace(/[\s-]/g, '');
  const normalized = compact.replace(/^(?:\+?91|0)/, '');
  return /^[6-9]\d{9}$/.test(normalized) ? normalized : '';
}

function PlayerModal({ game, busy, error, onClose, onStart }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [validationError, setValidationError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const normalizedName = name.trim();
    if (normalizedName.length < 2 || normalizedName.length > 60) {
      setValidationError('Please enter a name between 2 and 60 characters.');
      return;
    }
    const normalizedMobile = normalizeMobile(mobile);
    if (!normalizedMobile) {
      setValidationError('Enter a valid 10-digit Indian mobile number.');
      return;
    }
    setValidationError('');
    onStart({ name: normalizedName, mobile: normalizedMobile });
  };

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [busy, onClose]);

  return (
    <div className="pet-game-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section className="pet-game-modal" role="dialog" aria-modal="true" aria-labelledby="player-modal-title">
        <button className="pet-game-close" type="button" onClick={onClose} disabled={busy} aria-label="Close">×</button>
        <span className="pet-game-modal-art" aria-hidden="true">🐾</span>
        <span className="pet-game-kicker">Aaryans Pet Paradise</span>
        <h2 id="player-modal-title">Ready to Play?</h2>
        <p>Enter your details to start your pet adventure.</p>
        {game && <p className="pet-game-selected-name">{game.title}</p>}
        <form onSubmit={submit} noValidate>
          <label>
            <span>Full Name</span>
            <span className="pet-game-input-wrap"><span aria-hidden="true">👤</span><input autoComplete="name" name="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={60} placeholder="Your full name" required /></span>
          </label>
          <label>
            <span>Mobile Number</span>
            <span className="pet-game-input-wrap"><span aria-hidden="true">📱</span><input autoComplete="tel" inputMode="tel" name="mobile" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="+91 98765 43210" required /></span>
          </label>
          {(validationError || error) && <p className="pet-game-error" role="alert">{validationError || error}</p>}
          <button className="pet-game-primary" type="submit" disabled={busy}>{busy ? 'Starting…' : 'Start Game'}</button>
          <small className="pet-game-privacy">Your details help us save your game score. We never show player details publicly.</small>
        </form>
      </section>
    </div>
  );
}

function GameResult({ result, onAgain, onExplore }) {
  const message = result.score === result.max_score
    ? 'Amazing work! You know your animal friends so well.'
    : result.score >= result.max_score / 2
      ? 'Lovely effort! Keep learning and you will be an animal expert.'
      : 'Every game is a chance to learn something new. Give it another try!';

  return (
    <section className="pet-game-result">
      <span className="pet-game-result-icon" aria-hidden="true">🎉</span>
      <p className="pet-game-kicker">Your adventure is complete</p>
      <h2>Game Completed!</h2>
      <strong className="pet-game-result-score">{result.score} <span>/ {result.max_score}</span></strong>
      <p>{message}</p>
      <div className="pet-game-result-stats">
        <span><b>{result.correct_answers}</b> correct</span>
        <span><b>{result.wrong_answers}</b> incorrect</span>
      </div>
      <div className="pet-game-result-actions">
        <button className="pet-game-primary" onClick={onAgain}>Play Again</button>
        <button className="pet-game-secondary" onClick={onExplore}>Explore More Games</button>
      </div>
    </section>
  );
}

function CrosswordAnswer({ length, value, onChange, disabled }) {
  const letters = Array.from({ length }, (_, index) => value[index] || '');
  return (
    <div className="pet-crossword-letters" aria-label={`${length} letter answer`}>
      {letters.map((letter, index) => (
        <label key={index}>
          <span className="sr-only">Letter {index + 1}</span>
          <input
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            maxLength={1}
            value={letter}
            disabled={disabled}
            onChange={(event) => {
              const next = [...letters];
              next[index] = event.target.value.replace(/[^a-z]/i, '').slice(-1).toUpperCase();
              onChange(next.join(''));
              if (next[index] && index < length - 1) event.currentTarget.parentElement?.nextElementSibling?.querySelector('input')?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === 'Backspace' && !letter && index > 0) event.currentTarget.parentElement?.previousElementSibling?.querySelector('input')?.focus();
            }}
            aria-label={`Letter ${index + 1} of ${length}`}
          />
        </label>
      ))}
    </div>
  );
}

function ActiveGame({ game, session, onComplete, onExit }) {
  const questions = session.questions;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [answer, setAnswer] = useState('');
  const [hint, setHint] = useState('');
  const [hintLoading, setHintLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const question = questions[questionIndex];
  const isCrossword = session.game.game_type === 'crossword';
  const progress = Math.round(((questionIndex + (feedback ? 1 : 0)) / questions.length) * 100);

  useEffect(() => {
    setFeedback(null);
    setAnswer('');
    setHint('');
  }, [questionIndex]);

  const submitAnswer = async (value) => {
    if (!value.trim() || busy || feedback) return;
    setBusy(true);
    setError('');
    try {
      const result = await publicRequest(`/api/pet-games/attempts/${session.attempt_id}/answers`, {
        method: 'POST',
        token: session.attempt_token,
        body: { question_id: question.id, submitted_answer: value },
      });
      setFeedback(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const showHint = async () => {
    if (hint || hintLoading || feedback) return;
    setHintLoading(true);
    setError('');
    try {
      const result = await publicRequest(`/api/pet-games/attempts/${session.attempt_id}/questions/${question.id}/hint`, {
        method: 'POST',
        token: session.attempt_token,
      });
      setHint(result.hint);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setHintLoading(false);
    }
  };

  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await publicRequest(`/api/pet-games/attempts/${session.attempt_id}/complete`, {
        method: 'POST',
        token: session.attempt_token,
      });
      onComplete(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const next = () => {
    if (questionIndex === questions.length - 1) {
      finish();
      return;
    }
    setQuestionIndex((index) => index + 1);
  };

  const animalArt = question.image_or_audio?.startsWith('emoji:') ? question.image_or_audio.slice(6) : '';

  return (
    <section className="pet-game-play">
      <div className="pet-game-play-top">
        <div><p className="pet-game-kicker">{game.title}</p><h2>Question {questionIndex + 1} <span>of {questions.length}</span></h2></div>
        <button className="pet-game-leave" type="button" onClick={onExit} disabled={busy}>Leave game</button>
      </div>
      <div className="pet-game-progress"><span style={{ width: `${progress}%` }} /></div>
      <div className={`pet-game-question-stage game-stage-${session.game.game_type}`} key={question.id}>
        {animalArt && <div className="pet-game-animal-image" role="img" aria-label="Animal illustration">{animalArt}</div>}
        <h3 className="pet-game-question">{question.question}</h3>
      </div>
      {!isCrossword && !feedback && (
        <div className="pet-game-options">
          {(question.options || []).map((option) => (
            <button type="button" key={option} disabled={busy} onClick={() => submitAnswer(option)}>{option}</button>
          ))}
        </div>
      )}
      {isCrossword && !feedback && (
        <div className="pet-crossword-entry">
          <CrosswordAnswer length={question.answer_length} value={answer} onChange={setAnswer} disabled={busy} />
          <div className="pet-crossword-actions">
            <button type="button" className="pet-game-secondary" onClick={showHint} disabled={hintLoading || Boolean(hint)}>{hintLoading ? 'Loading hint…' : hint ? 'Hint used' : 'Get a hint'}</button>
            <button type="button" className="pet-game-primary" onClick={() => submitAnswer(answer)} disabled={busy || answer.length !== question.answer_length}>{busy ? 'Checking…' : 'Check'}</button>
          </div>
          {hint && <p className="pet-game-hint"><b>Hint:</b> {hint} <span>This word will score 0 after using a hint.</span></p>}
        </div>
      )}
      {feedback && (
        <div className={`pet-game-feedback${feedback.is_correct ? ' correct' : ' incorrect'}`} role="status">
          <span className="pet-game-feedback-icon" aria-hidden="true">{feedback.is_correct ? '🌟' : '🐾'}</span>
          <strong>{feedback.is_correct ? (feedback.hint_used ? 'Correct — hint used, so this word scores 0.' : 'Correct!') : 'Not quite!'}</strong>
          <span>Answer: {feedback.correct_answer}</span>
          {feedback.explanation && <p>{feedback.explanation}</p>}
          <button type="button" className="pet-game-primary" onClick={next} disabled={busy}>{questionIndex === questions.length - 1 ? 'Finish Game' : 'Next Question'}</button>
        </div>
      )}
      {error && <p className="pet-game-error" role="alert">{error}</p>}
      {isCrossword && <button type="button" className="pet-game-finish" onClick={finish} disabled={busy}>Finish</button>}
    </section>
  );
}

export default function PetGamesPage() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState('');
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [lastGame, setLastGame] = useState(null);
  const activeGame = games.find((game) => game.slug === session?.slug);

  useEffect(() => {
    let active = true;
    publicRequest('/api/pet-games')
      .then((data) => { if (active) setGames(data.games || []); })
      .catch((requestError) => { if (active) setPageError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const startGame = async (details) => {
    if (!selectedGame || starting) return;
    setStarting(true);
    setStartError('');
    try {
      const player = await publicRequest('/api/pet-games/players', { method: 'POST', body: details });
      const attempt = await publicRequest(`/api/pet-games/${encodeURIComponent(selectedGame.slug)}/attempts`, {
        method: 'POST',
        body: { player_id: player.player_id, player_token: player.player_token },
      });
      setSession({ ...attempt, slug: selectedGame.slug });
      setLastGame(selectedGame);
      setSelectedGame(null);
      setResult(null);
    } catch (requestError) {
      setStartError(requestError.message);
    } finally {
      setStarting(false);
    }
  };

  const leaveGame = async () => {
    if (!session) return;
    try {
      await publicRequest(`/api/pet-games/attempts/${session.attempt_id}/abandon`, {
        method: 'POST',
        token: session.attempt_token,
      });
    } catch (requestError) {
      setPageError(requestError.message);
    } finally {
      setSession(null);
    }
  };

  const playAgain = () => {
    setSession(null);
    setResult(null);
    setSelectedGame(lastGame);
  };

  return (
    <div className="pet-games-page">
      <section className="pet-games-hero">
        <span className="pet-game-kicker">Aaryans Pet Paradise</span>
        <h1>Pet Games <span>Paradise</span></h1>
        <p>Play, Learn and Have Fun with your Favourite Animals!</p>
        <span className="pet-games-hero-art" aria-hidden="true">🐶 🐦 🐰</span>
      </section>

      <section className="pet-games-content">
        {pageError && <p className="pet-game-error" role="alert">{pageError}</p>}
        {loading && <p className="pet-game-loading">Loading your games…</p>}
        {!loading && !session && !result && (
          <>
            <div className="pet-games-section-heading"><div><span className="pet-game-kicker">Pick an adventure</span><h2>Choose your game</h2></div><p>Every round is a new chance to learn something wonderful.</p></div>
            <div className="pet-games-grid">
              {games.map((game) => (
                <article className="pet-game-card" key={game.id}>
                  <div className={`pet-game-card-art pet-game-art-${game.game_type}`} aria-hidden="true">{gameArt[game.slug] || '🐾'}</div>
                  <div className="pet-game-card-meta"><span className="pet-game-difficulty">{game.difficulty}</span><span>30+ questions</span></div>
                  <h3>{game.title}</h3>
                  <p>{game.description}</p>
                  <button type="button" className="pet-game-primary" onClick={() => { setSelectedGame(game); setStartError(''); }}>Play Now <span aria-hidden="true">→</span></button>
                </article>
              ))}
            </div>
          </>
        )}
        {session && activeGame && <ActiveGame game={activeGame} session={session} onComplete={(completed) => { setResult(completed); setSession(null); }} onExit={leaveGame} />}
        {result && <GameResult result={result} onAgain={playAgain} onExplore={() => { setResult(null); setSession(null); }} />}
        {!loading && !games.length && !pageError && <p className="pet-game-loading">Games are being prepared. Please check back soon.</p>}
        <Link className="pet-games-home-link" to="/">← Back to Aaryans Pet Paradise</Link>
      </section>
      {selectedGame && <PlayerModal game={selectedGame} busy={starting} error={startError} onClose={() => { if (!starting) setSelectedGame(null); }} onStart={startGame} />}
    </div>
  );
}
