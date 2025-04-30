import { fetchUsers } from "@/lib/actions/user"
import UserList from "../components/users/UserList"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

// Loading component for Suspense
function UserListSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="border rounded-lg p-4 bg-card">
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[150px]" />
          </div>
          <Skeleton className="h-[400px] w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-10 w-[150px]" />
            <Skeleton className="h-10 w-[250px]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { page, pageSize, search, searchFields, status, role } = searchParams || {}

  const pageNo = Number(page) || 1
  const pageSizes = Number(pageSize) || 10
  const query = Array.isArray(search) ? search.join(",") : search || ""
  const searchFieldsArray = Array.isArray(searchFields)
    ? searchFields
    : searchFields?.split(",") || ["name", "email", "id"]

  // Get status and role from URL parameters
  const statusValue = Array.isArray(status) ? status[0] : status
  const roleValue = Array.isArray(role) ? role[0] : role

  try {
    // Use Suspense for better loading experience
    return (
      <Suspense fallback={<UserListSkeleton />}>
        <UserListContent
          pageNo={pageNo}
          pageSizes={pageSizes}
          query={query}
          searchFieldsArray={searchFieldsArray}
          statusValue={statusValue}
          roleValue={roleValue}
        />
      </Suspense>
    )
  } catch (err) {
    console.error("Server action failed:", err)
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
    )
  }
}

// Separate component to fetch data
async function UserListContent({
  pageNo,
  pageSizes,
  query,
  searchFieldsArray,
  statusValue,
  roleValue,
}: {
  pageNo: number
  pageSizes: number
  query: string
  searchFieldsArray: string[]
  statusValue?: string
  roleValue?: string
}) {
  const result = await fetchUsers({
    page: pageNo,
    pageSize: pageSizes,
    search: query,
    searchFields: searchFieldsArray,
    status: statusValue,
    role: roleValue,
  })

  return <UserList result={result} />
}
