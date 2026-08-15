import React, { useState, useRef, useEffect } from 'react';
import { 
  Move, 
  Square, 
  Type, 
  Image as ImageIcon, 
  QrCode, 
  Hash, 
  Table, 
  PenTool, 
  Stamp, 
  PieChart, 
  Layers, 
  Grid, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Save, 
  Download, 
  Printer, 
  FileText, 
  FileSpreadsheet, 
  Sliders, 
  Plus, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  FileCode,
  Layout,
  MousePointer,
  Minus
} from 'lucide-react';
import axios from 'axios';

export interface DesignerElement {
  id: string;
  type: 'text' | 'richtext' | 'table' | 'dynamictable' | 'image' | 'logo' | 'foto' | 'qr' | 'barcode' | 'line' | 'shape' | 'signature' | 'stamp' | 'chart';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  lineHeight?: number;
  letterSpacing?: number;
  borderRadius?: number;
  opacity?: number;
  locked?: boolean;
  hidden?: boolean;
  zIndex: number;
  tableData?: string[][];
  dynamicField?: string;
}

export default function VisualDocumentDesigner() {
  const [elements, setElements] = useState<DesignerElement[]>([
    {
      id: 'el-kop-header',
      type: 'text',
      name: 'Kop Surat Title',
      x: 30,
      y: 20,
      width: 500,
      height: 40,
      content: 'YAYASAN PENDIDIKAN ISLAM AL-AZHAR\nSMP ISLAM TERPADU AL-AZHAR DEPOK',
      fontSize: 14,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#0f172a',
      zIndex: 1
    },
    {
      id: 'el-kop-line',
      type: 'line',
      name: 'Garis Kop',
      x: 30,
      y: 70,
      width: 500,
      height: 4,
      content: '',
      bgColor: '#000000',
      zIndex: 2
    },
    {
      id: 'el-nomor-surat',
      type: 'text',
      name: 'Nomor Surat',
      x: 30,
      y: 85,
      width: 500,
      height: 25,
      content: 'Nomor: {{nomor_surat}}\nPerihal: {{perihal}}',
      fontSize: 11,
      fontFamily: 'Times New Roman',
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 3
    },
    {
      id: 'el-isi-surat',
      type: 'richtext',
      name: 'Isi Surat',
      x: 30,
      y: 125,
      width: 500,
      height: 180,
      content: 'Assalamu\'alaikum Wr. Wb.\n\nYang bertanda tangan di bawah ini Kepala {{nama_lembaga}} menerangkan bahwa:\n\nNama: {{nama_siswa}}\nNIS / NISN: {{nis}} / {{nisn}}\nKelas: {{kelas}}\nAlamat: {{alamat}}\n\nAdalah benar-benar terdaftar sebagai santri / siswa aktif pada {{nama_lembaga}} Tahun Ajaran {{tahun_ajaran}}.',
      fontSize: 11,
      fontFamily: 'Times New Roman',
      lineHeight: 1.4,
      zIndex: 4
    },
    {
      id: 'el-signature-block',
      type: 'signature',
      name: 'Blok Tanda Tangan',
      x: 320,
      y: 330,
      width: 200,
      height: 90,
      content: 'Kepala Sekolah,\n\n\n\n{{nama_kepala}}\nNIP. {{nip_kepala}}',
      fontSize: 11,
      fontFamily: 'Times New Roman',
      textAlign: 'center',
      zIndex: 5
    },
    {
      id: 'el-qr-verify',
      type: 'qr',
      name: 'QR Verifikasi',
      x: 30,
      y: 340,
      width: 70,
      height: 70,
      content: 'https://verifikasi.sekolah.sch.id/val/{{nomor_surat}}',
      zIndex: 6
    }
  ]);

  const [selectedId, setSelectedId] = useState<string | null>('el-kop-header');
  const [zoom, setZoom] = useState<number>(100);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [showGuidelines, setShowGuidelines] = useState<boolean>(true);
  
  // History for Undo / Redo
  const [history, setHistory] = useState<DesignerElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Document Page Setup
  const [paperSize, setPaperSize] = useState<'A4' | 'F4' | 'LEGAL' | 'LETTER' | 'A5' | 'CUSTOM'>('A4');
  const [paperWidth, setPaperWidth] = useState<number>(210); // mm
  const [paperHeight, setPaperHeight] = useState<number>(297); // mm
  const [marginTop, setMarginTop] = useState<number>(20);
  const [marginBottom, setMarginBottom] = useState<number>(20);
  const [marginLeft, setMarginLeft] = useState<number>(25);
  const [marginRight, setMarginRight] = useState<number>(20);

  // Dragging & Resizing States
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [elementStartPos, setElementStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Template Save / Load state
  const [templateName, setTemplateName] = useState<string>('Template Surat Keterangan Standard 2026');
  const [unitScope, setUnitScope] = useState<string>('SMP');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Save state snapshot for undo/redo
  const saveSnapshot = (newElements: DesignerElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, newElements]);
    setHistoryIndex(newHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const selectedElement = elements.find(e => e.id === selectedId);

  const updateSelectedElement = (key: keyof DesignerElement, value: any) => {
    if (!selectedId) return;
    const updated = elements.map(e => e.id === selectedId ? { ...e, [key]: value } : e);
    setElements(updated);
  };

  const handleAddElement = (type: DesignerElement['type']) => {
    const newId = `el-${Date.now()}`;
    const newEl: DesignerElement = {
      id: newId,
      type,
      name: `Elemen ${type.toUpperCase()}`,
      x: 50,
      y: 50,
      width: type === 'line' ? 400 : type === 'qr' || type === 'barcode' || type === 'logo' || type === 'foto' ? 80 : 250,
      height: type === 'line' ? 2 : type === 'qr' || type === 'barcode' || type === 'logo' || type === 'foto' ? 80 : 40,
      content: type === 'text' ? 'Teks Baru' : type === 'qr' ? '{{verification_url}}' : type === 'signature' ? 'Tanda Tangan\n\n\n\nNama Pimpinan' : 'Konten Elemen',
      fontSize: 11,
      fontFamily: 'Times New Roman',
      fontWeight: 'normal',
      textAlign: 'left',
      zIndex: elements.length + 1
    };
    const nextElements = [...elements, newEl];
    setElements(nextElements);
    setSelectedId(newId);
    saveSnapshot(nextElements);
  };

  const handleDuplicate = () => {
    if (!selectedElement) return;
    const dup: DesignerElement = {
      ...selectedElement,
      id: `el-${Date.now()}`,
      name: `${selectedElement.name} (Salinan)`,
      x: selectedElement.x + 15,
      y: selectedElement.y + 15,
      zIndex: elements.length + 1
    };
    const next = [...elements, dup];
    setElements(next);
    setSelectedId(dup.id);
    saveSnapshot(next);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const next = elements.filter(e => e.id !== selectedId);
    setElements(next);
    setSelectedId(next.length > 0 ? next[0].id : null);
    saveSnapshot(next);
  };

  const handleInsertDynamicField = (fieldCode: string) => {
    if (!selectedElement) return;
    const newContent = selectedElement.content + ` {{${fieldCode}}}`;
    updateSelectedElement('content', newContent);
  };

  // Dragging logic
  const onMouseDownElement = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedId(id);
    const target = elements.find(el => el.id === id);
    if (!target || target.locked) return;

    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setElementStartPos({ x: target.x, y: target.y });
  };

  const onMouseMoveCanvas = (e: React.MouseEvent) => {
    if (!isDragging || !selectedId) return;
    const dx = (e.clientX - dragStart.x) * (100 / zoom);
    const dy = (e.clientY - dragStart.y) * (100 / zoom);

    setElements(prev => prev.map(el => {
      if (el.id === selectedId) {
        return {
          ...el,
          x: Math.max(0, Math.round(elementStartPos.x + dx)),
          y: Math.max(0, Math.round(elementStartPos.y + dy))
        };
      }
      return el;
    }));
  };

  const onMouseUpCanvas = () => {
    if (isDragging) {
      setIsDragging(false);
      saveSnapshot(elements);
    }
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const token = localStorage.getItem('erp_token') || localStorage.getItem('token');
      const res = await axios.post('/api/action?action=templateCreate', {
        template_name: templateName,
        unit_code: unitScope,
        paper_size: paperSize,
        paper_width: paperWidth,
        paper_height: paperHeight,
        margin_top: marginTop,
        margin_bottom: marginBottom,
        margin_left: marginLeft,
        margin_right: marginRight,
        elements_json: JSON.stringify(elements)
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (res.data?.success) {
        setStatusMsg(`✓ Template [${templateName}] berhasil disimpan ke Database!`);
      }
    } catch (err: any) {
      setStatusMsg(`❌ Gagal menyimpan template: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col h-[820px]">
      
      {/* TOP HEADER BAR */}
      <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600/30 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Layout className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Studio Modul 2
              </span>
              <h2 className="text-sm font-black text-white">Visual Document & Template Designer</h2>
            </div>
            <p className="text-[11px] text-slate-400">
              Drag & Drop Canvas • Pixel-Perfect Grid • Layout Presisi Kedinasan & Multi-Unit
            </p>
          </div>
        </div>

        {/* Template Quick Input & Action Buttons */}
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1.5 rounded-xl font-bold w-64 focus:border-indigo-500 outline-none"
            placeholder="Nama Template..."
          />
          <button 
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? 'Memproses...' : 'Simpan Template'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className={`px-4 py-2 text-xs font-bold flex items-center justify-between ${statusMsg.includes('✓') ? 'bg-emerald-950 text-emerald-200 border-b border-emerald-800' : 'bg-rose-950 text-rose-200 border-b border-rose-800'}`}>
          <span>{statusMsg}</span>
        </div>
      )}

      {/* SECONDARY TOOLBAR */}
      <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto">
        {/* Component Adding Library */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Tambah:</span>
          <button onClick={() => handleAddElement('text')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <Type className="h-3.5 w-3.5 text-indigo-400" /> Teks
          </button>
          <button onClick={() => handleAddElement('line')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <Minus className="h-3.5 w-3.5 text-blue-400" /> Garis
          </button>
          <button onClick={() => handleAddElement('signature')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <PenTool className="h-3.5 w-3.5 text-emerald-400" /> TTD & Stempel
          </button>
          <button onClick={() => handleAddElement('qr')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <QrCode className="h-3.5 w-3.5 text-amber-400" /> QR Code
          </button>
          <button onClick={() => handleAddElement('table')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <Table className="h-3.5 w-3.5 text-purple-400" /> Tabel
          </button>
          <button onClick={() => handleAddElement('image')} className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg flex items-center gap-1 cursor-pointer">
            <ImageIcon className="h-3.5 w-3.5 text-rose-400" /> Gambar/Logo
          </button>
        </div>

        {/* View & Canvas Toggles */}
        <div className="flex items-center gap-2">
          <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition ${showGrid ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`} title="Toggle Grid">
            <Grid className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => setShowRuler(!showRuler)} className={`p-1.5 rounded-lg transition ${showRuler ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`} title="Toggle Ruler">
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          
          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[11px] font-bold text-slate-300 w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">
            <ZoomIn className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          <button onClick={handleUndo} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300" title="Undo">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleRedo} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300" title="Redo">
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* MAIN DESIGNER WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR: Dynamic Fields & Page Setup */}
        <div className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-4 overflow-y-auto text-xs shrink-0">
          <div>
            <h3 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-2 flex items-center justify-between">
              <span>Dynamic Field Injector</span>
              <Sparkles className="h-3 w-3 text-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-400 mb-2">Klik bidang di bawah untuk memasukkan variabel database secara otomatis:</p>
            <div className="space-y-1">
              {[
                { label: 'Nama Siswa/Santri', code: 'nama_siswa' },
                { label: 'NIS / NISN', code: 'nis' },
                { label: 'Kelas / Rombel', code: 'kelas' },
                { label: 'Nama Orang Tua', code: 'nama_orang_tua' },
                { label: 'Nama Lembaga/Unit', code: 'nama_lembaga' },
                { label: 'Nomor Surat Auto', code: 'nomor_surat' },
                { label: 'Nama Kepala Sekolah', code: 'nama_kepala' },
                { label: 'Tahun Ajaran', code: 'tahun_ajaran' },
                { label: 'Alamat Lengkap', code: 'alamat' }
              ].map(f => (
                <button
                  key={f.code}
                  onClick={() => handleInsertDynamicField(f.code)}
                  className="w-full text-left px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 rounded-lg text-slate-300 font-mono text-[10px] transition flex items-center justify-between cursor-pointer"
                >
                  <span>{f.label}</span>
                  <span className="text-indigo-400 font-bold">{`{{${f.code}}}`}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase text-[10px] tracking-wider mb-2">Ukuran Kertas & Margin</h3>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Preset Kertas</label>
                <select 
                  value={paperSize}
                  onChange={(e) => {
                    const sz = e.target.value as any;
                    setPaperSize(sz);
                    if (sz === 'A4') { setPaperWidth(210); setPaperHeight(297); }
                    if (sz === 'F4') { setPaperWidth(215); setPaperHeight(330); }
                    if (sz === 'LEGAL') { setPaperWidth(216); setPaperHeight(356); }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-xs text-white font-bold"
                >
                  <option value="A4">A4 (210 x 297 mm)</option>
                  <option value="F4">F4 / Folio (215 x 330 mm)</option>
                  <option value="LEGAL">Legal (216 x 356 mm)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Top (mm)</label>
                  <input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Bottom (mm)</label>
                  <input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Left (mm)</label>
                  <input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Right (mm)</label>
                  <input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER CANVAS DISPLAY */}
        <div 
          className="flex-1 bg-slate-950/80 p-8 overflow-auto flex items-center justify-center relative select-none"
          onMouseMove={onMouseMoveCanvas}
          onMouseUp={onMouseUpCanvas}
        >
          {/* THE PAPER SHEET CANVAS */}
          <div 
            ref={canvasRef}
            style={{
              width: `${paperWidth * 2.8 * (zoom / 100)}px`,
              height: `${paperHeight * 2.8 * (zoom / 100)}px`,
              paddingTop: `${marginTop * 2.8 * (zoom / 100)}px`,
              paddingBottom: `${marginBottom * 2.8 * (zoom / 100)}px`,
              paddingLeft: `${marginLeft * 2.8 * (zoom / 100)}px`,
              paddingRight: `${marginRight * 2.8 * (zoom / 100)}px`,
            }}
            className={`bg-white text-slate-900 shadow-2xl relative transition-all rounded-xs border border-slate-300 ${showGrid ? 'bg-grid-slate-100' : ''}`}
          >
            {elements.map(el => {
              if (el.hidden) return null;
              const isSelected = el.id === selectedId;

              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => onMouseDownElement(e, el.id)}
                  style={{
                    position: 'absolute',
                    left: `${el.x * (zoom / 100)}px`,
                    top: `${el.y * (zoom / 100)}px`,
                    width: `${el.width * (zoom / 100)}px`,
                    height: `${el.height * (zoom / 100)}px`,
                    fontSize: `${(el.fontSize || 11) * (zoom / 100)}pt`,
                    fontFamily: el.fontFamily || 'Times New Roman',
                    fontWeight: el.fontWeight || 'normal',
                    fontStyle: el.fontStyle || 'normal',
                    textDecoration: el.textDecoration || 'none',
                    textAlign: el.textAlign || 'left',
                    color: el.color || '#000000',
                    backgroundColor: el.bgColor || 'transparent',
                    border: el.borderColor ? `${el.borderWidth || 1}px solid ${el.borderColor}` : 'none',
                    lineHeight: el.lineHeight || 1.3,
                    zIndex: el.zIndex,
                    cursor: el.locked ? 'not-allowed' : 'move'
                  }}
                  className={`p-1 flex flex-col justify-start overflow-hidden group ${isSelected ? 'ring-2 ring-indigo-600 ring-offset-1 z-50' : 'hover:ring-1 hover:ring-indigo-300'}`}
                >
                  {el.type === 'line' ? (
                    <div className="w-full h-full" style={{ backgroundColor: el.bgColor || '#000000' }}></div>
                  ) : el.type === 'qr' ? (
                    <div className="w-full h-full bg-slate-50 border border-slate-300 flex flex-col items-center justify-center p-1 font-mono text-[8px] text-center">
                      <QrCode className="h-8 w-8 text-slate-800" />
                      <span className="truncate w-full mt-0.5">{el.content}</span>
                    </div>
                  ) : el.type === 'signature' ? (
                    <div className="w-full h-full text-center whitespace-pre-line text-xs font-serif leading-tight">
                      {el.content}
                    </div>
                  ) : (
                    <div className="whitespace-pre-line">
                      {el.content}
                    </div>
                  )}

                  {/* Selection Indicator & Resize Handlers */}
                  {isSelected && !el.locked && (
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white p-0.5 rounded-full shadow cursor-pointer">
                      <MousePointer className="h-2.5 w-2.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDEBAR: Selected Element Inspector & Layers */}
        <div className="w-72 bg-slate-950 border-l border-slate-800 p-4 space-y-4 overflow-y-auto text-xs shrink-0">
          {selectedElement ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-black text-white text-xs flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-indigo-400" /> Inspektori Elemen
                </h3>
                <div className="flex items-center gap-1">
                  <button onClick={handleDuplicate} className="p-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300" title="Duplikasi">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={handleDelete} className="p-1 bg-rose-900/50 hover:bg-rose-900 text-rose-300 rounded" title="Hapus">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Nama / Label Elemen</label>
                <input 
                  type="text" 
                  value={selectedElement.name}
                  onChange={(e) => updateSelectedElement('name', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">Isi Konten Teks / Formulasi</label>
                <textarea 
                  rows={3}
                  value={selectedElement.content}
                  onChange={(e) => updateSelectedElement('content', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-serif"
                />
              </div>

              {/* Posisi & Ukuran */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Posisi X (px)</label>
                  <input type="number" value={selectedElement.x} onChange={(e) => updateSelectedElement('x', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Posisi Y (px)</label>
                  <input type="number" value={selectedElement.y} onChange={(e) => updateSelectedElement('y', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Lebar (px)</label>
                  <input type="number" value={selectedElement.width} onChange={(e) => updateSelectedElement('width', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-bold block">Tinggi (px)</label>
                  <input type="number" value={selectedElement.height} onChange={(e) => updateSelectedElement('height', Number(e.target.value))} className="w-full bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white" />
                </div>
              </div>

              {/* Typography */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="text-[10px] text-slate-400 font-bold block">Pengaturan Font & Ukuran</label>
                <select 
                  value={selectedElement.fontFamily || 'Times New Roman'}
                  onChange={(e) => updateSelectedElement('fontFamily', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white font-bold"
                >
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Arial">Arial</option>
                  <option value="Calibri">Calibri</option>
                  <option value="Cambria">Cambria</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                </select>

                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={selectedElement.fontSize || 11}
                    onChange={(e) => updateSelectedElement('fontSize', Number(e.target.value))}
                    className="w-16 bg-slate-900 border border-slate-800 rounded p-1 text-center font-bold text-white"
                  />
                  <span className="text-[10px] text-slate-400">pt</span>

                  <div className="flex items-center gap-1 ml-auto">
                    <button 
                      onClick={() => updateSelectedElement('fontWeight', selectedElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                      className={`px-2 py-1 border rounded text-xs font-black ${selectedElement.fontWeight === 'bold' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      B
                    </button>
                    <button 
                      onClick={() => updateSelectedElement('fontStyle', selectedElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                      className={`px-2 py-1 border rounded text-xs italic font-black ${selectedElement.fontStyle === 'italic' ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      I
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Pilih salah satu elemen di kanvas untuk melihat & mengubah properti.
            </div>
          )}

          {/* LAYER LIST */}
          <div className="pt-4 border-t border-slate-800">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-2 flex items-center justify-between">
              <span>Daftar Layer Elemen ({elements.length})</span>
              <Layers className="h-3.5 w-3.5" />
            </h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {elements.map((el, idx) => (
                <div 
                  key={el.id}
                  onClick={() => setSelectedId(el.id)}
                  className={`p-2 rounded-lg border text-xs font-medium flex items-center justify-between cursor-pointer transition ${el.id === selectedId ? 'bg-indigo-950 border-indigo-600 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                >
                  <span className="truncate w-36 font-semibold">{idx + 1}. {el.name}</span>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); updateSelectedElement('hidden', !el.hidden); }} className="text-slate-400 hover:text-white">
                      {el.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
