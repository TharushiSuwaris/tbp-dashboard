"use client";

import { useState, useEffect } from "react";
import type { Prospect, Task, Document } from "@/types";
import { getProspects, getTasks, getDocuments } from "@/lib/supabase/queries";

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getProspects()
      .then(setProspects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { prospects, loading, error };
}

export function useTasks() {
  const [tasks, setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    getTasks()
      .then(setTasks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { tasks, loading, error };
}

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    getDocuments()
      .then(setDocuments)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { documents, loading, error };
}
