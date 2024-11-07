import React, { useEffect, useState } from "react";
import SearchResult, { type ISearchItem } from "./SearchResult";
import config from "@/config/config.json";

const { default_language } = config.settings;

const SearchModal = ({ lang }: { lang: string | undefined }) => {
  const [searchString, setSearchString] = useState("");
  const [searchData, setSearchData] = useState<ISearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch search data on component mount
  useEffect(() => {
    const fetchSearchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/search.json");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setSearchData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load search data");
        console.error("Error loading search data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchData();
  }, []);

  // Handle input change
  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    setSearchString(e.currentTarget.value.replace("\\", "").toLowerCase());
  };

  // Generate search results
  const getSearchResults = (data: ISearchItem[]) => {
    if (!searchString.trim()) return [];

    const regex = new RegExp(searchString, "gi");
    return data.filter((item) => {
      const title = item.frontmatter.title.toLowerCase();
      const description = item.frontmatter.description?.toLowerCase() || "";
      const categories = item.frontmatter.categories?.join(" ").toLowerCase() || "";
      const tags = item.frontmatter.tags?.join(" ").toLowerCase() || "";
      const content = item.content.toLowerCase();

      return (
        title.match(regex) ||
        description.match(regex) ||
        categories.match(regex) ||
        tags.match(regex) ||
        content.match(regex)
      );
    });
  };

  // Filter by language and get search results
  const currentLang = lang || default_language;
  const filteredData = searchData.filter((item) => item.lang === currentLang);
  const startTime = performance.now();
  const searchResults = getSearchResults(filteredData);
  const endTime = performance.now();
  const searchTime = ((endTime - startTime) / 1000).toFixed(3);

  // Keyboard navigation
  useEffect(() => {
    const searchModal = document.getElementById("searchModal");
    const searchInput = document.getElementById("searchInput");
    const searchModalOverlay = document.getElementById("searchModalOverlay");
    const searchResultItems = document.querySelectorAll("#searchItem");
    const searchModalTriggers = document.querySelectorAll("[data-search-trigger]");

    let selectedIndex = -1;

    const updateSelection = () => {
      searchResultItems.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add("search-result-item-active");
          item.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
          item.classList.remove("search-result-item-active");
        }
      });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        searchModal?.classList.add("show");
        searchInput?.focus();
      } else if (event.key === "Escape") {
        searchModal?.classList.remove("show");
      } else if (event.key === "ArrowUp" && selectedIndex > 0) {
        event.preventDefault();
        selectedIndex--;
        updateSelection();
      } else if (
        event.key === "ArrowDown" &&
        selectedIndex < searchResultItems.length - 1
      ) {
        event.preventDefault();
        selectedIndex++;
        updateSelection();
      } else if (event.key === "Enter" && selectedIndex >= 0) {
        const activeLink = document.querySelector<HTMLAnchorElement>(
          ".search-result-item-active a"
        );
        activeLink?.click();
      }
    };

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    searchModalTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        searchModal?.classList.add("show");
        searchInput?.focus();
      });
    });
    searchModalOverlay?.addEventListener("click", () => {
      searchModal?.classList.remove("show");
    });

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchString]);

  return (
    <div id="searchModal" className="search-modal">
      <div id="searchModalOverlay" className="search-modal-overlay" />
      <div className="search-wrapper">
        <div className="search-wrapper-header">
          <label
            htmlFor="searchInput"
            className="absolute left-7 top-[calc(50%-7px)]"
          >
            <span className="sr-only">search icon</span>
            {searchString ? (
              <svg
                onClick={() => setSearchString("")}
                viewBox="0 0 512 512"
                height="18"
                width="18"
                className="hover:text-red-500 cursor-pointer -mt-0.5"
              >
                <title>clear search</title>
                <path
                  fill="currentcolor"
                  d="M256 512A256 256 0 10256 0a256 256 0 100 512zM175 175c9.4-9.4 24.6-9.4 33.9.0l47 47 47-47c9.4-9.4 24.6-9.4 33.9.0s9.4 24.6.0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6.0 33.9s-24.6 9.4-33.9.0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9.0s-9.4-24.6.0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6.0-33.9z"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 512 512"
                height="18"
                width="18"
                className="-mt-0.5"
              >
                <title>search</title>
                <path
                  fill="currentcolor"
                  d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8.0 45.3s-32.8 12.5-45.3.0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9.0 208S93.1.0 208 0 416 93.1 416 208zM208 352a144 144 0 100-288 144 144 0 100 288z"
                />
              </svg>
            )}
          </label>
          <input
            id="searchInput"
            placeholder="Search..."
            className="search-wrapper-header-input"
            type="input"
            name="search"
            value={searchString}
            onChange={handleSearch}
            autoFocus
            autoComplete="off"
            disabled={isLoading}
          />
        </div>

        {isLoading ? (
          <div className="search-wrapper-body text-center py-8">Loading...</div>
        ) : error ? (
          <div className="search-wrapper-body text-center py-8 text-red-500">
            {error}
          </div>
        ) : (
          <SearchResult
            searchResult={searchResults}
            searchString={searchString}
            lang={currentLang}
          />
        )}

        <div className="search-wrapper-footer">
          <span className="flex items-center">
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            to navigate
          </span>
          <span className="flex items-center">
            <kbd>↵</kbd>
            to select
          </span>
          {searchString && !isLoading && !error && (
            <span>
              <strong>{searchResults.length}</strong> results in{" "}
              <strong>{searchTime}</strong>s
            </span>
          )}
          <span>
            <kbd>ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;