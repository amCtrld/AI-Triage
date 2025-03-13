"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Activity, ArrowUpRight, Calendar, Clock, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

interface Patient {
  id: string
  name: string
  age: number
  gender?: string
  triageLevel?: string
  chiefComplaint?: string
}

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://127.0.0.1:8000/get-patients")

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched data:", data)
        setPatients(data)
        setError(null)
      } catch (error) {
        console.error("Error fetching patients:", error)
        setError("Failed to load patient data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Function to determine triage level class
  const getTriageLevelClass = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Activity className="h-6 w-6 text-white" />
          <span className="ml-2 text-lg font-bold text-white">MediTriage AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/chat">
            Chat
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/triage">
            Triage
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="#">
            Settings
          </Link>
        </nav>
      </header>
      <main className="flex-1 container py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Overview of patient data and triage statistics.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/triage">
              <Button>New Triage Assessment</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{patients.length}</div>
                  <p className="text-xs text-muted-foreground">Registered in the system</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Age</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {patients.length > 0
                      ? Math.round(patients.reduce((sum, patient) => sum + (patient.age || 0), 0) / patients.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Years</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
              <Activity className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {patients.filter((p) => p.triageLevel?.toLowerCase() === "urgent").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
                  <p className="text-xs text-muted-foreground">Today</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="patients" className="space-y-4">
          <TabsList>
            <TabsTrigger value="patients">Patient List</TabsTrigger>
            <TabsTrigger value="triage">Triage Status</TabsTrigger>
          </TabsList>

          <TabsContent value="patients" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registered Patients</CardTitle>
                <CardDescription>Complete list of patients in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No patients found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium p-2">Patient ID</th>
                          <th className="text-left font-medium p-2">Name</th>
                          <th className="text-left font-medium p-2">Age</th>
                          <th className="text-left font-medium p-2">Gender</th>
                          <th className="text-left font-medium p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <tr key={patient.id} className="border-b">
                            <td className="p-2">{patient.id.substring(0, 8)}...</td>
                            <td className="p-2">{patient.name}</td>
                            <td className="p-2">{patient.age}</td>
                            <td className="p-2">{patient.gender || "N/A"}</td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="triage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Triage Status</CardTitle>
                <CardDescription>Patients categorized by triage level.</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ) : error ? (
                  <div className="text-center py-4 text-red-500">{error}</div>
                ) : patients.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">No patients found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium p-2">Name</th>
                          <th className="text-left font-medium p-2">Age/Gender</th>
                          <th className="text-left font-medium p-2">Chief Complaint</th>
                          <th className="text-left font-medium p-2">Triage Level</th>
                          <th className="text-left font-medium p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patients.map((patient) => (
                          <tr key={patient.id} className="border-b">
                            <td className="p-2">{patient.name}</td>
                            <td className="p-2">
                              {patient.age}
                              {patient.gender ? `/${patient.gender.charAt(0)}` : ""}
                            </td>
                            <td className="p-2">{patient.chiefComplaint || "Not recorded"}</td>
                            <td className="p-2">
                              {patient.triageLevel ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getTriageLevelClass(patient.triageLevel)}`}
                                >
                                  {patient.triageLevel}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Not triaged</span>
                              )}
                            </td>
                            <td className="p-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

