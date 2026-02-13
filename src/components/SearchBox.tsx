import { useState, useMemo } from 'react';

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
    return posts.filter((post) =>
      post.title.toLowerCase().includes(lowerQuery)
    );
  }, [query, posts]);

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
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="記事を検索..."
          aria-label="ブログ記事を検索"
          aria-autocomplete="list"
          aria-controls={filteredPosts !== null ? 'search-results' : undefined}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
          className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {filteredPosts.length > 0 ? (
            <ul role="group">
              {filteredPosts.map((post) => (
                <li key={post.slug}>
                  <a
                    href={`/blog/${post.slug}/`}
                    className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <p className="font-medium">{post.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
