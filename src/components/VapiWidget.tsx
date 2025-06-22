import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { useRouter } from 'next/navigation';

// Define function
interface VapiWidgetProps {
  apiKey: string;
  assistantId: string;
  config?: Record<string, unknown>;
}

const VapiWidget: React.FC<VapiWidgetProps> = ({ 
  apiKey, 
  assistantId, 
  config = {} 
}) => {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<Array<{role: string, text: string}>>([]);
  const transcriptRef = useRef(transcript);
  const router = useRouter()
  // Timing
  let vapiCallStartTime: number | null = null;
  let elapsedTime: number | null = null;
  //let militaryTime: string | null = null;


  // Keep ref updated
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);


  useEffect(() => {
    const vapiInstance = new Vapi(apiKey);
    setVapi(vapiInstance);

    // Call starts
    vapiInstance.on('call-start', () => {
      console.log('Call started');
      const now = new Date();
      vapiCallStartTime = now.getTime();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      //const militaryTime = `${hours}:${minutes}`;
      setIsConnected(true);
      setTranscript([]); // Clear transcript on call end
    });

    // Call ends
    vapiInstance.on('call-end', async () => {
      console.log('Call ended');
      if (vapiCallStartTime !== null) {
        elapsedTime = (Date.now() - vapiCallStartTime) / 1000;
      }
      const fullText = transcriptRef.current.map(t => `${t.role === 'user' ? 'Patient' : 'Assistant'}: ${t.text}`).join('\n');
      console.log('Full Transcript:', fullText);

      setIsConnected(false);
      setIsSpeaking(false);

      // Claude API call
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          transcript: fullText,
          elapsedTime: elapsedTime,
        }),
      });

      // Push data to dashboard
      const data = await res.json()

      localStorage.setItem("dashboardData", JSON.stringify(data.result));
      router.push("/dashboard");
    });

    // Speech starts
    vapiInstance.on('speech-start', () => {
      console.log('Assistant started speaking');
      setIsSpeaking(true);
    });

    // Speech ends 
    vapiInstance.on('speech-end', () => {
      console.log('Assistant stopped speaking');
      setIsSpeaking(false);
    });

    vapiInstance.on('message', (message) => {
      if (message.type === 'transcript') {
        setTranscript(prev => [...prev, {
          role: message.role,
          text: message.transcript
        }]);
      }
    });

    vapiInstance.on('error', (error) => {
      console.error('Vapi error:', error);
    });

    return () => {
      vapiInstance?.stop();
    };
  }, [apiKey]);


  const startCall = () => {
    if (vapi) {
      vapi.start(assistantId);
    }
  };

  const endCall = () => {
    if (vapi) {
      vapi.stop();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '60%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 1000,
      fontFamily: 'Arial, sans-serif'
    }}>

      {!isConnected ? (
        <button
          onClick={startCall}
          style={{
            //margin: '50px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
          }}
        >
          {/* Microphone Icon */}
          <svg 
            width="50" 
            height="50" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
            <line x1="8" x2="16" y1="22" y2="22"/>
          </svg>
          
          {/* Pulse animation ring */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '-4px',
            right: '-4px',
            bottom: '-4px',
            borderRadius: '50%',
            border: '2px solid rgba(96, 165, 250, 0.6)',
            animation: 'pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite'
          }} />
        </button>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          width: '320px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          border: '1px solid #e1e5e9'
        }}>
          {/* Conversation UI */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: isSpeaking ? '#ff4444' : '#12A594',
                animation: isSpeaking ? 'pulse 1s infinite' : 'none'
              }}></div>
              <span style={{ fontWeight: 'bold', color: '#333' }}>
                {isSpeaking ? 'Assistant Speaking...' : 'Listening...'}
              </span>
            </div>
            <button
              onClick={endCall}
              style={{
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              End Call
            </button>
          </div>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '12px',
            padding: '8px',
            background: '#f8f9fa',
            borderRadius: '8px'
          }}>
            {transcript.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: '8px',
                  textAlign: msg.role === 'user' ? 'right' : 'left'
                }}
              >
                <span style={{
                  background: msg.role === 'user' ? '#12A594' : '#333',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  fontSize: '14px',
                  maxWidth: '80%'
                }}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          80%, 100% {
            transform: scale(1.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default VapiWidget;