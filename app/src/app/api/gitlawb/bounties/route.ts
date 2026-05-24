import { NextResponse } from "next/server";

const COORDINATOR_URL =
  process.env.NEXT_PUBLIC_COORDINATOR_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const url = status
      ? `${COORDINATOR_URL}/v1/gitlawb/bounties?status=${status}`
      : `${COORDINATOR_URL}/v1/gitlawb/bounties`;

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 10 }, // Cache for 10 seconds
    });

    if (!res.ok) {
      throw new Error(`Coordinator responded with ${res.status}`);
    }

    const bounties = await res.json();
    return NextResponse.json(bounties);
  } catch (error: any) {
    console.error("Failed to fetch bounties:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch bounties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { challengeId, title, repoName, reward } = body;

    if (!challengeId || !title || !repoName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const res = await fetch(`${COORDINATOR_URL}/v1/gitlawb/bounties`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-scrap-secret": process.env.SCRAP_WEBHOOK_SECRET || "",
      },
      body: JSON.stringify({
        challengeId,
        title,
        repoName,
        reward,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const bounty = await res.json();
    return NextResponse.json(bounty);
  } catch (error: any) {
    console.error("Failed to create bounty:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create bounty" },
      { status: 500 }
    );
  }
}
