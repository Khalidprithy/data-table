import { type NextRequest, NextResponse } from "next/server"

// Mock database of users
const users = Array.from({ length: 100 }).map((_, i) => ({
  id: `USR${i.toString().padStart(3, "0")}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: i % 3 === 0 ? "admin" : i % 3 === 1 ? "user" : "manager",
  status: i % 4 === 0 ? "active" : "inactive",
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
}))

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // Parse query parameters
  const page = Number.parseInt(searchParams.get("page") || "1")
  const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")
  const search = searchParams.get("search") || ""
  const sortBy = searchParams.get("sortBy") || "id"
  const sortOrder = searchParams.get("sortOrder") || "asc"

  // Parse filters
  const filters: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith("filter[") && key.endsWith("]")) {
      const filterKey = key.slice(7, -1)
      filters[filterKey] = value
    }
  }

  // Apply filters and search
  let filteredUsers = [...users]

  // Apply search
  if (search) {
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.id.toLowerCase().includes(search.toLowerCase()),
    )
  }

  // Apply column filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      const values = Array.isArray(value) ? value : [value]
      filteredUsers = filteredUsers.filter((user) => values.includes(user[key as keyof typeof user] as string))
    }
  })

  // Apply sorting
  filteredUsers.sort((a, b) => {
    const aValue = a[sortBy as keyof typeof a]
    const bValue = b[sortBy as keyof typeof b]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  // Apply pagination
  const total = filteredUsers.length
  const startIndex = (page - 1) * pageSize
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize)

  // Return paginated results
  return NextResponse.json({
    data: paginatedUsers,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
  })
}

