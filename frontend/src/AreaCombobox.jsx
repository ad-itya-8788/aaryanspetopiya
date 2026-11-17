import { useEffect, useId, useMemo, useRef, useState } from 'react';

export default function AreaCombobox({ value, onChange }) {
  const [areas, setAreas] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const listId = useId().replace(/:/g, '');
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  useEffect(() => {
    const controller = new AbortController();

    const loadAreas = async () => {
      try {
        const response = await fetch(`${apiBase}/api/pune-areas`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Area list request failed');

        const result = await response.json();
        if (!Array.isArray(result.areas)) throw new Error('Area list response was invalid');

        setAreas(result.areas);
        setStatus('ready');
      } catch (error) {
        if (error.name === 'AbortError') return;
        setStatus('error');
      }
    };

    loadAreas();

    return () => controller.abort();
  }, [apiBase]);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const hasExactMatch = areas.some((area) => area.toLowerCase() === normalizedQuery);

  const filteredAreas = useMemo(() => {
    if (!isTyping || !normalizedQuery) return areas;
    return areas.filter((area) => area.toLowerCase().includes(normalizedQuery));
  }, [areas, isTyping, normalizedQuery]);

  const showCustomOption = isTyping && trimmedQuery !== '' && !hasExactMatch;

  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const options = listRef.current?.querySelectorAll('[role="option"]');
    options?.[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  const selectArea = (area) => {
    onChange?.(area);
    setQuery(area);
    setOpen(false);
    setActiveIndex(-1);
    setIsTyping(false);
  };

  const commitCustomArea = () => {
    if (!trimmedQuery) return;
    selectArea(trimmedQuery);
  };

  const handleBlur = (event) => {
    if (wrapperRef.current?.contains(event.relatedTarget)) return;
    setOpen(false);
    setActiveIndex(-1);
    setIsTyping(false);

    const trimmed = query.trim();
    if (trimmed !== query) {
      setQuery(trimmed);
      onChange?.(trimmed);
    }
  };

  const handleKeyDown = (event) => {
    if (status !== 'ready') return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setIsTyping(false);
        setActiveIndex(areas.length ? 0 : -1);
        return;
      }
      setActiveIndex((current) => (filteredAreas.length ? (current + 1) % filteredAreas.length : -1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        setIsTyping(false);
        setActiveIndex(areas.length ? areas.length - 1 : -1);
        return;
      }
      setActiveIndex((current) => (filteredAreas.length ? (current - 1 + filteredAreas.length) % filteredAreas.length : -1));
    } else if (event.key === 'Enter') {
      if (!open) return;
      if (activeIndex >= 0 && filteredAreas[activeIndex]) {
        event.preventDefault();
        selectArea(filteredAreas[activeIndex]);
      } else if (showCustomOption) {
        event.preventDefault();
        commitCustomArea();
      }
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
      setQuery(value || '');
      setActiveIndex(-1);
      setIsTyping(false);
    }
  };

  let placeholder = 'Search or select your area';
  if (status === 'loading') placeholder = 'Loading nearby areas…';
  if (status === 'error') placeholder = 'Area list unavailable, try again';

  return (
    <div className="area-combobox" ref={wrapperRef} onBlur={handleBlur}>
      <span className="input-shell">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open && activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          placeholder={placeholder}
          value={query}
          disabled={status !== 'ready'}
          onChange={(event) => {
            const nextQuery = event.target.value;
            setQuery(nextQuery);
            onChange?.(nextQuery);
            setIsTyping(true);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => {
            if (status !== 'ready') return;
            setOpen(true);
            setIsTyping(false);
            setActiveIndex(areas.length ? 0 : -1);
            inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
        />
      </span>

      {open && status === 'ready' && (
        <ul className="area-combobox-list" id={listId} role="listbox" ref={listRef}>
          {filteredAreas.map((area, index) => {
            const isSelected = area === value;
            return (
              <li
                key={area}
                id={`${listId}-option-${index}`}
                role="option"
                aria-selected={isSelected}
                className={`area-combobox-option${index === activeIndex ? ' is-active' : ''}${isSelected ? ' is-selected' : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectArea(area)}
              >
                <span>{area}</span>

              </li>
            );
          })}
          {showCustomOption && (
            <li
              className="area-combobox-option is-custom"
              role="option"
              aria-selected={false}
              onMouseDown={(event) => event.preventDefault()}
              onClick={commitCustomArea}
            >
              <span>Use “{trimmedQuery}”</span>
            </li>
          )}
          {filteredAreas.length === 0 && !showCustomOption && (
            <li className="area-combobox-empty" role="presentation">No matching area found</li>
          )}
        </ul>
      )}

      {status === 'error' && (
        <small className="area-combobox-status error" role="alert">
          We could not load the area list. Please refresh the page and try again.
        </small>
      )}
    </div>
  );
}
