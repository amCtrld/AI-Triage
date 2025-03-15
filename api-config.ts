// Update the API_ENDPOINTS to include the new ML endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/chat`,
  getPatients: `${API_BASE_URL}/get-patients`,
  registerPatient: `${API_BASE_URL}/register-patient`,

  // New ML endpoints
  mlTriage: `${API_BASE_URL}/ml-triage`,
  directTriage: `${API_BASE_URL}/direct-triage`,
  chatWithTriage: `${API_BASE_URL}/chat-with-triage`,
}

// Helper function for API requests with error handling
export async function fetchWithErrorHandling(url: string, options: RequestInit = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers || {}),
      },
    })

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = ""
      try {
        const errorData = await response.json()
        errorDetails = errorData.detail || errorData.message || ""
      } catch (e) {
        // If we can't parse the error response, just use the status text
        errorDetails = response.statusText
      }

      throw new Error(`API Error (${response.status}): ${errorDetails}`)
    }

    return await response.json()
  } catch (error) {
    // Check if it's a network error (like backend not running)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Cannot connect to the backend server at ${API_BASE_URL}. Please ensure the server is running.`)
    }

    // Re-throw the error to be handled by the component
    throw error
  }
}

