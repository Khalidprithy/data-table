import UserList from "../components/users/UserList";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { page, pageSize, search } = searchParams || {};

  const pageNo = Number(page) || 1;
  const pageSizes = Number(pageSize) || 10;
  const query = Array.isArray(search) ? search.join(",") : search || "";

  const queryString = new URLSearchParams({
    page: String(pageNo),
    pageSize: String(pageSizes),
    search: query,
  }).toString();

  try {
    const res = await fetch(`http://localhost:3000/api/users?${queryString}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }

    const result = await res.json();
    return <UserList result={result} />;
  } catch (err) {
    console.error("Fetch failed:", err);
    return (
      <UserList
        result={{
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          pageCount: 0,
        }}
      />
    );
  }
}
