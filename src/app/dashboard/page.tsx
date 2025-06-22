"use client"
import { useEffect, useState } from "react"
import PatientDashboard from "@/components/PatientDashboard"

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any | null>(null)

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
