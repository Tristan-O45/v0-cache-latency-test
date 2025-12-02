"use client"

import { useState } from "react"

type TestResult = {
  mode: string
  requestCount: number
  totalDurationMs: number
} | null

export default function HomePage() {
  const [noCacheResult, setNoCacheResult] = useState<TestResult>(null)
  const [cacheResult, setCacheResult] = useState<TestResult>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const runTest = async (endpoint: string, setter: (result: TestResult) => void) => {
    setLoading(endpoint)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setter(data)
    } catch (error) {
      console.error("Test failed:", error)
      setter(null)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ padding: "40px", fontFamily: "monospace" }}>
      <h1>Cache Latency Reproduction Test</h1>
      <p>Click each button once, then again to see cache effects. Check Vercel Observability after deployment.</p>

      <div style={{ marginTop: "30px" }}>
        <h2>Test 1: No Cache (Direct Fetches)</h2>
        <button
          onClick={() => runTest("/api/no-cache-burst", setNoCacheResult)}
          disabled={loading !== null}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "10px",
          }}
        >
          {loading === "/api/no-cache-burst" ? "Running..." : "Run no-cache test"}
        </button>
        {noCacheResult && (
          <pre
            style={{
              background: "#f4f4f4",
              padding: "15px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(noCacheResult, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Test 2: unstable_cache</h2>
        <button
          onClick={() => runTest("/api/cache-burst", setCacheResult)}
          disabled={loading !== null}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "10px",
          }}
        >
          {loading === "/api/cache-burst" ? "Running..." : "Run unstable_cache test"}
        </button>
        {cacheResult && (
          <pre
            style={{
              background: "#f4f4f4",
              padding: "15px",
              borderRadius: "5px",
              overflow: "auto",
            }}
          >
            {JSON.stringify(cacheResult, null, 2)}
          </pre>
        )}
      </div>

      <div style={{ marginTop: "40px", padding: "20px", background: "#fff3cd", borderRadius: "5px" }}>
        <h3>Expected Behavior</h3>
        <ul>
          <li>
            <strong>No-cache test:</strong> Always fetches 70 times from httpbin.org. Check Vercel Observability →
            External APIs to see all 70 calls.
          </li>
          <li>
            <strong>unstable_cache test (first run):</strong> Fetches 70 times + writes to Data Cache. Slower.
          </li>
          <li>
            <strong>unstable_cache test (second run):</strong> Reads from Data Cache. Should be faster. Check
            Observability for Data Cache reads instead of External APIs.
          </li>
        </ul>
      </div>
    </div>
  )
}
