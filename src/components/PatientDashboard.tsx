import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, AlertTriangle, Calendar, Clock, FileText, Phone, Stethoscope, User, Home, Printer } from "lucide-react"

interface PatientDashboardProps {
  patientData: {
    name: string
    age: number
    gender: string
    phone: string
    callDate: string
    duration: string
    urgency: string
  }
  transcript: string
  extractedSymptoms: Array<{
    symptom: string
    severity: string
    duration: string
    location: string
    description: string
  }>
  actions: string[]
  clinicalNotes: {
    assessment: string
    concerns: string
    plan: string
  }
}

export default function PatientDashboard({
  patientData,
  transcript,
  extractedSymptoms,
  actions,
  clinicalNotes,
}: PatientDashboardProps) {
  
  const [predictedTriage, setPredictedTriage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [allScores, setAllScores] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Method 1: Format symptoms with all details (more comprehensive)
  const formatSymptomsDetailed = () => {
    return extractedSymptoms
      .map(s => `${s.symptom} (${s.severity}, ${s.duration}, ${s.location}): ${s.description}`)
      .join('; ');
  };

  // Method 2: Format symptoms as simple descriptions (cleaner for model)
  const formatSymptomsSimple = () => {
    return extractedSymptoms
      .map(s => s.description || s.symptom)
      .join('. ');
  };

  // Method 3: Format symptoms with severity and location (balanced)
  const formatSymptomsBalanced = () => {
    return extractedSymptoms
      .map(s => {
        let formatted = s.symptom;
        if (s.severity && s.severity !== 'Unknown') formatted += ` (${s.severity})`;
        if (s.location && s.location !== 'Unknown') formatted += ` in ${s.location}`;
        if (s.duration && s.duration !== 'Unknown') formatted += ` for ${s.duration}`;
        if (s.description && s.description !== s.symptom) formatted += ` - ${s.description}`;
        return formatted;
      })
      .join('. ');
  };

  // Method 4: Extract just symptom names (minimal)
  const formatSymptomsMinimal = () => {
    return extractedSymptoms
      .map(s => s.symptom)
      .join(', ');
  };

  const getTriagePrediction = async () => {
    if (extractedSymptoms.length === 0) {
      setError("No symptoms to analyze");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Choose which formatting method to use - you can experiment with different ones
    const formattedSymptoms = formatSymptomsBalanced(); // Change this to test different formats

    console.log("Formatted symptoms for model:", formattedSymptoms);

    try {
      const res = await fetch("http://localhost:8001/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: formattedSymptoms }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      setPredictedTriage(data.label);
      setConfidence(data.confidence);
      setAllScores(data.all_scores);
      
      console.log("Prediction results:", data);
      
    } catch (error) {
      console.error("Triage prediction failed:", error);
      setError("Failed to get prediction");
      setPredictedTriage(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Test all formatting methods (for debugging)
  const testAllFormats = () => {
    console.log("=== Testing All Symptom Formats ===");
    console.log("Detailed:", formatSymptomsDetailed());
    console.log("Simple:", formatSymptomsSimple());
    console.log("Balanced:", formatSymptomsBalanced());
    console.log("Minimal:", formatSymptomsMinimal());
    console.log("Raw symptoms:", extractedSymptoms);
  };

  

  useEffect(() => {
    testAllFormats(); // Log all formats for comparison
    getTriagePrediction();
  }, [extractedSymptoms]);

  return (
    <div className="min-h-screen bg-gray-50 p-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Buttons */}
        <div className="flex justify-start space-x-3 mb-2">
          <Button
            className="text-blue-900 bg-gray-50 hover:bg-gray-100"
            onClick={() => window.location.assign('/')}
          >
            <Home style={{ width: "24px", height: "24px" }}/>
          </Button>

          {/* Simulate download */}
          <Button
            className="text-blue-900 bg-gray-50 hover:bg-gray-100"
            onClick={() => window.print()}
          >
            <Printer style={{ width: "24px", height: "24px" }} />
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patientData.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Enhanced triage display */}
              {isLoading && (
                <span className="text-sm text-blue-600 italic">
                  Analyzing symptoms...
                </span>
              )}
              
              {error && (
                <span className="text-sm text-red-600 italic">
                  {error}
                </span>
              )}
              
              {predictedTriage && !isLoading && (
                <div className="text-sm text-gray-700 italic">
                  <span>Predicted Triage: </span>
                  <span className="font-semibold text-blue-900">{predictedTriage}</span>
                  {confidence && (
                    <span className="text-xs text-gray-500 block">
                      Confidence: {(confidence * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              )}
              
              <Button className='bg-blue-900 hover:bg-blue-800'>
                <Stethoscope className="h-4 w-4 mr-2" />
                Schedule Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Age: {patientData.age}, {patientData.gender}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{patientData.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {patientData.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Symptoms & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Symptoms Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <AlertTriangle className="h-5 w-5 mr-2 text-blue-900" />
                  Reported Symptoms
                </CardTitle>
                <CardDescription className="text-gray-900">
                  Symptoms extracted from patient call transcript
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedSymptoms.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{item.symptom}</h4>
                        {item.severity && item.severity !== 'Unknown' && (
                          <Badge variant="outline" className="text-xs">
                            {item.severity}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-16 gap-y-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Duration:</span> {item.duration || 'Not specified'}
                        </div>
                        <div>
                          <span className="font-medium">Location:</span> {item.location || 'Not specified'}
                        </div>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-2 italic">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Show all prediction scores if available */}
                {allScores && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Model Confidence Scores:</h5>
                    <div className="space-y-1">
                      {Object.entries(allScores).map(([label, score]) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className={label === predictedTriage ? 'font-semibold text-blue-900' : 'text-gray-600'}>
                            {label}:
                          </span>
                          <span className={label === predictedTriage ? 'font-semibold text-blue-900' : 'text-gray-600'}>
                            {(score * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Call Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <FileText className="h-5 w-5 mr-2 text-blue-900" />
                  Call Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">{transcript}</pre>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Additional Information */}
          <div className="space-y-6">
            {/* Given Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-blue-900">
                  <Activity className="h-5 w-5 mr-2 text-blue-900" />
                  Actions Taken
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {actions.map((action, idx) => (
                    <Button key={idx} className="w-full justify-start bg-blue-900 hover:bg-blue-800" variant="outline">
                      {action}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
              <CardHeader>
                <CardTitle className='text-blue-900'>Clinical Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="p-3 bg-gray-50 rounded">
                    <strong className="text-blue-900">Assessment:</strong>
                    <p className="mt-1">{clinicalNotes.assessment}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong className="text-blue-900">Concerns:</strong>
                    <p className="mt-1">{clinicalNotes.concerns}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <strong className="text-blue-900">Plan:</strong>
                    <p className="mt-1">{clinicalNotes.plan}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
