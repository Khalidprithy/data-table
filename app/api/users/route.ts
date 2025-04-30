import { type NextRequest, NextResponse } from "next/server";

// Mock database of users
const users = Array.from({ length: 100 }).map((_, i) => ({
  id: `USR${i.toString().padStart(3, "0")}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "user" : "manager",
  status: i % 4 === 0 ? "active" : "inactive",
  createdAt: new Date(
    Date.now() - Math.floor(Math.random() * 10000000000)
  ).toISOString(),
}));

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    // Pagination & sorting
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Extract filters like filter[role]=admin
    const filters: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      const match = key.match(/^filter\[(.+)]$/);
      if (match) {
        filters[match[1]] = value;
      }
    }

    // Filter users
    let filteredUsers = users.filter((user) => {
      // Search filter
      const matchSearch =
        !search ||
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.id.toLowerCase().includes(search);

      // Field-specific filters
      const matchFilters = Object.entries(filters).every(
        ([filterKey, filterValue]) => {
          const userValue = user[filterKey as keyof typeof user];
          return userValue === filterValue;
        }
      );

      return matchSearch && matchFilters;
    });

    // Sort users
    filteredUsers.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    // Pagination
    const total = filteredUsers.length;
    const pageCount = Math.ceil(total / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedUsers = filteredUsers.slice(
      startIndex,
      startIndex + pageSize
    );

    // Simulate network delay (for testing)
    await new Promise((resolve) => setTimeout(resolve, 300));

    return NextResponse.json({
      data: paginatedUsers,
      total,
      page,
      pageSize,
      pageCount,
    });
  } catch (error) {
    console.error("Error processing users request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
