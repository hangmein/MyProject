export default function BottomNav() {
  const NavItem = ({ icon, label, active }) => (
    <a href="#" className={`flex flex-col items-center gap-1 ${active ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}>
      <span className="material-symbols-outlined font-bold">{icon}</span>
      <span className="text-[10px] font-medium">{label}</span>
    </a>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-6 pb-8 pt-2">
      <div className="flex justify-between items-center max-w-md mx-auto">
        <NavItem icon="home" label="Home" active />
        <NavItem icon="explore" label="Explore" />
        <NavItem icon="auto_stories" label="Library" />
        <NavItem icon="bookmarks" label="Saved" />
        <NavItem icon="person" label="Profile" />
      </div>
    </nav>
  );
}