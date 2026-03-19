import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface RoleSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount: number;
}

export function RoleSearchBar({ query, onQueryChange, resultCount }: RoleSearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search occupations, skills, tools… (e.g. 'Python', 'UX Designer', 'Kubernetes')"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="pl-10"
      />
      {query.trim() && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {resultCount} found
        </span>
      )}
    </div>
  );
}
