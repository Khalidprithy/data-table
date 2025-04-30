import { fetchUsers } from "@/lib/actions/user";
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

  try {
    const result = await fetchUsers({
      page: pageNo,
      pageSize: pageSizes,
      search: query,
    });

    return <UserList result={result} />;
  } catch (err) {
    console.error("Server action failed:", err);
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
