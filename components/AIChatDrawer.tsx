
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { X, Send, Bot, User, Sparkles, Loader2, Volume2, BrainCircuit } from 'lucide-react';
import { ChatMessage } from './monitorTypes';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hola, soy el Asistente Inteligente de Tailoy. Ahora cuento con Modo Pensamiento (Thinking) para tareas complejas. ¿En qué puedo apoyarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSpeak = async (text: string) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
      }
    } catch (error) {
      console.error("TTS Error:", error);
    }
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);


    try {
      // Intentar obtener la API KEY de varias fuentes posibles
      const apiKey = import.meta.env.VITE_API_KEY || 
                     process.env.API_KEY || 
                     process.env.GEMINI_API_KEY ||
                     '';
      
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey === 'PLACEHOLDER_API_KEY') {
        throw new Error("API Key no configurada. Por favor configura VITE_API_KEY en el archivo .env");
      }

      const client = new GoogleGenAI({ apiKey });
      
      // Implementación directa con gemini-3-flash-preview
      const response = await client.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...messages, { role: 'user', text: userMessage }].map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.text }]
        })),
         config: {
            temperature: 0.7, // Creatividad balanceada
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            systemInstruction: `Eres un consultor logístico experto para Tailoy. 
            Tu tono es servicial y profesional. Ayudas con monitoreo de almacenes.`,
         }
      });

      const responseText = response.text;
      const aiText = typeof responseText === 'string' ? responseText : (typeof responseText === 'function' ? responseText() : "No se pudo procesar la consulta.");
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al conectar con Gemini";
      setMessages(prev => [...prev, { role: 'model', text: `Error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" onClick={onClose} />}
      
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_50px_rgba(0,0,0,0.1)] z-[70] transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#009639] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#009639]/20">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-800 tracking-tight">AI LOGISTICS</h3>
              <p className="text-[10px] text-[#009639] font-bold uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-[#009639] rounded-full animate-pulse"></span> Gemini Intelligence
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-[#FFD200] text-gray-800' : 'bg-white border border-gray-100 text-[#009639]'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Sparkles size={14} />}
                </div>
                <div className="flex flex-col gap-2">
                  <div className={`p-5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-none' 
                    : 'bg-[#009639] text-white rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  {msg.role === 'model' && (
                    <button 
                      onClick={() => handleSpeak(msg.text)}
                      className="self-start p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-[#009639] transition-colors"
                    >
                      <Volume2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-4 items-center text-gray-400 text-[11px] font-bold italic">
                <Loader2 className="animate-spin text-[#009639]" size={14} /> 
                {isThinking ? "PENSANDO PROFUNDAMENTE..." : "PROCESANDO..."}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-center justify-between mb-4 px-2">
            <button 
              onClick={() => setIsThinking(!isThinking)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-[10px] font-black uppercase tracking-widest ${
                isThinking ? 'bg-[#FFD200] text-gray-800 shadow-md' : 'bg-gray-100 text-gray-400'
              }`}
            >
              <BrainCircuit size={14} /> Modo Pensamiento
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta logística..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 text-xs focus:ring-2 focus:ring-[#009639]/20 focus:border-[#009639] outline-none text-gray-800 placeholder-gray-400 transition-all pr-14"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#FFD200] text-gray-800 rounded-xl flex items-center justify-center hover:bg-[#ffe042] disabled:opacity-30 transition-all shadow-sm"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
