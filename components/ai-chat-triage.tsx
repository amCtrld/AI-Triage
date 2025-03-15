"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

const symptomFormSchema = z.object({
  chiefComplaint: z.string().min(5, { message: "Please describe your main symptoms" }),
  fever: z.number().min(0).max(3),
  pain: z.number().min(0).max(3),
  cough: z.number().min(0).max(3),
  shortness_of_breath: z.number().min(0).max(3),
  nausea: z.number().min(0).max(3),
  dizziness: z.number().min(0).max(3),
  rash: z.number().min(0).max(3),
  temperature: z.string().optional(),
  heart_rate: z.string().optional(),
  systolic_bp: z.string().optional(),
  diastolic_bp: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  duration_days: z.string().min(1, { message: "Duration is required" }),
  additionalSymptoms: z.string().optional(),
})

export type SymptomFormValues = z.infer<typeof symptomFormSchema>

interface SymptomAssessmentFormProps {
  onSubmit: (values: SymptomFormValues) => void
  isLoading?: boolean
}

export function SymptomAssessmentForm({ onSubmit, isLoading = false }: SymptomAssessmentFormProps) {
  const form = useForm<SymptomFormValues>({
    resolver: zodResolver(symptomFormSchema),
    defaultValues: {
      chiefComplaint: "",
      fever: 0,
      pain: 0,
      cough: 0,
      shortness_of_breath: 0,
      nausea: 0,
      dizziness: 0,
      rash: 0,
      temperature: "",
      heart_rate: "",
      systolic_bp: "",
      diastolic_bp: "",
      oxygen_saturation: "",
      duration_days: "",
      additionalSymptoms: "",
    },
  })

  const severityLabels = ["None", "Mild", "Moderate", "Severe"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Symptom Assessment</CardTitle>
        <CardDescription>Please provide details about your symptoms to help us assess your condition.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="symptoms" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
                <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
                <TabsTrigger value="additional">Additional Info</TabsTrigger>
              </TabsList>

              <TabsContent value="symptoms" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Main Symptoms</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your main symptoms and concerns"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="How many days have you had these symptoms?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Symptom Severity</h3>

                  {[
                    { name: "fever", label: "Fever" },
                    { name: "pain", label: "Pain" },
                    { name: "cough", label: "Cough" },
                    { name: "shortness_of_breath", label: "Shortness of Breath" },
                    { name: "nausea", label: "Nausea" },
                    { name: "dizziness", label: "Dizziness" },
                    { name: "rash", label: "Rash" },
                  ].map((symptom) => (
                    <FormField
                      key={symptom.name}
                      control={form.control}
                      name={symptom.name as keyof SymptomFormValues}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between">
                            <FormLabel>{symptom.label}</FormLabel>
                            <span className="text-sm text-muted-foreground">{severityLabels[field.value]}</span>
                          </div>
                          <FormControl>
                            <Slider
                              min={0}
                              max={3}
                              step={1}
                              defaultValue={[field.value]}
                              onValueChange={(vals) => field.onChange(vals[0])}
                              className="py-4"
                            />
                          </FormControl>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>None</span>
                            <span>Mild</span>
                            <span>Moderate</span>
                            <span>Severe</span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
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
                    name="heart_rate"
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="systolic_bp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Systolic BP (mmHg)</FormLabel>
                          <FormControl>
                            <Input placeholder="120" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diastolic_bp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diastolic BP (mmHg)</FormLabel>
                          <FormControl>
                            <Input placeholder="80" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="oxygen_saturation"
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

                <FormDescription className="text-center">
                  If you don't know your vital signs, you can leave these fields blank.
                </FormDescription>
              </TabsContent>

              <TabsContent value="additional" className="space-y-6 pt-4">
                <FormField
                  control={form.control}
                  name="additionalSymptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Symptoms or Concerns</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe any other symptoms or concerns not covered above"
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Submit Symptoms"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

