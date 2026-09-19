import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultContent } from "@/content/defaultContent";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const ContentContext = createContext({
  content: defaultContent,
  loading: false,
  connected: false,
  refresh: async () => {},
});

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [connected, setConnected] = useState(false);
  const [revision, setRevision] = useState(0);

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("content_sections")
      .select("section_key, content");

    if (!error && data) {
      const remote = Object.fromEntries(data.map((row) => [row.section_key, row.content]));
      Object.entries(remote).forEach(([key, value]) => {
        const target = defaultContent[key];
        if (Array.isArray(target) && Array.isArray(value)) {
          target.splice(0, target.length, ...value);
        } else if (target && typeof target === "object" && value && typeof value === "object") {
          Object.keys(target).forEach((field) => delete target[field]);
          Object.assign(target, value);
        }
      });
      setContent({ ...defaultContent, ...remote });
      setConnected(true);
      setRevision((current) => current + 1);
    }

    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({ content, loading, connected, refresh }),
    [content, loading, connected],
  );

  return (
    <ContentContext.Provider value={value}>
      <React.Fragment key={revision}>{children}</React.Fragment>
    </ContentContext.Provider>
  );
};

export const useContent = () => useContext(ContentContext);
