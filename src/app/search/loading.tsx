import { CategoryNav } from "@/components/category-nav";
import { SearchSkeleton } from "@/components/search-skeleton";

export default function SearchLoading() {
  return (
    <div className="px-4 py-5 sm:px-6">
      <div className="mb-5">
        <CategoryNav />
      </div>
      <div className="skeleton mb-5 h-6 w-56 rounded-full" />
      <SearchSkeleton />
    </div>
  );
}
