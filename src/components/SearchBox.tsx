import { useState, useMemo, useCallback } from 'react';

interface Post {
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  slug: string;
}

interface Props {
  posts: Post[];
}

export default function SearchBox({ posts }: Props) {
  const [query, setQuery] = useState('');

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return null;
    const lowerQuery = query.toLowerCase();
    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowerQuery) ||
        post.description.toLowerCase().includes(lowerQuery) ||
        post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }, [query, posts]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') setQuery('');
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          id="search-box"
          role="combobox"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="記事を検索..."
          aria-label="ブログ記事を検索"
          aria-autocomplete="list"
          aria-expanded={filteredPosts !== null}
          aria-haspopup="listbox"
          aria-controls={filteredPosts !== null ? 'search-results' : undefined}
          onKeyDown={handleKeyDown}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pl-10 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-accent dark:border-gray-600 dark:bg-gray-800"
        />
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {filteredPosts !== null && (
        <div
          id="search-results"
          role="listbox"
          aria-live="polite"
          className="absolute z-10 mt-2 max-h-96 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
        >
          {filteredPosts.length > 0 ? (
            <ul>
              {filteredPosts.map((post) => (
                <li key={post.slug} role="option" aria-selected={false}>
                  <a
                    href={`/blog/${post.slug}/`}
                    className="block px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <p className="font-medium">{post.title}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(post.publishedAt)}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-gray-500 dark:text-gray-400">
              「{query}」に一致する記事が見つかりません
            </p>
          )}
        </div>
      )}
    </div>
  );
}
