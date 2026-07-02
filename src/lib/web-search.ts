interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Minimal web search using DuckDuckGo's HTML endpoint (no API key required).
 * Swap this out for Tavily/Serper/Bing if you have a key — just set
 * SEARCH_API_KEY and branch here.
 */
export async function webSearch(query: string): Promise<SearchResult[]> {
  try {
    const res = await fetch(
      `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Kryvium/1.0",
        },
      }
    );
    if (!res.ok) return [];
    const html = await res.text();

    const results: SearchResult[] = [];
    const blocks = html.split('class="result__body"').slice(1);

    for (const block of blocks.slice(0, 5)) {
      const titleMatch = block.match(/class="result__a"[^>]*>([^<]+)/);
      const urlMatch = block.match(/class="result__a"[^>]*href="([^"]+)"/);
      const snippetMatch = block.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);

      if (titleMatch && urlMatch) {
        results.push({
          title: decodeHtml(titleMatch[1]),
          url: decodeURIComponent(
            urlMatch[1].replace(/^.*uddg=/, "").split("&")[0]
          ),
          snippet: snippetMatch ? decodeHtml(stripTags(snippetMatch[1])) : "",
        });
      }
    }

    return results;
  } catch {
    return [];
  }
}

function stripTags(input: string) {
  return input.replace(/<[^>]*>/g, "");
}

function decodeHtml(input: string) {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function formatSearchContext(results: SearchResult[], query: string) {
  if (results.length === 0) return "";
  const lines = results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.url}\n${r.snippet}`)
    .join("\n\n");
  return `Web search results for "${query}":\n\n${lines}\n\nCite sources by their [number] when used.`;
}
