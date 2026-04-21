// src/services/copilotApi.ts

const BASE_URL = 'https://rmtalkingcopilot.vercel.app';

export interface ApiClientResponse {
  clients: ApiClient[];
}

export interface ApiClient {
  id: string;
  name: string;
  profile: {
    aum?: number;
    returns?: number;
    goal?: string;
    risk?: string;
    [key: string]: any;
  };
  recommendations: string[];
}

/**
 * Handle streaming responses from the API
 */
async function handleStreamingResponse(
  url: string,
  body: object,
  onUpdate: (chunk: string) => void,
  onComplete: () => void,
  onSources?: (sources: string[]) => void
) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);

    // Capture sources from headers if present
    const sourcesHeader = response.headers.get('x-sources');
    if (sourcesHeader && onSources) {
      try {
        const decoded = JSON.parse(decodeURIComponent(sourcesHeader));
        onSources(decoded);
      } catch (e) {
        console.warn('Failed to parse sources header', e);
      }
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No reader available');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      onUpdate(chunk);
    }
    
    onComplete();
  } catch (error) {
    console.error('Streaming error:', error);
    onUpdate('\n\n[Error: Failed to connect to AI engine. Using local fallback insights.]');
    onComplete();
  }
}

export const copilotApi = {
  /**
   * Fetches the prioritized list of clients
   */
  async fetchClients(): Promise<ApiClient[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/clients`);
      if (!res.ok) throw new Error('Failed to fetch clients');
      const data = await res.json();
      return data.clients || [];
    } catch (error) {
      console.error('fetchClients error:', error);
      return [];
    }
  },

  /**
   * Streams a strategic brief for a specific client
   */
  async streamBrief(
    clientId: string, 
    onUpdate: (text: string) => void, 
    onComplete: () => void,
    onSources?: (sources: string[]) => void
  ) {
    return handleStreamingResponse('/api/brief', { clientId }, onUpdate, onComplete, onSources);
  },

  /**
   * Streams live assistance based on a question
   */
  async streamAssist(
    clientId: string, 
    question: string, 
    onUpdate: (text: string) => void, 
    onComplete: () => void,
    onSources?: (sources: string[]) => void
  ) {
    return handleStreamingResponse('/api/assist', { clientId, question }, onUpdate, onComplete, onSources);
  }
};
