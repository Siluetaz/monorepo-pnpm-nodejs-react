import { useDebounce } from "@uidotdev/usehooks";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { searchData } from "../services/search";
import { Data } from "../types";

interface Props {
  initialData: Data;
}

const DEBOUNCE_TIME = 300;

export const Search = ({ initialData }: Props) => {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("q") ?? "";
  });

  const debouncedSearch = useDebounce(search, DEBOUNCE_TIME);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const newPathname = !debouncedSearch ? window.location.pathname : `?q=${debouncedSearch}`;

    window.history.replaceState({}, "", newPathname);
  }, [debouncedSearch, initialData]);

  useEffect(() => {
    if (!debouncedSearch) return setData(initialData);
    searchData(debouncedSearch).then(([error, newData]) => {
      if (error) {
        toast.error(error.message);
        return;
      }
      if (newData) setData(newData);
    });
  }, [debouncedSearch, initialData]);

  return (
    <div>
      <h1>Search</h1>
      <form>
        <input
          type="search"
          placeholder="Buscar información"
          defaultValue={search}
          onChange={handleSearch}
        />
      </form>
      <ul>
        {data.map((row) => (
          <li key={row.ID}>
            <article>
              {Object.entries(row).map(([key, value]) => (
                <p key={key + value}>
                  <strong>{key}</strong>: {value}
                </p>
              ))}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;
