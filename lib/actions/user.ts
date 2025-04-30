"use server";

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

type Params = {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: keyof typeof users[0];
  sortOrder?: "asc" | "desc";
  filters?: Record<string, string>;
};

export async function fetchUsers({
  page = 1,
  pageSize = 10,
  search = "",
  sortBy = "id",
  sortOrder = "asc",
  filters = {},
}: Params) {
  try {
    // Filter users
    let filteredUsers = users.filter((user) => {
      const matchSearch =
        !search ||
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase());

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
      const aVal = a[sortBy];
      const bVal = b[sortBy];

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
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      data: paginatedUsers,
      total,
      page,
      pageSize,
      pageCount,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users.");
  }
}



type User = {
  id: string;
  [key: string]: any;
};

export async function saveUserOrder(users: User[]) {
  try {
    // In a real app, save the user order to your database
    // e.g., await db.users.updateMany(...)

    // For demo purposes, log the order
    console.log("Saved reordered users:", users.map((user) => user.id));

    return {
      success: true,
      message: "User order updated successfully",
    };
  } catch (error) {
    console.error("Error saving user order:", error);
    return {
      success: false,
      message: "Failed to update user order",
    };
  }
}
