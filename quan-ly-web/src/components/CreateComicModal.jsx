import React, { useState, useEffect } from 'react';

const CreateComicModal = ({ isOpen, onClose, onSubmit }) => {
  // Khởi tạo state khớp với cấu trúc Database của bạn
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: '',
    description: '',
    category: '', // Tương ứng cột Category
    coverImage: '', // Tương ứng cột CoverImage
    bannerImage: '', // Tương ứng cột BannerImage
    isFeatured: false, // Tương ứng cột IsFeatured (0 hoặc 1)
  });

  // Hàm tạo Slug tự động từ Tên truyện (Tiếng Việt -> Slug)
  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD') // Tách dấu
      .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
      .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
      .replace(/[^\w-]+/g, '') // Xóa ký tự đặc biệt
      .replace(/--+/g, '-') // Xóa gạch ngang kép
      .replace(/^-+/, '') // Xóa gạch ngang đầu
      .replace(/-+$/, ''); // Xóa gạch ngang cuối
  };

  // Tự động điền Slug khi nhập Tên truyện
  useEffect(() => {
    if (formData.title) {
      setFormData(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">add_circle</span>
            Thêm Truyện Mới
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* BODY - Form nhập liệu */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
            <div className="space-y-4">
              {/* Tên truyện */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tên truyện <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Ví dụ: Chainsaw Man"
                />
              </div>

              {/* Slug (Auto) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Slug (URL) <span className="text-xs text-slate-400">(Tự động tạo)</span></label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-sm outline-none"
                />
              </div>

              {/* Tác giả & Thể loại */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tác giả</label>
                  <input 
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Tatsuki Fujimoto"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Thể loại</label>
                  <input 
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Action, Horror..."
                  />
                </div>
              </div>

              {/* Checkbox Nổi bật */}
              <div className="flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                 <input 
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                 />
                 <label htmlFor="isFeatured" className="cursor-pointer select-none">
                    <span className="font-bold text-slate-700 dark:text-white">Truyện Nổi Bật (Featured)</span>
                    <p className="text-xs text-slate-500">Đánh dấu để hiển thị lên đầu trang chủ</p>
                 </label>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mô tả nội dung</label>
                <textarea 
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none custom-scrollbar resize-none"
                  placeholder="Tóm tắt nội dung truyện..."
                ></textarea>
              </div>
            </div>

            {/* CỘT PHẢI: HÌNH ẢNH */}
            <div className="space-y-6">
              
              {/* Ảnh bìa (Cover Image) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Ảnh Bìa (Cover Image)</label>
                <input 
                  type="text" 
                  value={formData.coverImage}
                  onChange={(e) => setFormData({...formData, coverImage: e.target.value})}
                  className="w-full px-4 py-2 mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  placeholder="https://..."
                />
                {/* Preview Ảnh Bìa */}
                <div className="w-32 aspect-[2/3] bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden relative group">
                  {formData.coverImage ? (
                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  ) : (
                    <span className="text-xs text-slate-400 text-center px-2">Preview bìa</span>
                  )}
                </div>
              </div>

              {/* Ảnh Banner (Banner Image) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Ảnh Banner (Hero Image)</label>
                <input 
                  type="text" 
                  value={formData.bannerImage}
                  onChange={(e) => setFormData({...formData, bannerImage: e.target.value})}
                  className="w-full px-4 py-2 mb-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  placeholder="https://..."
                />
                {/* Preview Banner */}
                <div className="w-full aspect-[3/1] bg-slate-100 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
                   {formData.bannerImage ? (
                    <img src={formData.bannerImage} alt="Banner" className="w-full h-full object-cover" onError={(e) => e.target.style.display='none'} />
                  ) : (
                    <span className="text-xs text-slate-400">Preview Banner</span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={() => onSubmit(formData)}
            className="px-6 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
          >
            Lưu Truyện
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateComicModal;