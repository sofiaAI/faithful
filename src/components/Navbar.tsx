import Link from 'next/link';

export default function Navbar() {
  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem('token');
    
    // Redirect to the login page or homepage
    window.location.href = '/login';
  };
  
  return (
    <nav className="bg-black/30 backdrop-blur p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold text-yellow-400">✨ Spyra</h1>
      <div className="space-x-4 text-yellow-200">
        <Link href="/goals">Goals</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/astro">Astro</Link>
        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}