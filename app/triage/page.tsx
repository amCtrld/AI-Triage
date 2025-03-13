"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Activity, AlertTriangle, ArrowLeft, CheckCircle, ChevronRight, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/sonner"

const formSchema = z.object({
  patientName: z.string().min(2, { message: "Patient name is required" }),
  patientAge: z.string().min(1, { message: "Age is required" }),
  patientGender: z.string().min(1, { message: "Gender is required" }),
  chiefComplaint: z.string().min(5, { message: "Chief complaint is required" }),
  painLevel: z.string().min(1, { message: "Pain level is required" }),
  temperature: z.string().optional(),
  heartRate: z.string().optional(),
  respiratoryRate: z.string().optional(),
  bloodPressure: z.string().optional(),
  oxygenSaturation: z.string().optional(),
  additionalSymptoms: z.string().optional(),
  medicalHistory: z.string().optional(),
})

export default function TriagePage() {
  const [step, setStep] = useState(1)
  const [triageResult, setTriageResult] = useState<null | {
    level: "urgent" | "high" | "medium" | "low"
    score: number
    recommendation: string
  }>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: "",
      patientAge: "",
      patientGender: "",
      chiefComplaint: "",
      painLevel: "",
      temperature: "",
      heartRate: "",
      respiratoryRate: "",
      bloodPressure: "",
      oxygenSaturation: "",
      additionalSymptoms: "",
      medicalHistory: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)

    // This is where you would normally send the data to your backend
    // For demo purposes, we'll simulate a triage result
    setStep(2) // Show processing step

    try {
      // Register the patient in the database
      const patientData = {
        name: values.patientName,
        age: Number.parseInt(values.patientAge),
        gender: values.patientGender,
        chiefComplaint: values.chiefComplaint,
        painLevel: values.painLevel,
        vitals: {
          temperature: values.temperature,
          heartRate: values.heartRate,
          respiratoryRate: values.respiratoryRate,
          bloodPressure: values.bloodPressure,
          oxygenSaturation: values.oxygenSaturation,
        },
        additionalSymptoms: values.additionalSymptoms,
        medicalHistory: values.medicalHistory,
      }

      // Attempt to register the patient
      const registerResponse = await fetch("http://127.0.0.1:8000/register-patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      })

      if (!registerResponse.ok) {
        throw new Error("Failed to register patient")
      }

      // Simulate ML model processing
      setTimeout(() => {
        // Mock triage result - in a real app, this would come from your ML model
        const mockTriageResults = [
          {
            level: "urgent",
            score: 92,
            recommendation: "Immediate medical attention required. Patient should be seen immediately by a physician.",
          },
          {
            level: "high",
            score: 78,
            recommendation: "High priority. Patient should be seen within 10-15 minutes.",
          },
          {
            level: "medium",
            score: 45,
            recommendation: "Medium priority. Patient should be seen within 30-60 minutes.",
          },
          {
            level: "low",
            score: 22,
            recommendation: "Low priority. Patient can wait for routine care.",
          },
        ]

        // Select a random result for demonstration
        const randomIndex = Math.floor(Math.random() * mockTriageResults.length)
        setTriageResult(mockTriageResults[randomIndex] as any)
        setStep(3)
      }, 1500)
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "Failed to process triage assessment. Please try again.",
        variant: "destructive",
      })
      setStep(1)
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
        </nav>
      </header>
      <main className="flex-1 container max-w-4xl py-12">
        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Patient Triage Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Enter patient information to receive AI-assisted triage recommendations.
          </p>
        </div>

        <div className="mb-8">
          <Progress value={step === 1 ? 33 : step === 2 ? 66 : 100} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Patient Information</span>
            <span>Processing</span>
            <span>Triage Result</span>
          </div>
        </div>

        {step === 1 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Information</TabsTrigger>
                  <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                  <TabsTrigger value="history">Medical History</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="patientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="patientAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input placeholder="Age" type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="patientGender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chiefComplaint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chief Complaint</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the main reason for the visit"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="painLevel"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Pain Level (0-10)</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                              <FormItem key={level} className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={level.toString()} />
                                </FormControl>
                                <FormLabel className="font-normal">{level}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="vitals" className="space-y-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="temperature"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temperature (°F)</FormLabel>
                          <FormControl>
                            <Input placeholder="98.6" {...field} />
                          </FormControl>
                          <FormDescription>Normal range: 97.7-99.5°F</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="heartRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Heart Rate (BPM)</FormLabel>
                          <FormControl>
                            <Input placeholder="70" {...field} />
                          </FormControl>
                          <FormDescription>Normal range: 60-100 BPM</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="respiratoryRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Respiratory Rate (breaths/min)</FormLabel>
                          <FormControl>
                            <Input placeholder="16" {...field} />
                          </FormControl>
                          <FormDescription>Normal range: 12-20 breaths/min</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Pressure (mmHg)</FormLabel>
                          <FormControl>
                            <Input placeholder="120/80" {...field} />
                          </FormControl>
                          <FormDescription>Format: systolic/diastolic</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="oxygenSaturation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Oxygen Saturation (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="98" {...field} />
                          </FormControl>
                          <FormDescription>Normal range: 95-100%</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="additionalSymptoms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Symptoms</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe any additional symptoms"
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="medicalHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relevant Medical History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Include any relevant medical history, allergies, medications, etc."
                            className="resize-none min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end">
                <Button type="submit" className="gap-1">
                  Submit for Triage <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        )}

        {step === 2 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-primary/20 p-4 mb-4">
                <Activity className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Processing Triage Assessment</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Our AI model is analyzing the patient data to determine the appropriate triage level. This will only
                take a moment...
              </p>
            </div>
          </div>
        )}

        {step === 3 && triageResult && (
          <div className="space-y-8">
            <Card
              className={`border-l-8 ${
                triageResult.level === "urgent"
                  ? "border-l-red-500"
                  : triageResult.level === "high"
                    ? "border-l-orange-500"
                    : triageResult.level === "medium"
                      ? "border-l-yellow-500"
                      : "border-l-green-500"
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  {triageResult.level === "urgent" ? (
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                  ) : triageResult.level === "high" ? (
                    <Clock className="h-6 w-6 text-orange-500" />
                  ) : triageResult.level === "medium" ? (
                    <Clock className="h-6 w-6 text-yellow-500" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  )}
                  <CardTitle className="capitalize">{triageResult.level} Priority</CardTitle>
                </div>
                <CardDescription>Triage Score: {triageResult.score}/100</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Recommendation</h3>
                    <p>{triageResult.recommendation}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p>{form.getValues().patientName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Age</p>
                        <p>{form.getValues().patientAge}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Chief Complaint</p>
                        <p>{form.getValues().chiefComplaint}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pain Level</p>
                        <p>{form.getValues().painLevel}/10</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground italic">
                    <p>
                      Note: This is an AI-assisted recommendation. Always use clinical judgment when making triage
                      decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  New Assessment
                </Button>
                <Button>Save to Patient Record</Button>
              </CardFooter>
            </Card>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium mb-2">AI Model Explanation</h3>
              <p className="text-sm text-muted-foreground">
                This triage recommendation was generated based on the patient's vital signs, reported symptoms, pain
                level, and medical history. The model has been trained on thousands of previous triage cases and follows
                established clinical guidelines. Key factors in this assessment included:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                <li>Chief complaint severity</li>
                <li>Vital sign abnormalities</li>
                <li>Pain level assessment</li>
                <li>Age-related risk factors</li>
                <li>Potential for rapid deterioration</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

