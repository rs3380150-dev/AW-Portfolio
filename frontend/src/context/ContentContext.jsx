import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultContent } from "@/content/defaultContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { sanitizeContent } from "@/content/sanitizeContent.mjs";

const fallbackContent = sanitizeContent(defaultContent);

const ContentContext = createContext({
  content: fallbackContent,
  loading: false,
  connected: false,
  error: null,
  refresh: async () => {},
});

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(fallbackContent);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("content_sections")
      .select("section_key, content");

    if (!error && data) {
      let remote = Object.fromEntries(data.map((row) => [row.section_key, row.content]));
      if (new URLSearchParams(window.location.search).get("preview") === "draft") {
        const { data: draftRows, error: draftError } = await supabase.from("content_drafts").select("section_key, content");
        if (draftError) {
          setError(draftError);
          setLoading(false);
          return;
        }
        remote = { ...remote, ...Object.fromEntries(draftRows.map((row) => [row.section_key, row.content])) };
      }
      setContent(sanitizeContent({ ...defaultContent, ...remote }));
      setConnected(true);
      setError(null);
    } else if (error) {
      setConnected(false);
      setError(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ content, loading, connected, error, refresh }),
    [content, loading, connected, error],
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
