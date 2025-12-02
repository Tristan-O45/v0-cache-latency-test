import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET() {
  const startTime = Date.now()
  console.log("[no-cache-burst] Starting test at", new Date().toISOString())

  // Create array of 70 IDs
  const ids = Array.from({ length: 70 }, (_, i) => String(i))

  // Fetch all in parallel
  const promises = ids.map(async (id) => {
    const res = await fetch("https://httpbin.org/delay/0")
    const data = await res.json()
    return { id, data }
  })

  await Promise.all(promises)

  const endTime = Date.now()
  const totalDurationMs = endTime - startTime

  console.log("[no-cache-burst] Completed at", new Date().toISOString(), "Duration:", totalDurationMs, "ms")

  return NextResponse.json({
    mode: "no-cache",
    requestCount: 70,
    totalDurationMs,
  })
}
