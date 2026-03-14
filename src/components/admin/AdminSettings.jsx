"use client";
import React, { useState, useEffect, useRef } from 'react';
import { assetApi } from '../../api/assets';
import { settingsApi } from '../../api/settings';
import { apiKeysApi, checkLiveUsage } from '../../api/apiKeys';
import toast from 'react-hot-toast';
import { useBranding } from '../../context/BrandingContext';
import { Save, Cpu, ImageIcon, Zap, ExternalLink, Globe, ShieldCheck, Terminal, HardDrive, RefreshCcw, Loader2 } from 'lucide-react';

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('identity');
  const [loading, setLoading] = useState(false);
  const { refreshBranding } = useBranding();
  const [previews, setPreviews] = useState({ logo: null, banner: null });
  const [apiKeys, setApiKeys] = useState([]);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [selectedKeyId, setSelectedKeyId] = useState('');
  const [keyForm, setKeyForm] = useState({
    provider: 'gnews',
    totalQuota: 0,
    usedQuota: 0,
    key: '',
    active: true
  });
  const [liveUsage, setLiveUsage] = useState(null);
  const [checkingUsage, setCheckingUsage] = useState(false);
  const [syncInputs, setSyncInputs] = useState({ textKey: '', imageKey: '' });
  const [settings, setSettings] = useState({
    siteTitle: '',
    contactEmail: '',
    contactPhone: '',
    logo: '',
    fallbackBannerUrl: '',
    activeTextProvider: '',
    activeImageProvider: '',
    aiProviders: []
  });

  const logoRef = useRef();
  const bannerRef = useRef();

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await apiKeysApi.getAll();
      setApiKeys(keys);
    } catch (err) {
      toast.error(err?.message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const [brandingRes, configRes] = await Promise.all([
          assetApi.getAssets(),
          settingsApi.getSettings()
        ]);

        setSettings({
          ...configRes,
          ...brandingRes,
          siteTitle: brandingRes.siteTitle || '',
          contactEmail: brandingRes.contactEmail || '',
          contactPhone: brandingRes.contactPhone || '',
          logo: brandingRes.logo || '',
          fallbackBannerUrl: brandingRes.fallbackBannerUrl || ''
        });
      } catch (err) {
        toast.error("Error synchronizing local data");
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'api-keys') {
      loadApiKeys();
    }
  }, [activeTab]);

  const openAddKey = () => {
    setEditingKey(null);
    setKeyForm({ provider: 'gnews', totalQuota: 0, usedQuota: 0, key: '', active: true });
    setShowKeyForm(true);
  };

  const openEditKey = (k) => {
    setEditingKey(k);
    setKeyForm({
      provider: k.provider || 'gnews',
      totalQuota: k.totalQuota || 0,
      usedQuota: k.usedQuota || 0,
      key: '',
      active: !!k.active
    });
    setShowKeyForm(true);
  };

  const saveApiKey = async () => {
    if (!keyForm.provider?.trim()) return toast.error("Provider is required");
    if (!editingKey && !keyForm.key?.trim()) return toast.error("Key is required");

    try {
      setLoading(true);
      if (editingKey?._id) {
        await apiKeysApi.update(editingKey._id, keyForm);
        toast.success("API key updated");
      } else {
        await apiKeysApi.create(keyForm);
        toast.success("API key created");
      }

      setShowKeyForm(false);
      setEditingKey(null);
      setKeyForm({ provider: 'gnews', totalQuota: 0, usedQuota: 0, key: '', active: true });
      await loadApiKeys();
    } catch (err) {
      toast.error(err?.message || "Failed to save API key");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (k) => {
    try {
      setLoading(true);
      await apiKeysApi.setActive(k._id, !k.active);
      setLiveUsage(null); // Reset live usage display
      await loadApiKeys();
    } catch (err) {
      toast.error(err?.message || "Failed to update key status");
    } finally {
      setLoading(false);
    }
  };

  const executeLiveUsageCheck = async (keyData) => {
    setCheckingUsage(true);
    setLiveUsage(null);
    try {
      const result = await checkLiveUsage(keyData);
      setLiveUsage(result);
      if (result.error) {
         toast.error(result.error);
      } else {
         toast.success("Usage stats retrieved!");
      }
    } catch (err) {
      toast.error("Failed to check basic usage");
    } finally {
      setCheckingUsage(false);
    }
  };

  const deleteKey = async (id) => {
    if (!window.confirm("Delete this API key?")) return;
    try {
      setLoading(true);
      await apiKeysApi.remove(id);
      toast.success("API key deleted");
      await loadApiKeys();
    } catch (err) {
      toast.error(err?.message || "Failed to delete API key");
    } finally {
      setLoading(false);
    }
  };

  const handleNeuralSync = async () => {
    if (!syncInputs.textKey) return toast.error("Text API Key is required for sync");
    setLoading(true);
    try {
      await settingsApi.syncSmartKeys(syncInputs);
      const freshConfig = await settingsApi.getSettings();
      setSettings(freshConfig);
      toast.success("Intelligence Pool Updated Successfully!");
      setActiveTab('ai-status');
    } catch (err) {
      toast.error(err.response?.data?.message || "AI Analysis Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (activeTab === 'api-keys') return;
    setLoading(true);
    try {
      const files = {
        logo: logoRef.current?.files[0],
        fallbackBanner: bannerRef.current?.files[0]
      };
      let currentSettings = { ...settings };
      if (files.logo || files.fallbackBanner) {
        const assetRes = await assetApi.updateAssets(settings, files);
        currentSettings = { ...currentSettings, ...assetRes.assets };
      }
      const finalData = await settingsApi.updateSettings(currentSettings);
      setSettings(finalData);
      setPreviews({ logo: null, banner: null });
      await refreshBranding();
      toast.success("System Configuration Secured!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) setPreviews(prev => ({ ...prev, [type]: URL.createObjectURL(file) }));
  };

  const handleEngineChange = async (e) => {
    const newEngine = e.target.value;
    setSettings(prev => ({ ...prev, activeTextProvider: newEngine }));
    
    try {
      setLoading(true);
      await settingsApi.updateSettings({ ...settings, activeTextProvider: newEngine });
      toast.success("AI Generation Engine Switch Triggered!");
      await refreshBranding();
    } catch (err) {
      toast.error("Failed to update engine.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">

      {/* 1. STUDIO SEGMENTED NAVIGATION */}
      <div className="inline-flex p-1.5 bg-surface border border-border rounded-4xl mb-12 overflow-x-auto scrollbar-hide">
        {[
          { id: 'identity', label: 'Identity', icon: <Globe size={14} /> },
          { id: 'sync', label: 'Neural Sync', icon: <Zap size={14} /> },
          { id: 'ai-status', label: 'AI Status', icon: <Terminal size={14} /> },
          { id: 'api-keys', label: 'API Keys', icon: <HardDrive size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-3xl ${activeTab === tab.id
                ? 'bg-paper text-accent shadow-sm ring-1 ring-border'
                : 'text-muted hover:text-ink'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="bg-paper border border-border rounded-[3rem] shadow-xl shadow-black/5 p-8 lg:p-16 relative overflow-hidden">

        {/* Decorative Background Accent */}
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-ink pointer-events-none">
          <ShieldCheck size={200} strokeWidth={1} />
        </div>

        {/* TAB 1: IDENTITY (Brand Assets) */}
        {activeTab === 'identity' && (
          <div className="space-y-16 animate-in fade-in zoom-in-95 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { label: 'Site Title', key: 'siteTitle', placeholder: 'The Protocol' },
                { label: 'Control Email', key: 'contactEmail', placeholder: 'admin@vault.io' },
                { label: 'Contact Phone', key: 'contactPhone', placeholder: '+1 (555) 000-000' }

              ].map(field => (
                <div key={field.key} className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1 italic">{field.label}</label>
                  <input
                    value={settings[field.key]}
                    placeholder={field.placeholder}
                    onChange={e => setSettings({ ...settings, [field.key]: e.target.value })}
                    className="w-full bg-surface border border-border rounded-2xl p-5 text-sm font-bold text-ink outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
                  />
                </div>
              ))}

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {[
                { label: 'Brand Logo', ref: logoRef, key: 'logo', preview: previews.logo, fallback: settings.logo, type: 'logo' },
                { label: 'Article Hero Fallback', ref: bannerRef, key: 'fallbackBannerUrl', preview: previews.banner, fallback: settings.fallbackBannerUrl, type: 'banner' }
              ].map(asset => (
                <div key={asset.key} className="space-y-5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">{asset.label}</label>
                  <div className="aspect-video bg-surface border border-border rounded-[2.5rem] flex items-center justify-center overflow-hidden relative group shadow-inner">
                    <img
                      src={asset.preview || asset.fallback}
                      className={`transition-all duration-700 group-hover:scale-110 ${asset.type === 'logo' ? 'max-h-[30%] object-contain' : 'w-full h-full object-cover grayscale-0 group-hover:brightness-75'}`}
                      alt="Preview"
                      onError={(e) => { e.target.src = "https://placehold.co/600x400/0f172a/white?text=VOID_ASSET"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm bg-ink/20">
                      <label htmlFor={asset.key} className="bg-paper text-ink px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-accent hover:text-white transition-all shadow-xl active:scale-95">
                        Replace Asset
                      </label>
                    </div>
                  </div>
                  <input type="file" ref={asset.ref} hidden id={asset.key} onChange={(e) => handleFileChange(e, asset.type)} accept="image/*" />
                  <div className="relative group">
                    <input
                      type="text"
                      placeholder="Source URL Override..."
                      value={settings[asset.key] || ""}
                      onChange={e => handleUrlChange(asset.type, e.target.value)}
                      className="w-full bg-surface/50 border border-border rounded-xl p-4 pl-5 text-[10px] font-mono text-muted outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* <div className="space-y-4">
  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
    GNews API Keys (DB Storage)
  </label>

  <textarea
    rows={5}
    value={gnewsKeysText}
    onChange={(e) => setGnewsKeysText(e.target.value)}
    placeholder={`Enter multiple keys — one per line or comma separated

example:
key_one_here
key_two_here
key_three_here`}
    className="w-full bg-surface border border-border rounded-2xl p-5 text-sm font-mono text-ink outline-none focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all"
  />

  <p className="text-[10px] text-muted uppercase tracking-wide">
    Stored in database only — runtime still uses ENV keys
  </p>
</div> */}
          </div>
        )}

        {/* TAB 2: NEURAL SYNC (Adaptive Dev-Ops Panel) */}
        {activeTab === 'sync' && (
          <div className="max-w-2xl mx-auto py-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Changed: Removed hardcoded bg-ink for var-based surface with higher depth */}
            <div className="bg-surface border border-border rounded-[3rem] p-12 shadow-2xl relative overflow-hidden ring-1 ring-accent/5">

              {/* Decorative Zap - Now uses accent color with very low opacity */}
              <div className="absolute top-0 right-0 p-8 text-accent/5 rotate-12 pointer-events-none">
                <Zap size={140} strokeWidth={1} />
              </div>

              <div className="flex items-center gap-6 mb-12 relative z-10">
                {/* Glow effect on the icon container */}
                <div className="p-4 bg-accent rounded-2xl text-white shadow-[0_0_20px_rgba(var(--color-accent-rgb),0.3)]">
                  <RefreshCcw size={28} className={loading ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic text-ink">
                    Intelligence Sync
                  </h3>
                  <p className="text-muted text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                    Global Endpoint Overrides
                  </p>
                </div>
              </div>

              <div className="space-y-8 relative z-10">
                {[
                  { label: 'Text Generation Key', placeholder: '••••••••••••••••', key: 'textKey' },
                  { label: 'Image Generation Key', placeholder: '••••••••••••••••', key: 'imageKey' }
                ].map(input => (
                  <div key={input.key} className="space-y-3">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-accent/80 ml-1">
                      {input.label}
                    </label>
                    <input
                      type="password"
                      placeholder={input.placeholder}
                      // Changed: Integrated with theme variables for consistent dark mode look
                      className="w-full bg-paper border border-border rounded-2xl p-5 text-sm font-mono text-ink focus:ring-4 focus:ring-accent/10 focus:border-accent outline-none transition-all placeholder:text-muted/30"
                      onChange={(e) => setSyncInputs({ ...syncInputs, [input.key]: e.target.value })}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleNeuralSync}
                  disabled={loading || !syncInputs.textKey}
                  // Changed: Button now adapts. In dark mode, it glows; in light mode, it's solid.
                  className="w-full py-6 bg-accent hover:brightness-110 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-accent/20 active:scale-[0.98]"
                >
                  {loading ? "Initializing Smart Mapping..." : "Re-Sync Neural Pool"}
                </button>
              </div>

              {/* Security Footer Note */}
              <div className="mt-8 flex justify-center items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-accent" />
                <span className="text-[8px] font-bold text-muted uppercase tracking-[0.2em]">Keys are encrypted at rest</span>
                <div className="h-1 w-1 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AI STATUS (Providers) */}
        {activeTab === 'ai-status' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center bg-surface border border-border rounded-3xl p-8 gap-8">
              <div className="flex gap-16">
                {[
                  { label: 'Primary Text', value: settings.activeTextProvider, icon: <Cpu className="text-accent" /> },
                  { label: 'Primary Image', value: settings.activeImageProvider, icon: <ImageIcon className="text-muted" /> }
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">{stat.label}</p>
                    <div className="flex items-center gap-4 text-2xl font-black text-ink uppercase italic tracking-tighter">
                      <span className="p-2 bg-paper rounded-lg border border-border">{stat.icon}</span>
                      {stat.value || "VOID"}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 px-6 py-3 bg-green-500/10 rounded-2xl border border-green-500/20">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_var(--color-green-500)]" />
                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Core Nominal</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {settings?.aiProviders?.map((provider, idx) => (
                <div key={idx} className="group p-8 bg-surface border border-border rounded-4xl hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="flex items-center gap-8">
                    <div className={`p-5 rounded-2xl border ${provider.category === 'text' ? 'bg-accent text-white border-accent' : 'bg-paper text-ink border-border shadow-sm'}`}>
                      {provider.category === 'text' ? <Cpu size={28} /> : <ImageIcon size={28} />}
                    </div>
                    <div>
                      <h4 className="font-black text-ink uppercase text-xl italic tracking-tighter leading-none">{provider.name}</h4>
                      <p className="text-[10px] font-mono text-muted mt-2 uppercase tracking-tight">{provider.baseUrl}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-10">
                    {[
                      { label: 'Model_ID', value: provider.textModel || provider.imageModel, color: 'text-ink font-mono font-bold' },
                      { label: 'Protocol', value: provider.payloadStructure, color: 'text-muted font-bold' },
                      { label: 'Health', value: 'Optimized', color: 'text-accent font-black' }
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-[8px] font-black text-muted/50 uppercase tracking-[0.2em] mb-1.5">{item.label}</p>
                        <p className={`text-[11px] uppercase ${item.color}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )) || <div className="p-24 text-center border-2 border-dashed border-border rounded-[3rem] text-muted uppercase font-black text-[10px] tracking-[0.4em] italic bg-surface/50">Null_Sequence: No assets found</div>}
            </div>
          </div>
        )}

        {/* TAB 4: API KEY USAGE MANAGEMENT */}
        {activeTab === 'api-keys' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase">API Key Usage Management</h3>
                <p className="text-[10px] text-muted uppercase tracking-widest mt-1">Automatic Rotation & Limits</p>
              </div>
              <button
                type="button"
                onClick={openAddKey}
                className="px-6 py-3 bg-accent text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-accent/20"
              >
                + Add New Key
              </button>
            </div>

            {/* Engine Selector & Key Selector displayed side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Engine Toggle */}
              <div className="bg-surface p-6 rounded-3xl border border-border">
                <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">
                  Active AI Rewrite Engine:
                </label>
                <select
                  value={settings.activeTextProvider || 'openrouter'}
                  onChange={handleEngineChange}
                  className="w-full bg-paper border border-border p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent font-bold"
                >
                  <option value="openrouter">OpenRouter (Default)</option>
                  <option value="google_gemini">Google Gemini (Direct)</option>
                  <option value="disabled">Disabled (Do not rewrite)</option>
                </select>
              </div>

              {/* Selector mapped dynamically based on selected key */}
              <div className="bg-surface p-6 rounded-3xl border border-border">
                <label className="block text-[10px] font-black text-muted uppercase tracking-widest mb-3">
                  Select API Key to Inspect:
                </label>
              <select
                value={selectedKeyId || (apiKeys[0]?._id || '')}
                onChange={(e) => {
                  setSelectedKeyId(e.target.value);
                  setLiveUsage(null); // Clear live usage when switching keys
                }}
                className="w-full bg-paper border border-border p-4 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent font-mono"
              >
                {apiKeys.length === 0 && <option value="">No Keys Found</option>}
                {apiKeys.map(k => (
                  <option key={k._id} value={k._id}>
                    [{k.provider.toUpperCase()}] {k.key ? k.key.substring(0, 12) + '...' : 'Hidden Key'} {k.active ? ' (Active)' : ' (Disabled)'}
                  </option>
                ))}
                </select>
              </div>
            </div>

            {/* Specific Key Display Status */}
            {(() => {
              const activeKey = apiKeys.find(k => k._id === (selectedKeyId || apiKeys[0]?._id));
              if (!activeKey) return null;

              const total = activeKey.totalQuota || 0;
              const used = activeKey.usedQuota || 0;
              const remaining = total > 0 ? Math.max(0, total - used) : 'Unlimited';
              const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
              let statusColor = "text-green-500";
              if (activeKey.status === "Quota Exceeded") statusColor = "text-red-500";
              else if (!activeKey.active) statusColor = "text-muted";
              else if (percent > 85) statusColor = "text-orange-500";

              return (
                <div className="bg-surface border border-border rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-lg font-black uppercase italic tracking-tighter">[{activeKey.provider.toUpperCase()}] Key Metrics</h4>
                      <p className={`text-xs font-bold uppercase tracking-widest ${statusColor} mt-1`}>Status: {activeKey.status}</p>
                    </div>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => toggleActive(activeKey)} className="text-[10px] uppercase tracking-wider font-bold px-4 py-2 border border-border rounded-lg hover:bg-paper">
                        Toggle Status
                      </button>
                      <button type="button" onClick={() => openEditKey(activeKey)} className="text-[10px] uppercase tracking-wider font-bold px-4 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white">
                        Edit Quota
                      </button>
                      <button type="button" onClick={() => deleteKey(activeKey._id)} className="text-[10px] uppercase tracking-wider font-bold px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white">
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="p-5 bg-paper rounded-2xl border border-border">
                      <p className="text-[9px] text-muted uppercase tracking-widest mb-1">Total Quota</p>
                      <p className="text-xl font-mono font-black">{total || '∞'}</p>
                    </div>
                    <div className="p-5 bg-paper rounded-2xl border border-border">
                      <p className="text-[9px] text-muted uppercase tracking-widest mb-1">Used Quota</p>
                      <p className="text-xl font-mono font-black">{used}</p>
                    </div>
                    <div className="p-5 bg-paper rounded-2xl border border-border">
                      <p className="text-[9px] text-muted uppercase tracking-widest mb-1">Remaining Quota</p>
                      <p className="text-xl font-mono font-black text-accent">{remaining}</p>
                    </div>
                    <div className="p-5 bg-paper rounded-2xl border border-border">
                      <p className="text-[9px] text-muted uppercase tracking-widest mb-1">Usage %</p>
                      <p className={`text-xl font-mono font-black ${percent > 85 ? 'text-red-500' : ''}`}>{percent}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {total > 0 && (
                    <div className="w-full bg-paper h-4 rounded-full overflow-hidden border border-border">
                      <div className={`h-full transition-all duration-1000 ${percent > 85 ? 'bg-red-500' : 'bg-accent'}`} style={{ width: `${percent}%` }} />
                    </div>
                  )}

                  <div className="flex justify-between items-center text-[10px] text-muted font-mono uppercase tracking-widest mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2">
                       <Terminal size={12} /> Last Used:{' '}
                       <span className="text-ink">{activeKey.lastUsedAt ? new Date(activeKey.lastUsedAt).toLocaleString() : 'Never'}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => executeLiveUsageCheck(activeKey)}
                      disabled={checkingUsage}
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-accent hover:text-accent disabled:opacity-50 transition-all font-bold"
                    >
                      {checkingUsage ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
                      Check Live Usage
                    </button>
                  </div>
                  
                  {/* Live Usage Result Modal / Dropdown */}
                  {liveUsage && (
                    <div className="mt-4 p-5 bg-black/5 border border-border rounded-2xl">
                      <h5 className="text-[10px] uppercase font-black tracking-widest text-ink mb-3 flex items-center gap-2">
                         <Globe size={12} /> Live Remote Data
                      </h5>
                      {liveUsage.error ? (
                         <p className="text-xs text-red-500 font-mono">{liveUsage.error}</p>
                      ) : (
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(liveUsage).map(([key, val]) => {
                               if (key === 'provider') return null;
                               return (
                                 <div key={key}>
                                   <p className="text-[8px] text-muted uppercase tracking-widest mb-1">{key.replace('_', ' ')}</p>
                                   <p className="text-sm font-mono font-bold text-ink">{val}</p>
                                 </div>
                               )
                            })}
                         </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            
            <div className="mt-8 bg-surface/50 p-6 rounded-2xl border border-dashed border-border text-xs text-muted">
               <span className="font-bold text-ink">Rotation Logic Active:</span> The system automatically round-robins requests across all active keys for a specific provider. Once a key hits 100% of its defined Total Quota, it is automatically bypassed and marked as 'Quota Exceeded'. Set Total Quota to 0 for unlimited keys.
            </div>

          </div>
        )}
        {showKeyForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-paper p-8 rounded-2xl w-[420px] space-y-4 border border-border">

              <h3 className="font-black text-lg uppercase">
                {editingKey ? "Edit API Key" : "Add API Key"}
              </h3>

              {["provider", "totalQuota", "usedQuota", "key"].map(f => (
                <div key={f} className="space-y-1">
                  <label className="text-[10px] uppercase font-black tracking-widest text-muted">{f}</label>
                  {f === 'provider' ? (
                    <select
                      value={keyForm[f]}
                      onChange={e => setKeyForm({ ...keyForm, [f]: e.target.value })}
                      className="w-full border border-border p-3 rounded-lg bg-surface"
                    >
                      <option value="gnews">GNews</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="google_gemini">Google Gemini</option>
                      <option value="cloudinary">Cloudinary</option>
                      <option value="openai">OpenAI</option>
                      <option value="custom">Custom...</option>
                    </select>
                  ) : (
                    <input
                      placeholder={f === 'totalQuota' ? '100 (0 for unlimited)' : f}
                      value={keyForm[f]}
                      onChange={e => setKeyForm({ ...keyForm, [f]: e.target.value })}
                      className="w-full border border-border p-3 rounded-lg bg-surface"
                      type={f === 'key' ? 'password' : (f.includes('Quota') ? 'number' : 'text')}
                      disabled={f === 'usedQuota' && !editingKey}
                    />
                  )}
                </div>
              ))}

              <label className="flex gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={keyForm.active}
                  onChange={e => setKeyForm({ ...keyForm, active: e.target.checked })}
                />
                Active
              </label>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowKeyForm(false)}>
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveApiKey}
                  className="bg-accent text-white px-6 py-2 rounded-lg font-bold"
                >
                  Save
                </button>
              </div>

            </div>
          </div>
        )}

        {/* GLOBAL SAVE ACTION - DARK MODE OPTIMIZED */}
        {activeTab !== 'api-keys' && (
          <div className="mt-16 pt-10 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`
              group relative overflow-hidden px-16 py-6 rounded-2xl font-black text-[11px] 
              uppercase tracking-[0.4em] transition-all duration-300 flex items-center gap-4
              active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed
              
              /* LIGHT MODE: Solid Ink */
              bg-ink text-white 
              
              /* DARK MODE: Neon Accent Border & Inner Glow */
              dark:bg-accent/10 dark:text-accent dark:border-2 dark:border-accent/50 
              dark:hover:bg-accent dark:hover:text-white dark:hover:shadow-[0_0_30px_rgba(var(--accent-rgb),0.3)]
            `}
            >
              {/* Subtle Loading Spinner Overlay */}
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} className="group-hover:scale-110 transition-transform" />
              )}

              <span className="relative z-10">
                {loading ? "SECURE_SYNCING..." : "COMMIT_CHANGES"}
              </span>

              {/* Reflection Beam - Only visible in Dark Mode hover */}
              <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SystemSettings;