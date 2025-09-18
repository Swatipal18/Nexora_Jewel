import React from 'react';
import { useSearchParams } from 'react-router-dom';

export default function NoResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>😕 No results found</h2>
      <p>We couldn’t find anything for <strong>"{query}"</strong>.</p>
    </div>
  );
}
