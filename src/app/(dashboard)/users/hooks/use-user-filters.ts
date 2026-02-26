'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  UserFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  activeFilterCount,
  filtersToParams,
} from '../user-filters';

const DEBOUNCE_MS = 300;

export function useUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Hydrate filters from URL on mount ─────────────────────────────────────
  const hydrateFromURL = useCallback((): UserFilters => {
    const get = (k: string) => searchParams.get(k) ?? '';
    return {
      roles: get('roles') ? get('roles').split(',') : [],
      statuses: get('statuses') ? get('statuses').split(',') : [],
      emailVerified: (get('emailVerified') as UserFilters['emailVerified']) || '',
      lastLogin: (get('lastLogin') as UserFilters['lastLogin']) || '',
      lastLoginFrom: get('lastLoginFrom'),
      lastLoginTo: get('lastLoginTo'),
      joinedFrom: get('joinedFrom'),
      joinedTo: get('joinedTo'),
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<UserFilters>(hydrateFromURL);
  const [search, setSearchRaw] = useState(searchParams.get('search') ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // ── Debounce search ───────────────────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setSearch = useCallback((val: string) => {
    setSearchRaw(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), DEBOUNCE_MS);
  }, []);

  // cleanup on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // ── Push URL whenever filters or debounced search change ─────────────────
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    const fp = filtersToParams(filters);
    Object.entries(fp).forEach(([k, v]) => params.set(k, v));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters]);

  // ── Filter setters ────────────────────────────────────────────────────────
  const setFilter = useCallback(<K extends keyof UserFilters>(key: K, value: UserFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleMulti = useCallback((key: 'roles' | 'statuses', value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSearchRaw('');
    setDebouncedSearch('');
  }, []);

  /** Remove one specific filter "chip" by key+value */
  const removeFilterChip = useCallback((key: keyof UserFilters, value?: string) => {
    setFilters((prev) => {
      if (key === 'roles' || key === 'statuses') {
        return { ...prev, [key]: (prev[key] as string[]).filter((v) => v !== value) };
      }
      if (key === 'lastLogin') {
        return { ...prev, lastLogin: '', lastLoginFrom: '', lastLoginTo: '' };
      }
      if (key === 'joinedFrom' || key === 'joinedTo') {
        return { ...prev, joinedFrom: '', joinedTo: '' };
      }
      return { ...prev, [key]: DEFAULT_FILTERS[key] };
    });
  }, []);

  // ── Derived fetch params ─────────────────────────────────────────────────
  // These are passed directly to useFetchData / AdminService.getUsers
  const fetchFilters = {
    search: debouncedSearch,
    ...filtersToParams(filters),
  };

  return {
    // state
    filters,
    search,
    debouncedSearch,
    isPanelOpen,
    setIsPanelOpen,
    // derived
    hasActive: hasActiveFilters(filters),
    activeCount: activeFilterCount(filters),
    fetchFilters,
    // actions
    setSearch,
    setFilter,
    toggleMulti,
    resetFilters,
    removeFilterChip,
  };
}

export type UseUserFiltersReturn = ReturnType<typeof useUserFilters>;
