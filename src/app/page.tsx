'use client';

import VapiWidget from '../components/VapiWidget';
import SensaAI  from '../components/SensaAI';
import InteractiveBlueBackground from '@/components/InteractiveBlueBackground';

export default function Home() {
  return (
    <main>
      <InteractiveBlueBackground>
        <SensaAI></SensaAI>
        <VapiWidget 
          apiKey="916c8cdc-4a41-465c-8216-341cea5420a5" 
          assistantId="e8eb09ed-0197-456e-8f6e-39d87c702f23" 
        />
      </InteractiveBlueBackground>
    </main>
  );
}
