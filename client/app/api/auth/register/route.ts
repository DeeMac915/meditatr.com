import { NextRequest, NextResponse } from "next/server";

// Mark this route as dynamic since it uses request headers
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization header required" },
                { status: 401 }
            );
        }

        // Forward the request to the backend server
        const backendUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${backendUrl}/auth/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to create user profile");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Register API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create user profile" },
            { status: 500 }
        );
    }
}
