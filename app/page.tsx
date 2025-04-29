import UserList from "./users/UserList";

export type searchParamsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default async function Page({ searchParams }: searchParamsProps) {
  const page = Number(searchParams.page) || 1;  // Default page to 1
  const pageSize = Number(searchParams.pageSize) || 10;  // Default pageSize to 10
  const query = Array.isArray(searchParams.search) ? searchParams.search.join(",") : searchParams.search || "";  // Ensure search is a string
  
  // Build the URL for fetching users with query parameters
  const queryString = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      search: query,
      // Include any other filters here, e.g., "status" or "role"
  }).toString();

  // Fetch the data with the updated query string
  const res = await fetch(`http://localhost:3000/api/users?${queryString}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  const result = await res.json();




  return (
    <UserList result={result}  />
  );
}
