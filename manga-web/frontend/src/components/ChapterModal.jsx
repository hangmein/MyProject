import React, { useState } from 'react';

const ChapterModal = ({ isOpen, onClose, comicName, currentChapter, allChapters = [], onSelect }) => {
    const [search, setSearch] = useState('');
    console.log("Modal nhan duoc chapters:", allChapters);

    // Logic lọc chương: Nếu không tìm kiếm sẽ hiện tất cả
    const filtered = allChapters.filter(num => 
        num.toString().includes(search)
    );

    return (
        <>
            {/* Lớp nền đen mờ phía sau */}
            <div 
                className={`fixed inset-0 bg-black/80 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
                onClick={onClose} 
            />
            
            {/* Nội dung Modal trượt lên */}
            <div className={`fixed bottom-0 left-0 right-0 z-[70] bg-[#1a1f2e] rounded-t-[2rem] transition-transform duration-300 max-h-[85vh] flex flex-col ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                {/* Thanh gạch nhỏ để kéo */}
                <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mt-3 mb-4 flex-shrink-0" />
                
                <div className="px-6 pb-8 overflow-y-auto custom-scrollbar">
                    {/* Tiêu đề truyện */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-white text-xl font-bold">{comicName}</h2>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Chọn chương nhanh</p>
                        </div>
                        <button onClick={onClose} className="bg-white/5 p-2 rounded-full text-white">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* THANH TÌM KIẾM CHƯƠNG */}
                    <div className="relative mb-8">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                        <input 
                            type="number" 
                            placeholder="Nhập số chương..." 
                            className="w-full bg-[#111622] rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none border border-white/5 focus:border-blue-500/40 transition-all"
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* LƯỚI HIỂN THỊ TẤT CẢ CHƯƠNG */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                        {filtered.length > 0 ? (
                            filtered.map(num => (
                                <button 
                                    key={num}
                                    onClick={() => onSelect(num)}
                                    className={`py-4 rounded-xl font-bold text-sm transition-all border ${
                                        num === currentChapter 
                                        ? 'bg-blue-600 text-white border-blue-400 shadow-lg' 
                                        : 'bg-[#111622] text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                                    }`}
                                >
                                    {num}
                                </button>
                            ))
                        ) : (
                            <div className="col-span-4 py-10 text-center text-gray-600 italic">
                                Không có dữ liệu chương
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChapterModal;