"use client"
import { useEffect, useState } from "react"
import PatientDashboard from "@/components/PatientDashboard"

export default function DashboardPage() {
  // Define a type for your dashboard data
  type DashboardData = {
    patientData: any
    transcript: any
    extractedSymptoms: any
    actions: any
    clinicalNotes: any
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
      actions={dashboardData.actions}
      clinicalNotes={dashboardData.clinicalNotes}
    />
  )
}
