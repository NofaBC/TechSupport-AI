'use client';

import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { CaseList, CaseFilters } from './CaseList';
import { getCases, CaseListResult } from '@/lib/firebase/cases';
import type { Case } from '@/types';
import { DocumentSnapshot } from 'firebase/firestore';

export function CasesPageContent() {
  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [filters, setFilters] = useState<CaseFilters>({});
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase Auth
  useEffect(() => {
    import('@/lib/firebase/client').then((module) => {
      const auth = module.auth;
      if (auth) {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          if (!currentUser) {
            setIsLoading(false);
          }
        });
        return () => unsubscribe();
      } else {
        setIsLoading(false);
      }
    });
  }, []);

  const fetchCases = useCallback(async (reset: boolean = false) => {
    if (!user?.uid) return;

    setIsLoading(true);
    setError(null);

    try {
      const result: CaseListResult = await getCases(
        user.uid, // tenantId is the user's Firebase UID
        {
          status: filters.status || undefined,
          severity: filters.severity || undefined,
          currentLevel: filters.level || undefined,
          search: filters.search,
        },
        20,
        reset ? undefined : lastDoc || undefined
      );

      if (reset) {
        setCases(result.cases);
      } else {
        setCases((prev) => [...prev, ...result.cases]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError('Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, lastDoc]);

  // Initial load and filter changes
  useEffect(() => {
    if (user?.uid) {
      fetchCases(true);
    }
  }, [user?.uid, filters, fetchCases]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchCases(false);
    }
  };

  const handleFilterChange = (newFilters: CaseFilters) => {
    setFilters(newFilters);
    setLastDoc(null); // Reset pagination on filter change
  };

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <button
          onClick={() => fetchCases(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <CaseList
      cases={cases}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      onFilterChange={handleFilterChange}
    />
  );
}
