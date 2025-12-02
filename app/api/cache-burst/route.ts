import { NextResponse } from "next/server"
import { unstable_cache } from "next/cache"

export const runtime = "nodejs"

const cachedFetch = unstable_cache(
  async (id: string) => {
    const res = await fetch("https://httpbin.org/delay/0")
    await res.json()
    return { id }
  },
  ["cache-burst-test"],
  { revalidate: 3600 },
)

export async function GET() {
  const startTime = Date.now()
  console.log("[cache-burst] Starting test at", new Date().toISOString())

  // Create array of 70 IDs
  const ids = Array.from({ length: 70 }, (_, i) => String(i))

  // Fetch all in parallel using cached function
  const promises = ids.map((id) => cachedFetch(id))

  await Promise.all(promises)

  const endTime = Date.now()
  const totalDurationMs = endTime - startTime

  console.log("[cache-burst] Completed at", new Date().toISOString(), "Duration:", totalDurationMs, "ms")

  return NextResponse.json({
    mode: "unstable_cache",
    requestCount: 70,
    totalDurationMs,
  })
}
