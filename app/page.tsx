import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowRight, Users, BarChart, Brain } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm px-4 lg:px-8 h-16 flex items-center shadow-sm">
        <Link className="flex items-center justify-center" href="#">
          <div className="bg-white/10 p-2 rounded-md">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-xl font-semibold text-white">MediTriage AI</span>
        </Link>
        <nav className="ml-auto flex gap-6">
          {[
            { name: "Dashboard", href: "/dashboard" },
            { name: "Chat", href: "/chat" },
            { name: "Triage", href: "/triage" },
            { name: "ML Triage", href: "/ml-triage" }
          ].map((item) => (
            <Link 
              key={item.name}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors relative group"
              href={item.href}
            >
              {item.name}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
          <div className="container px-4 md:px-6 max-w-5xl mx-auto">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                Healthcare AI Solutions
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-foreground">
                  AI-Powered Patient Triage System
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Streamline patient assessment with our advanced ML algorithm that helps prioritize care based on
                  clinical data.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 justify-center mt-4">
                <Link href="/ml-triage">
                  <Button className="gap-2 px-6 py-6 rounded-xl text-base font-medium hover:shadow-md transition-all">
                    Start ML Triage Assessment 
                    <ArrowRight className="h-4 w-4 animate-pulse" />
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="px-6 py-6 rounded-xl text-base font-medium hover:shadow-md transition-all">
                    Chat with Assistant
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Key Features</h2>
            <div className="grid gap-8 lg:grid-cols-3">
              {[
                {
                  icon: <Users className="h-10 w-10 text-primary" />,
                  title: "Patient Management",
                  description: "Manage patient records, history, and triage assessments in one place.",
                  content: "Quickly access patient information, previous visits, and triage history to make informed decisions.",
                  link: { href: "/dashboard", text: "View Patients" }
                },
                {
                  icon: <Brain className="h-10 w-10 text-primary" />,
                  title: "ML-Powered Triage",
                  description: "Advanced machine learning algorithm to prioritize patients based on clinical urgency.",
                  content: "Our ML model analyzes symptoms and vital signs to provide accurate triage recommendations and severity scores.",
                  link: { href: "/ml-triage", text: "Start ML Assessment" }
                },
                {
                  icon: <BarChart className="h-10 w-10 text-primary" />,
                  title: "AI Chat Assistant",
                  description: "Interact with our medical AI assistant for preliminary assessments.",
                  content: "Chat with our AI to describe symptoms and get initial guidance before formal triage assessment.",
                  link: { href: "/chat", text: "Start Chat" }
                }
              ].map((feature, index) => (
                <Card key={index} className="border-none m-4 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <CardHeader className="pb-4">
                    <div className="p-3 bg-primary/10 rounded-xl w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.content}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={feature.link.href} className="w-full">
                      <Button variant="outline" size="lg" className="w-full group-hover:bg-primary group-hover:text-white transition-all">
                        {feature.link.text}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">MediTriage AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 MediTriage AI. All rights reserved. For clinical decision support only.
            </p>
            <nav className="flex gap-6">
              {["Terms of Service", "Privacy", "Contact"].map((item) => (
                <Link key={item} className="text-sm text-muted-foreground hover:text-primary transition-colors" href="#">
                  {item}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}