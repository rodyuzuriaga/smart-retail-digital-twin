
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
// Fixed: Added Sparkles to the import list from lucide-react
import { Image as ImageIcon, Video, Search, Upload, Loader2, Play, Download, Trash2, Maximize2, Sparkles } from 'lucide-react';

export const AIStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'analysis'>('image');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [analysisResult, setAnalysisResult] = useState('');

  const checkApiKey = async () => {
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultUrl(null);
    try {
      await checkApiKey();
      // Fixed: Initialize GoogleGenAI right before the API call to ensure latest API key usage
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: "1K"
          }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setResultUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert("Error generando imagen. Asegúrate de haber seleccionado una API Key válida.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setResultUrl(null);
    try {
      await checkApiKey();
      // Fixed: Initialize GoogleGenAI right before the API call
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio as any
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      // Fixed: Append API key to the download link as required by guidelines
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("Error generando video. Verifica la configuración.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    setAnalysisResult('');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Data, mimeType: file.type } },
              { text: "Analiza este medio del almacén. Identifica objetos, posibles riesgos de seguridad o niveles de stock." }
            ]
          }
        });
        setAnalysisResult(response.text || '');
      } catch (error) {
        setAnalysisResult("Error analizando el archivo.");
      } finally {
        setIsGenerating(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 branded-shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight flex items-center gap-3">
              <div className="p-2 bg-[#009639] rounded-xl text-white">
                <Sparkles size={24} />
              </div>
              Asistente de Almacén
            </h2>
            <p className="text-sm text-gray-400 mt-2 font-medium">Generación y análisis avanzado para el Smart Warehouse de Tailoy.</p>
          </div>
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
            <TabButton active={activeTab === 'image'} onClick={() => { setActiveTab('image'); setResultUrl(null); }} icon={<ImageIcon size={16} />} label="Imagen" />
            <TabButton active={activeTab === 'video'} onClick={() => { setActiveTab('video'); setResultUrl(null); }} icon={<Video size={16} />} label="Video" />
            <TabButton active={activeTab === 'analysis'} onClick={() => { setActiveTab('analysis'); setResultUrl(null); }} icon={<Search size={16} />} label="Análisis" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Concepto / Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'image' ? "Un almacén moderno de juguetes con robots AMRs ordenando estanterías..." : "Dron volando sobre un centro de distribución gigante..."}
                className="w-full h-40 bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:ring-4 focus:ring-[#009639]/10 focus:border-[#009639] outline-none resize-none transition-all placeholder-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Formato (Aspect Ratio)</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:border-[#009639] outline-none"
                >
                  {/* Fixed: Updated aspect ratio options to align with Gemini guidelines */}
                  <option value="1:1">1:1 Cuadrado</option>
                  <option value="16:9">16:9 Panorámico</option>
                  <option value="9:16">9:16 Vertical</option>
                  <option value="4:3">4:3 Estándar</option>
                  <option value="3:4">3:4 Retrato</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={activeTab === 'image' ? handleGenerateImage : handleGenerateVideo}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full h-[52px] bg-[#009639] text-white rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-[#007b2e] shadow-xl shadow-[#009639]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={20} /> : activeTab === 'image' ? <ImageIcon size={20} /> : <Video size={20} />}
                  {isGenerating ? "Procesando..." : "Generar"}
                </button>
              </div>
            </div>

            {activeTab === 'analysis' && (
              <div className="pt-6 border-t border-gray-50">
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center relative group hover:border-[#009639]/30 transition-all">
                  <input type="file" accept="image/*,video/*" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#009639] mb-4 shadow-sm group-hover:scale-110 transition-transform">
                      <Upload size={32} />
                    </div>
                    <p className="text-sm font-bold text-gray-800">Sube un medio para analizar</p>
                    <p className="text-xs text-gray-400 mt-1">Imágenes o Videos de monitoreo</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden flex items-center justify-center min-h-[400px]">
            {isGenerating ? (
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-[#FFD200] rounded-full flex items-center justify-center text-white mx-auto">
                  <Sparkles size={24} />
                </div>
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Sintetizando Redes Neuronales...</p>
              </div>
            ) : resultUrl ? (
              <div className="w-full h-full relative group">
                {activeTab === 'video' ? (
                  <video src={resultUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={resultUrl} alt="Result" className="w-full h-full object-contain" />
                )}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-white text-gray-800 rounded-xl shadow-lg hover:text-[#009639] transition-colors">
                    <Download size={18} />
                  </button>
                  <button onClick={() => setResultUrl(null)} className="p-3 bg-white text-gray-800 rounded-xl shadow-lg hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ) : analysisResult ? (
              <div className="p-8 w-full h-full overflow-y-auto bg-white/50">
                <h4 className="text-xs font-black text-[#009639] uppercase tracking-widest mb-4">Reporte de Inteligencia</h4>
                <div className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {analysisResult}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-300">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Play size={32} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">La previsualización aparecerá aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${active ? 'bg-white text-[#009639] shadow-md' : 'text-gray-400 hover:text-gray-600'
      }`}
  >
    {icon} {label}
  </button>
);
