"use client"

import { AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface TriageResultProps {
  triageCategory: string
  recommendation: string
  explanation: string
  patientData: {
    name: string
    age: string | number
    chiefComplaint?: string
    symptoms?: string
  }
  onNewAssessment?: () => void
}

export function MLTriageResult({
  triageCategory,
  recommendation,
  explanation,
  patientData,
  onNewAssessment,
}: TriageResultProps) {
  
  // Determine border color based on triage category
  const getBorderColor = () => {
    const category = triageCategory.toLowerCase()
    if (category.includes("very severe") || category.includes("emergency")) return "border-l-red-500"
    if (category.includes("severe") || category.includes("urgent")) return "border-l-orange-500"
    if (category.includes("moderate")) return "border-l-yellow-500"
    if (category.includes("mild") || category.includes("not severe")) return "border-l-green-500"
    return "border-l-blue-500"
  }

  // Determine icon based on triage category
  const getIcon = () => {
    const category = triageCategory.toLowerCase()
    if (
      category.includes("very severe") ||
      category.includes("emergency") ||
      category.includes("severe") ||
      category.includes("urgent")
    ) {
      return <AlertTriangle className="h-6 w-6 text-red-500" />
    }
    if (category.includes("moderate")) {
      return <Clock className="h-6 w-6 text-yellow-500" />
    }
    return <CheckCircle className="h-6 w-6 text-green-500" />
  }

  return (
    <div className="space-y-8">
      <Card className={`border-l-8 ${getBorderColor()}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="capitalize">{triageCategory}</CardTitle>
          </div>
          <CardDescription>Recommendation: {recommendation}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Assessment Explanation</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{explanation}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Patient Information</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p>{patientData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p>{patientData.age}</p>
                </div>
                {patientData.chiefComplaint && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Chief Complaint</p>
                    <p>{patientData.chiefComplaint}</p>
                  </div>
                )}
                {patientData.symptoms && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Symptoms</p>
                    <p>{patientData.symptoms}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground italic">
              <p>
                Note: This is an AI-assisted recommendation. Always use clinical judgment when making triage decisions.
              </p>
            </div>
          </div>
        </CardContent>
        {onNewAssessment && (
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onNewAssessment}>
              New Assessment
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

