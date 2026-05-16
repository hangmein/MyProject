export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-3">
        {/* Avatar giả lập */}
        <div className="size-10 rounded-full bg-gray-300 border-2 border-primary bg-cover bg-center" 
             style={{backgroundImage: "url('https://i.pravatar.cc/150?img=11')"}}></div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Welcome back,</p>
          <h1 className="text-sm font-bold tracking-tight">Manga Explorer</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <span className="material-symbols-outlined text-2xl">search</span>
        </button>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
          <span className="material-symbols-outlined text-2xl">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </button>
      </div>
    </header>
  );
}