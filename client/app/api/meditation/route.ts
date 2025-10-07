import { NextRequest, NextResponse } from "next/server";

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
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${backendUrl}/api/meditation`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: authHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to get meditations");
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Meditations API error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to get meditations" },
            { status: 500 }
        );
    }
}
