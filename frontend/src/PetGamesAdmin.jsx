import { useEffect, useState } from 'react';
import { request } from './adminApi.js';
import './styles/contentForms.css';
import './admin/RegistrationTable.css';
import './PetGamesAdmin.css';

const initialPage = { data: [], current_page: 1, last_page: 1, total: 0 };
const tabs = [
  ['analytics', 'Analytics'],
  ['games', 'Games'],
  ['questions', 'Questions'],
  ['players', 'Players'],
  ['attempts', 'Attempts'],
];

function useAdminData(path, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    request(path)
      .then((response) => {
        if (active) {
          setData(response);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, deps);
  return { data, setData, loading, error, setError };
}

function AdminTable({ columns, rows, emptyText }) {
  return (
    <div className="pet-admin-table-wrap">
      <table className="crm-table">
        <thead>
          <tr>
            {columns.map(([key, title]) => (
              <th key={key}>{title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map(([key]) => (
                <td key={key}>{row[key] ?? '—'}</td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="crm-no-results" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ page, onChange }) {
  if (!page || page.last_page <= 1) return null;
  return (
    <div className="pet-admin-pagination">
      <span>{page.total} records</span>
      <button
        type="button"
        disabled={page.current_page <= 1}
        onClick={() => onChange(page.current_page - 1)}
      >
        Previous
      </button>
      <span>
        Page {page.current_page} of {page.last_page}
      </span>
      <button
        type="button"
        disabled={page.current_page >= page.last_page}
        onClick={() => onChange(page.current_page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function AdminAnalytics() {
  const { data, loading, error } = useAdminData('/api/admin/pet-games/analytics');
  if (loading) return <p className="crm-empty">Loading game analytics…</p>;
  if (error)
    return (
      <p className="admin-alert error" role="alert">
        {error}
      </p>
    );
  const metrics = [
    ['Total players', data.total_players],
    ['Total attempts', data.total_attempts],
    ['Completed', data.completed],
    ['Played today', data.played_today],
    ['Total points', data.total_points],
    ['Highest score', data.highest_score],
    ['Most popular game', data.most_popular_game?.title || '—'],
  ];
  const rows = (data.recent_activity || []).map((item) => ({
    ...item,
    player: (
      <>
        <strong>{item.player}</strong>
        <small className="pet-admin-subline">{item.mobile}</small>
      </>
    ),
    game: item.game,
    score: `${item.score} / ${item.max_score}`,
    status: (
      <span className={`pet-admin-status ${item.status}`}>{item.status.replace('_', ' ')}</span>
    ),
    started_at: item.started_at ? new Date(item.started_at).toLocaleString() : '—',
  }));
  return (
    <>
      <div className="pet-admin-metrics">
        {metrics.map(([label, value]) => (
          <article key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="crm-panel pet-admin-panel">
        <div className="crm-panel-heading">
          <div>
            <h2>Recent activity</h2>
            <p>Most recent saved attempts.</p>
          </div>
        </div>
        <AdminTable
          columns={[
            ['player', 'Player'],
            ['game', 'Game'],
            ['score', 'Score'],
            ['status', 'Status'],
            ['started_at', 'Date'],
          ]}
          rows={rows}
          emptyText="No game activity yet."
        />
      </section>
    </>
  );
}

function AdminGames() {
  const { data, setData, loading, error, setError } = useAdminData('/api/admin/pet-games/games');
  const [busy, setBusy] = useState(false);
  const toggle = async (game) => {
    setBusy(true);
    setError('');
    try {
      const response = await request(`/api/admin/pet-games/games/${game.id}`, {
        method: 'PATCH',
        body: { is_active: !game.is_active },
      });
      setData((current) => ({
        ...current,
        games: current.games.map((item) => (item.id === game.id ? response.game : item)),
      }));
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading) return <p className="crm-empty">Loading games…</p>;
  return (
    <section className="crm-panel pet-admin-panel">
      {error && (
        <p className="admin-alert error" role="alert">
          {error}
        </p>
      )}
      <AdminTable
        columns={[
          ['title', 'Game name'],
          ['description', 'Description'],
          ['difficulty', 'Difficulty'],
          ['questions_count', 'Questions'],
          ['attempts_count', 'Attempts'],
          ['status', 'Status'],
          ['action', 'Action'],
        ]}
        rows={(data?.games || []).map((game) => ({
          ...game,
          status: (
            <span className={`pet-admin-status ${game.is_active ? 'completed' : 'abandoned'}`}>
              {game.is_active ? 'Active' : 'Inactive'}
            </span>
          ),
          action: (
            <button
              type="button"
              className="pet-admin-action"
              disabled={busy}
              onClick={() => toggle(game)}
            >
              {game.is_active ? 'Deactivate' : 'Activate'}
            </button>
          ),
        }))}
        emptyText="No games are available."
      />
    </section>
  );
}

function QuestionForm({ question, games, onClose, onSaved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const wrongOptions = String(form.get('wrong_options') || '')
      .split('\n')
      .map((value) => value.trim())
      .filter(Boolean);
    const body = {
      pet_game_id: Number(form.get('pet_game_id')),
      question: String(form.get('question')).trim(),
      image_or_audio: String(form.get('image_or_audio') || '').trim() || null,
      correct_answer: String(form.get('correct_answer')).trim(),
      wrong_options:
        games.find((game) => game.id === Number(form.get('pet_game_id')))?.game_type === 'crossword'
          ? { hint: wrongOptions.join(' ') }
          : wrongOptions,
      explanation: String(form.get('explanation') || '').trim() || null,
      is_active: form.has('is_active'),
    };
    setBusy(true);
    setError('');
    try {
      await request(
        question
          ? `/api/admin/pet-games/questions/${question.id}`
          : '/api/admin/pet-games/questions',
        {
          method: question ? 'PUT' : 'POST',
          body,
        },
      );
      onSaved();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className="cms-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="cms-modal pet-admin-question-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pet-admin-question-title"
      >
        <div className="crm-panel-heading">
          <div>
            <h2 id="pet-admin-question-title">{question ? 'Edit question' : 'Add question'}</h2>
            <p>Question content is stored in the database.</p>
          </div>
          <button className="cms-close" type="button" disabled={busy} onClick={onClose}>
            Close
          </button>
        </div>
        {error && (
          <p className="admin-alert error" role="alert">
            {error}
          </p>
        )}
        <form className="cms-form-grid" onSubmit={save}>
          <label className="cms-span-two">
            Game
            <select
              name="pet_game_id"
              defaultValue={question?.pet_game_id || games[0]?.id}
              required
            >
              {games.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </label>
          <label className="cms-span-two">
            Question / clue
            <textarea
              name="question"
              defaultValue={question?.question || ''}
              maxLength="2000"
              rows="3"
              required
            />
          </label>
          <label className="cms-span-two">
            Image or audio path
            <input
              name="image_or_audio"
              defaultValue={question?.image_or_audio || ''}
              maxLength="500"
              placeholder="/audio/example.mp3 or emoji:🐾"
            />
          </label>
          <label className="cms-span-two">
            Correct answer
            <input
              name="correct_answer"
              defaultValue={question?.correct_answer || ''}
              maxLength="255"
              required
            />
          </label>
          <label className="cms-span-two">
            Wrong options / crossword hint
            <textarea
              name="wrong_options"
              defaultValue={
                Array.isArray(question?.wrong_options)
                  ? question.wrong_options.join('\n')
                  : question?.wrong_options?.hint || ''
              }
              rows="3"
              placeholder="One option per line, or enter one crossword hint"
            />
          </label>
          <label className="cms-span-two">
            Explanation
            <textarea
              name="explanation"
              defaultValue={question?.explanation || ''}
              maxLength="3000"
              rows="2"
            />
          </label>
          <label className="cms-toggle">
            <input name="is_active" type="checkbox" defaultChecked={question?.is_active ?? true} />{' '}
            Active
          </label>
          <div className="cms-modal-actions cms-span-two">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="crm-primary-button" disabled={busy}>
              {busy ? 'Saving…' : 'Save question'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function AdminQuestions() {
  const { data: gamesData } = useAdminData('/api/admin/pet-games/games');
  const [page, setPage] = useState(initialPage);
  const [gameId, setGameId] = useState('');
  const [visibility, setVisibility] = useState('');
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [reload, setReload] = useState(0);
  const [busyId, setBusyId] = useState(null);
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(pageNumber), per_page: '20' });
    if (gameId) params.set('game_id', gameId);
    if (visibility !== '') params.set('is_active', visibility);
    if (search.trim()) params.set('q', search.trim());
    setLoading(true);
    request(`/api/admin/pet-games/questions?${params}`)
      .then((response) => {
        if (active) {
          setPage(response);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gameId, visibility, search, pageNumber, reload]);
  const disable = async (question) => {
    setBusyId(question.id);
    setError('');
    try {
      await request(`/api/admin/pet-games/questions/${question.id}/disable`, { method: 'PATCH' });
      setReload((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId(null);
    }
  };
  const rows = page.data.map((question) => ({
    ...question,
    game: question.game?.title || '—',
    question: <span className="pet-admin-question-text">{question.question}</span>,
    correct_answer: question.correct_answer,
    status: (
      <span className={`pet-admin-status ${question.is_active ? 'completed' : 'abandoned'}`}>
        {question.is_active ? 'Active' : 'Disabled'}
      </span>
    ),
    action: (
      <div className="pet-admin-row-actions">
        <button type="button" className="pet-admin-action" onClick={() => setEditing(question)}>
          Edit
        </button>
        {question.is_active && (
          <button
            type="button"
            className="pet-admin-action danger"
            disabled={busyId === question.id}
            onClick={() => disable(question)}
          >
            Disable
          </button>
        )}
      </div>
    ),
  }));
  return (
    <>
      <section className="crm-panel pet-admin-panel">
        <div className="pet-admin-filters">
          <input
            type="search"
            aria-label="Search questions"
            placeholder="Search questions or answers"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageNumber(1);
            }}
          />
          <select
            aria-label="Filter by game"
            value={gameId}
            onChange={(event) => {
              setGameId(event.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">All games</option>
            {(gamesData?.games || []).map((game) => (
              <option key={game.id} value={game.id}>
                {game.title}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by question status"
            value={visibility}
            onChange={(event) => {
              setVisibility(event.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="1">Active</option>
            <option value="0">Disabled</option>
          </select>
          <button type="button" className="crm-primary-button" onClick={() => setEditing({})}>
            Add question
          </button>
        </div>
        {error && (
          <p className="admin-alert error" role="alert">
            {error}
          </p>
        )}
        {loading ? (
          <p className="crm-empty">Loading questions…</p>
        ) : (
          <AdminTable
            columns={[
              ['game', 'Game'],
              ['question', 'Question / clue'],
              ['correct_answer', 'Answer'],
              ['status', 'Status'],
              ['action', 'Actions'],
            ]}
            rows={rows}
            emptyText="No questions match these filters."
          />
        )}
        <Pagination page={page} onChange={setPageNumber} />
      </section>
      {editing && (
        <QuestionForm
          question={editing.id ? editing : null}
          games={gamesData?.games || []}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setReload((value) => value + 1);
          }}
        />
      )}
    </>
  );
}

function AdminPlayers() {
  const [search, setSearch] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(pageNumber), per_page: '20' });
    if (search.trim()) params.set('q', search.trim());
    setLoading(true);
    request(`/api/admin/pet-games/players?${params}`)
      .then((response) => {
        if (active) {
          setPage(response);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, pageNumber]);
  const rows = page.data.map((player) => ({
    ...player,
    attempts_count: player.attempts_count ?? 0,
    attempts_max_score: player.attempts_max_score ?? 0,
    attempts_max_started_at: player.attempts_max_started_at
      ? new Date(player.attempts_max_started_at).toLocaleString()
      : '—',
  }));
  return (
    <section className="crm-panel pet-admin-panel">
      <div className="pet-admin-filters">
        <input
          type="search"
          aria-label="Search players by name or mobile"
          placeholder="Search name or mobile"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPageNumber(1);
          }}
        />
      </div>
      {error && (
        <p className="admin-alert error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="crm-empty">Loading players…</p>
      ) : (
        <AdminTable
          columns={[
            ['name', 'Player name'],
            ['mobile', 'Mobile'],
            ['attempts_count', 'Total games'],
            ['attempts_max_score', 'Best score'],
            ['attempts_max_started_at', 'Last activity'],
          ]}
          rows={rows}
          emptyText="No players match this search."
        />
      )}
      <Pagination page={page} onChange={setPageNumber} />
    </section>
  );
}

function AdminAttempts() {
  const { data: gamesData } = useAdminData('/api/admin/pet-games/games');
  const [filters, setFilters] = useState({ q: '', game_id: '', status: '', from: '', to: '' });
  const [pageNumber, setPageNumber] = useState(1);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(pageNumber), per_page: '20' });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setLoading(true);
    request(`/api/admin/pet-games/attempts?${params}`)
      .then((response) => {
        if (active) {
          setPage(response);
          setError('');
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [filters, pageNumber]);
  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPageNumber(1);
  };
  const rows = page.data.map((attempt) => ({
    ...attempt,
    player: attempt.player?.name || '—',
    mobile: attempt.player?.mobile || '—',
    game: attempt.game?.title || '—',
    score: `${attempt.score} / ${attempt.max_score}`,
    status: (
      <span className={`pet-admin-status ${attempt.status}`}>
        {attempt.status.replace('_', ' ')}
      </span>
    ),
    started_at: attempt.started_at ? new Date(attempt.started_at).toLocaleString() : '—',
    completed_at: attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : '—',
    duration_seconds: attempt.duration_seconds == null ? '—' : `${attempt.duration_seconds}s`,
  }));
  return (
    <section className="crm-panel pet-admin-panel">
      <div className="pet-admin-filters pet-admin-attempt-filters">
        <input
          type="search"
          aria-label="Search attempts by player or mobile"
          placeholder="Player name or mobile"
          value={filters.q}
          onChange={(event) => updateFilter('q', event.target.value)}
        />
        <select
          aria-label="Filter attempts by game"
          value={filters.game_id}
          onChange={(event) => updateFilter('game_id', event.target.value)}
        >
          <option value="">All games</option>
          {(gamesData?.games || []).map((game) => (
            <option key={game.id} value={game.id}>
              {game.title}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter attempts by status"
          value={filters.status}
          onChange={(event) => updateFilter('status', event.target.value)}
        >
          <option value="">All statuses</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Abandoned</option>
        </select>
        <label>
          From
          <input
            type="date"
            value={filters.from}
            onChange={(event) => updateFilter('from', event.target.value)}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.to}
            onChange={(event) => updateFilter('to', event.target.value)}
          />
        </label>
      </div>
      {error && (
        <p className="admin-alert error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="crm-empty">Loading attempts…</p>
      ) : (
        <AdminTable
          columns={[
            ['player', 'Player'],
            ['mobile', 'Mobile'],
            ['game', 'Game'],
            ['score', 'Score / max'],
            ['correct_answers', 'Correct'],
            ['wrong_answers', 'Wrong'],
            ['status', 'Status'],
            ['duration_seconds', 'Duration'],
            ['started_at', 'Started'],
            ['completed_at', 'Completed'],
          ]}
          rows={rows}
          emptyText="No attempts match these filters."
        />
      )}
      <Pagination page={page} onChange={setPageNumber} />
    </section>
  );
}

export default function PetGamesAdmin() {
  const [tab, setTab] = useState('analytics');
  const views = {
    analytics: <AdminAnalytics />,
    games: <AdminGames />,
    questions: <AdminQuestions />,
    players: <AdminPlayers />,
    attempts: <AdminAttempts />,
  };
  return (
    <section className="pet-games-admin">
      <nav className="pet-admin-tabs" aria-label="Pet Games administration">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'active' : ''}
            aria-current={tab === key ? 'page' : undefined}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      {views[tab]}
    </section>
  );
}
