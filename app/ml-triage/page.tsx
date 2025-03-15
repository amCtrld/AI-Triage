"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Toaster } from "@/components/ui/sonner"
import { PatientRegistrationForm, type PatientFormValues } from "@/components/patient-registration-form"
import { SymptomAssessmentForm, type SymptomFormValues } from "@/components/symptom-assessment-form"
import { AIChatTriage } from "@/components/ai-chat-triage"
import { MLTriageResult } from "@/components/ml-triage-result"
import { ApiStatus } from "@/components/api-status"
import { API_ENDPOINTS, fetchWithErrorHandling } from "@/api-config"

export default function MLTriagePage() {
  const [step, setStep] = useState(1)
  const [assessmentMethod, setAssessmentMethod] = useState<"form" | "chat">("form")
  const [patientData, setPatientData] = useState<PatientFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [triageResult, setTriageResult] = useState<{
    triage_category: string
    recommendation: string
    explanation: string
  } | null>(null)

  const handlePatientSubmit = (values: PatientFormValues) => {
    setPatientData(values)
    setStep(2)
  }

  const handleSymptomSubmit = async (values: SymptomFormValues) => {
    if (!patientData) return

    setIsLoading(true)

    try {
      // Combine patient data with symptom data
      const combinedData = {
        name: patientData.name,
        age: Number.parseInt(patientData.age),
        gender: patientData.gender,
        weight: patientData.weight,
        height: patientData.height,
        medicalHistory: patientData.medicalHistory,
        currentMedications: patientData.currentMedications,
        allergies: patientData.allergies,

        // Symptom data
        chiefComplaint: values.chiefComplaint,
        fever: values.fever,
        pain: values.pain,
        cough: values.cough,
        shortness_of_breath: values.shortness_of_breath,
        nausea: values.nausea,
        dizziness: values.dizziness,
        rash: values.rash,
        temperature: values.temperature ? Number.parseFloat(values.temperature) : undefined,
        heart_rate: values.heart_rate ? Number.parseInt(values.heart_rate) : undefined,
        systolic_bp: values.systolic_bp ? Number.parseInt(values.systolic_bp) : undefined,
        diastolic_bp: values.diastolic_bp ? Number.parseInt(values.diastolic_bp) : undefined,
        oxygen_saturation: values.oxygen_saturation ? Number.parseInt(values.oxygen_saturation) : undefined,
        duration_days: Number.parseInt(values.duration_days),
        additionalSymptoms: values.additionalSymptoms,
      }

      // Send to the direct triage endpoint
      const result = await fetchWithErrorHandling(API_ENDPOINTS.directTriage, {
        method: "POST",
        body: JSON.stringify(combinedData),
      })

      setTriageResult(result)
      setStep(3)
    } catch (error) {
      console.error("Error submitting symptoms:", error)
      Toaster({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process triage assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetAssessment = () => {
    setStep(1)
    setPatientData(null)
    setTriageResult(null)
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
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/ml-triage">
            ML Triage
          </Link>
        </nav>
      </header>
      <main className="flex-1 container max-w-4xl py-12">
        <ApiStatus />

        <div className="flex items-center mb-8">
          <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">ML-Powered Triage Assessment</h1>
          <p className="text-muted-foreground mt-2">
            Our machine learning system will analyze your symptoms and provide personalized recommendations.
          </p>
        </div>

        <div className="mb-8">
          <Progress value={step * 33.33} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Patient Information</span>
            <span>Symptom Assessment</span>
            <span>Triage Result</span>
          </div>
        </div>

        {step === 1 && <PatientRegistrationForm onSubmit={handlePatientSubmit} isLoading={isLoading} />}

        {step === 2 && patientData && (
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue={assessmentMethod} onValueChange={(v) => setAssessmentMethod(v as "form" | "chat")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="form">Structured Form</TabsTrigger>
                    <TabsTrigger value="chat">AI Chat Assessment</TabsTrigger>
                  </TabsList>

                  <TabsContent value="form" className="pt-4">
                    <SymptomAssessmentForm onSubmit={handleSymptomSubmit} isLoading={isLoading} />
                  </TabsContent>

                  <TabsContent value="chat" className="pt-4">
                    <AIChatTriage patientName={patientData.name} patientAge={patientData.age} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {assessmentMethod === "form" && (
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back to Patient Information
                </Button>
              </div>
            )}
          </div>
        )}

        {step === 3 && triageResult && patientData && (
          <MLTriageResult
            triageCategory={triageResult.triage_category}
            recommendation={triageResult.recommendation}
            explanation={triageResult.explanation}
            patientData={{
              name: patientData.name,
              age: patientData.age,
              chiefComplaint: patientData.medicalHistory,
            }}
            onNewAssessment={resetAssessment}
          />
        )}
      </main>
    </div>
  )
}

