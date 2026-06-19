import React, { useState, useEffect } from "react";
import { Copy, Check, Server, ShieldCheck, HelpCircle, X, Terminal } from "lucide-react";
import { SupabaseConfig } from "../types";
import { testSupabaseConnection, SUPABASE_SQL_SETUP } from "../lib/storage";

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSave: (config: SupabaseConfig) => void;
}

export default function SupabaseConfigModal({
  isOpen,
  onClose,
  config,
  onSave,
}: SupabaseConfigModalProps) {
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  useEffect(() => {
    setUrl(config.url);
    anonKey || setAnonKey(config.anonKey);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({
        success: false,
        message: "Por favor, ingresa tanto la URL como la clave Pública Anon.",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const isOk = await testSupabaseConnection(url, anonKey);
    setIsTesting(false);
    
    if (isOk) {
      setTestResult({
        success: true,
        message: "¡Conexión establecida exitosamente con Supabase! Las tablas se detectaron correctamente.",
      });
    } else {
      setTestResult({
        success: false,
        message: "No se pudo conectar. Verifica la URL y clave, o asegúrate de haber creado las tablas con el código SQL a continuación.",
      });
    }
  };

  const handleSave = () => {
    onSave({
      url,
      anonKey,
      isConnected: testResult?.success || config.isConnected,
    });
    onClose();
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print">
      <div 
        id="supabase-settings-modal"
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-amber-500/30 bg-slate-900 shadow-2xl"
      >
        {/* Header decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-amber-500 to-blue-900"></div>

        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="font-display text-xl font-bold text-white tracking-tight">
                Configuración de Base de Datos Supabase
              </h3>
              <p className="text-xs text-slate-400">
                Sincroniza tus matrículas y asistencias en la nube en tiempo real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/20 text-slate-300 text-sm space-y-2">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Almacenamiento Local Activo:</strong> El sistema guarda automáticamente todo en tu navegador de forma segura (LocalStorage). Si configuras Supabase, los datos se sincronizarán en la nube de forma transparente.
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Supabase Project URL
              </label>
              <input
                id="supabase-url-input"
                type="text"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Supabase Anon Public API Key (anon-key)
              </label>
              <input
                id="supabase-key-input"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 font-mono"
              />
            </div>
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-lg text-sm border ${
                testResult.success
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-950/20 border-rose-500/30 text-rose-400"
              }`}
            >
              {testResult.message}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              id="test-connection-btn"
              type="button"
              disabled={isTesting}
              onClick={handleTest}
              className="flex-1 py-2 px-4 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-850 hover:border-slate-500 text-sm font-medium transition-all"
            >
              {isTesting ? "Probando..." : "Probar Conexión"}
            </button>
            <button
              id="apply-connection-btn"
              type="button"
              onClick={handleSave}
              className="flex-1 py-2 px-4 rounded-lg bg-blue-700 hover:bg-blue-600 text-white text-sm font-medium transition-all shadow-md shadow-blue-900/40"
            >
              Guardar y Conectar
            </button>
          </div>

          <div className="pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={() => setShowSql(!showSql)}
              className="flex items-center justify-between w-full py-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-500" />
                <span>¿Cómo preparar la Base de Datos? (Código SQL)</span>
              </span>
              <span className="text-xs text-amber-500 underline">
                {showSql ? "Ocultar" : "Mostrar código"}
              </span>
            </button>

            {showSql && (
              <div className="mt-3 space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Para que la sincronización funcione, inicia sesión en tu panel de Supabase, ve a la sección de <strong className="text-white">SQL Editor</strong>, crea una nueva consulta ("New Query"), pega el siguiente script y haz clic en <strong className="text-white">Run</strong>:
                </p>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48 border border-slate-800">
                    {SUPABASE_SQL_SETUP}
                  </pre>
                  <button
                    onClick={copySqlToClipboard}
                    className="absolute top-2 right-2 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Copiar código SQL"
                  >
                    {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-850 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
