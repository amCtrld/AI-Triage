"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { API_ENDPOINTS } from "@/api-config"

export function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">("checking")
  const [retrying, setRetrying] = useState(false)

  const checkApiStatus = async () => {
    try {
      setStatus("checking")
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

      const response = await fetch(API_ENDPOINTS.chat.replace("/chat", "/"), {
        method: "GET",
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      setStatus(response.ok ? "online" : "offline")
    } catch (error) {
      setStatus("offline")
    }
  }

  useEffect(() => {
    checkApiStatus()
  }, [])

  const handleRetry = async () => {
    setRetrying(true)
    await checkApiStatus()
    setRetrying(false)
  }

  if (status === "checking") {
    return null
  }

  if (status === "offline") {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Connection Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>
            Cannot connect to the backend server. Please ensure the server is running at{" "}
            {API_ENDPOINTS.chat.split("/chat")[0]}.
          </p>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
              {retrying ? "Checking..." : "Retry Connection"}
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return null
}

