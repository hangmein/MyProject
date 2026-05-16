import React, { useState, useEffect } from 'react';
import adminApi from '../api/adminApi';

const CrawlerTool = () => {
  const [comics, setComics] = useState([]);
  const [selectedComicId, setSelectedComicId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // State Modal Sửa Link Lẻ
  const [showModal, setShowModal] = useState(false);
  const [editChap, setEditChap] = useState(null);
  const [newLink, setNewLink] = useState('');

  // State Modal Auto Link (MỚI)
  const [showAutoLinkModal, setShowAutoLinkModal] = useState(false);
  const [urlPattern, setUrlPattern] = useState('');

  // 1. Lấy danh sách truyện
  useEffect(() => {
    const fetchComics = async () => {
      try {
        const res = await adminApi.getAllComics();
        setComics(res.data || res);
      } catch (err) { console.error(err); }
    };
    fetchComics();
  }, []);

  // 2. Lấy danh sách chapter
  useEffect(() => {
    if (!selectedComicId) return;
    const fetchChapters = async () => {
      try {
        const res = await adminApi.getComicDetail(selectedComicId);
        const data = res.data || res;
        setChapters(data.chapters || []);
      } catch (err) { console.error(err); }
    };
    fetchChapters();
  }, [selectedComicId]);

  const toggleChapter = (chapId) => {
    setSelectedChapters(prev => 
      prev.includes(chapId) ? prev.filter(id => id !== chapId) : [...prev, chapId]
    );
  };

  const selectAll = () => {
    if (selectedChapters.length === chapters.length) setSelectedChapters([]);
    else setSelectedChapters(chapters.map(c => c.id));
  };

  const addLog = (msg, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [`[${time}] ${msg}`, ...prev]);
  };

  // --- HÀM 1: LƯU LINK LẺ ---
  const openEditModal = (e, chap) => {
    e.stopPropagation();
    setEditChap(chap);
    setNewLink(chap.sourceUrl || '');
    setShowModal(true);
  };

  const handleSaveLink = async () => {
    if (!editChap) return;
    try {
        await adminApi.updateChapter(editChap.id, { sourceUrl: newLink });
        setChapters(prev => prev.map(c => c.id === editChap.id ? { ...c, sourceUrl: newLink } : c));
        addLog(`✏️ Đã cập nhật Link cho Chap ${editChap.number}`, 'success');
        setShowModal(false);
    } catch (error) { alert(error.message); }
  };

  // --- HÀM 2: AUTO LINK HÀNG LOẠT (MỚI) ---
  const handleBulkAutoLink = async () => {
    if (!urlPattern.includes('{num}')) {
        return alert("Link mẫu phải chứa ký tự {num} để thay thế số chapter! Ví dụ: .../chapter/{num}");
    }
    
    setShowAutoLinkModal(false);
    setIsProcessing(true);
    addLog(`🪄 Đang tạo link tự động cho ${selectedChapters.length} chapters...`, 'warning');

    let count = 0;
    try {
        // Chạy vòng lặp để update từng cái (Dùng for of để chạy tuần tự hoặc Promise.all để chạy song song)
        const updates = selectedChapters.map(async (id) => {
            const chap = chapters.find(c => c.id === id);
            if (chap) {
                // Thay thế {num} bằng số chapter thực tế
                const generatedLink = urlPattern.replace('{num}', chap.number);
                
                // Gọi API update
                await adminApi.updateChapter(id, { sourceUrl: generatedLink });
                return { id, link: generatedLink };
            }
        });

        const results = await Promise.all(updates); // Chạy song song cho nhanh

        // Cập nhật lại UI sau khi xong hết
        setChapters(prev => prev.map(c => {
            const updated = results.find(u => u?.id === c.id);
            return updated ? { ...c, sourceUrl: updated.link } : c;
        }));

        addLog(`✅ Đã tạo xong ${results.length} link theo mẫu!`, 'success');
    } catch (error) {
        addLog(`❌ Lỗi tạo link: ${error.message}`, 'error');
    } finally {
        setIsProcessing(false);
        setSelectedChapters([]); // Bỏ chọn sau khi xong
    }
  };

  // --- HÀM 3: GỬI YÊU CẦU CRAWL ---
  const handleStartBulkCrawl = async () => {
    if (selectedChapters.length === 0) return alert("Vui lòng chọn ít nhất 1 chapter!");
    
    const missingLinkChaps = chapters.filter(c => selectedChapters.includes(c.id) && !c.sourceUrl);
    if (missingLinkChaps.length > 0) {
        if (!window.confirm(`⚠️ Có ${missingLinkChaps.length} chapter chưa có Link. Tiếp tục?`)) return;
    }

    setIsProcessing(true);
    addLog(`🚀 Gửi lệnh Crawl cho ${selectedChapters.length} chapters...`, 'warning');

    try {
      const res = await adminApi.crawlBulk(selectedChapters);
      addLog(`✅ Server: ${res.data?.message || res.message}`, 'success');
      addLog(`ℹ️ Hệ thống đang chạy ngầm...`, 'info');
      setSelectedChapters([]);
      setIsProcessing(false);
    } catch (error) {
      addLog(`❌ Lỗi: ${error.message}`, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-6 relative">
      <header className="mb-6"><h1 className="text-2xl font-bold flex items-center gap-2"><span className="material-symbols-outlined text-blue-500">bug_report</span> Crawler Control Center</h1></header>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* CỘT TRÁI */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-2">
            <select className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 outline-none" value={selectedComicId} onChange={(e) => { setSelectedComicId(e.target.value); setSelectedChapters([]); }}>
              <option value="">-- Chọn Truyện --</option>
              {comics.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <button onClick={selectAll} disabled={!selectedComicId} className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-bold whitespace-nowrap transition-colors duration-200">
              {selectedChapters.length > 0 && selectedChapters.length === chapters.length ? 'Bỏ chọn' : 'Chọn tất cả'}
            </button>
            {/* 👇 NÚT AUTO LINK MỚI */}
            <button 
                onClick={() => { setUrlPattern(''); setShowAutoLinkModal(true); }}
                disabled={selectedChapters.length === 0}
                className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-bold flex items-center gap-1 disabled:opacity-50"
            >
                <span className="material-symbols-outlined text-[18px]">auto_fix</span> Auto Link
            </button>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-2">
            {!selectedComicId ? <div className="h-full flex items-center justify-center text-slate-400 italic">Vui lòng chọn truyện</div> : (
              <div className="grid grid-cols-1 gap-2">
                {chapters.map(chap => (
                  <div key={chap.id} onClick={() => toggleChapter(chap.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all group ${selectedChapters.includes(chap.id) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-700'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <input type="checkbox" checked={selectedChapters.includes(chap.id)} onChange={()=>{}} className="w-4 h-4 rounded text-blue-600"/>
                      <span className="font-mono text-sm font-bold text-blue-500 min-w-[40px]">#{chap.number}</span>
                      {chap.sourceUrl ? <span className="material-symbols-outlined text-[16px] text-green-500">link</span> : <span className="material-symbols-outlined text-[16px] text-red-500 animate-pulse">link_off</span>}
                      <span className="text-sm truncate">{chap.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={(e) => openEditModal(e, chap)} className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${chap.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{chap.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-200 text-right text-sm text-slate-500">Đã chọn: <strong className="text-blue-500">{selectedChapters.length}</strong></div>
        </div>

        {/* CỘT PHẢI */}
        <div className="w-1/3 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold mb-4">Cấu hình chạy</h3>
            <button onClick={handleStartBulkCrawl} disabled={isProcessing || selectedChapters.length === 0} className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isProcessing || selectedChapters.length === 0 ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:scale-[1.02]'}`}>
              {isProcessing ? 'Đang gửi lệnh...' : 'BẮT ĐẦU CRAWL'}
            </button>
          </div>
          <div className="flex-1 bg-[#1e1e1e] rounded-xl border border-slate-700 shadow-inner flex flex-col overflow-hidden font-mono text-xs">
            <div className="bg-[#2d2d2d] px-4 py-2 text-slate-400 flex justify-between border-b border-black"><span>System Log</span><span onClick={() => setLogs([])} className="hover:text-white cursor-pointer">Clear</span></div>
            <div className="flex-1 p-4 overflow-y-auto text-green-400 space-y-1 custom-scrollbar">{logs.map((log, i) => <div key={i} className={log.includes('❌') ? 'text-red-400' : ''}>{log}</div>)}<div className="animate-pulse">_</div></div>
          </div>
        </div>
      </div>

      {/* MODAL 1: SỬA LINK LẺ */}
      {showModal && editChap && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6">
                <h3 className="text-lg font-bold mb-4 dark:text-white">Link Chapter {editChap.number}</h3>
                <input type="text" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="Dán link..." className="w-full px-4 py-3 bg-slate-700 border border-slate-700 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
                <div className="flex justify-end gap-3"><button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Hủy</button><button onClick={handleSaveLink} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">Lưu</button></div>
            </div>
        </div>
      )}

      {/* MODAL 2: AUTO LINK (MỚI) */}
      {showAutoLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-xl shadow-2xl p-6 animate-in zoom-in duration-200">
                <h3 className="text-lg font-bold mb-2 dark:text-white flex items-center gap-2"><span className="material-symbols-outlined text-purple-500">auto_fix</span> Tạo Link Tự Động</h3>
                <p className="text-sm text-slate-500 mb-4">Nhập link mẫu, dùng <code>{'{num}'}</code> để thay thế số chapter.</p>
                
                <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded border border-slate-200 mb-4 text-xs font-mono text-slate-600">
                    Ví dụ: https://web.com/manga/chap-<b>{'{num}'}</b>
                </div>

                <input 
                    type="text" 
                    value={urlPattern} 
                    onChange={(e) => setUrlPattern(e.target.value)} 
                    placeholder="" 
                    className="w-full px-4 py-3 dark:bg-slate-900 border border-slate-200 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-purple-500" 
                    autoFocus 
                />
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowAutoLinkModal(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">Hủy</button>
                    <button onClick={handleBulkAutoLink} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg">Tạo Link ({selectedChapters.length})</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CrawlerTool;