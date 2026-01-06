import { NextRequest, NextResponse } from "next/server";

// Mark this route as dynamic since it uses request headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
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
        const response = await fetch(`${backendUrl}/auth/profile`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to get profile");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Profile GET API error:", error);
        console.error("Error details:", {
            message: error.message,
            cause: error.cause,
            stack: error.stack,
        });
        return NextResponse.json(
            { error: error.message || "Failed to get profile" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
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
        const response = await fetch(`${backendUrl}/auth/profile`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update profile");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Profile API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update profile" },
            { status: 500 }
        );
    }
}
