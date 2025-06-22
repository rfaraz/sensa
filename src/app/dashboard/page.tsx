"use client"
import { useEffect, useState } from "react"
import PatientDashboard from "@/components/PatientDashboard"

export default function DashboardPage() {
  // Define a type for your dashboard data
  type PatientDataType = {
    name: string
    age: number
    gender: string
    phone: string
    callDate: string
    duration: string
    urgency: string
  }

  type ExtractedSymptom = {
    symptom: string
    severity: string
    duration: string
    location: string
    description: string
  }

  type ClinicalNote = ClinicalNote[]

  type DashboardData = {
    patientData: PatientDataType
    transcript: string
    extractedSymptoms: ExtractedSymptom[]
    actions?: string[]
    clinicalNotes?: ClinicalNote[]
  }

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("dashboardData")
    if (stored) {
      setDashboardData(JSON.parse(stored))
    }
  }, [])

  if (!dashboardData) {
    return <div className="p-8">Loading dashboard...</div>
  }

  return (
    <PatientDashboard 
      patientData={dashboardData.patientData}
      transcript={dashboardData.transcript}
      extractedSymptoms={dashboardData.extractedSymptoms}
      actions={dashboardData.actions ?? []}
      clinicalNotes={dashboardData.clinicalNotes}
    />
  )
}
