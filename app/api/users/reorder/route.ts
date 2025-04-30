import { NextResponse } from "next/server"

// This endpoint handles saving the reordered users
export async function POST(request: Request) {
  try {
    // Parse the request body to get the reordered users
    const { users } = await request.json()

    // In a real application, you would save this to your database
    // For example:
    // await db.users.updateMany({ data: users.map((user, index) => ({ id: user.id, order: index })) })

    // For this example, we'll just log the reordered users and return success
    console.log(
      "Saved reordered users:",
      users.map((user: any) => user.id),
    )

    // Return success response
    return NextResponse.json({
      success: true,
      message: "User order updated successfully",
    })
  } catch (error) {
    console.error("Error saving user order:", error)

    // Return error response
    return NextResponse.json({ success: false, message: "Failed to update user order" }, { status: 500 })
  }
}
