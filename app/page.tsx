import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowRight, Users, ClipboardList, BarChart } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="#">
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
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  AI-Powered Patient Triage System
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Streamline patient assessment with our advanced ML algorithm that helps prioritize care based on
                  clinical data.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/triage">
                  <Button className="gap-1">
                    Start Triage Assessment <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline">Chat with Assistant</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card>
                <CardHeader>
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Patient Management</CardTitle>
                  <CardDescription>
                    Manage patient records, history, and triage assessments in one place.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Quickly access patient information, previous visits, and triage history to make informed decisions.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      View Patients
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <ClipboardList className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Triage Assessment</CardTitle>
                  <CardDescription>
                    AI-powered triage system to prioritize patients based on clinical urgency.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>
                    Input patient symptoms and vital signs to receive AI-assisted triage recommendations and severity
                    scores.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href="/triage">
                    <Button variant="outline" size="sm">
                      Start Assessment
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>AI Chat Assistant</CardTitle>
                  <CardDescription>Interact with our medical AI assistant for preliminary assessments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Chat with our AI to describe symptoms and get initial guidance before formal triage assessment.</p>
                </CardContent>
                <CardFooter>
                  <Link href="/chat">
                    <Button variant="outline" size="sm">
                      Start Chat
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          © 2025 MediTriage AI. All rights reserved. For clinical decision support only.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  )
}

