'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function JournalPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, []);

  const [entries, setEntries] = useState<{ id: number; content: string; mood: string }[]>([]);
  const [newEntry, setNewEntry] = useState({ content: '', mood: '' });

  const fetchEntries = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await api.get('/journal', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); 
    setEntries(res.data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const submitEntry = async () => {
    if (!newEntry) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log(newEntry);
    try {
      await api.post('/journal', { entry: newEntry }, { 
        headers: { 
          Authorization: `Bearer ${token}`,
         }
      });
      setNewEntry({content: '', mood: ''});
      await fetchEntries(); // <--- this refreshes the list!
    } catch (err) {
      console.error('Failed to submit goal', err);
    }
  };



  return (
    <div className="mt-10">
      <h2 className="text-xl text-purple-200 mb-2">🌙 Write a New Entry</h2>
      <form onSubmit={submitEntry} className="space-y-4">
        <textarea
          placeholder="What's on your mind?"
          value={newEntry.content}
          onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
          className="w-full p-2 rounded-md bg-white/10 border border-purple-300 text-white"
        />
        <input
          type="text"
          placeholder="Your mood today"
          value={newEntry.mood}
          onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
          className="w-full p-2 rounded-md bg-white/10 border border-purple-300 text-white"
        />
        <button type="submit" className="btn-glow">Save Entry</button>
      </form>

      <h2 className="text-xl text-purple-200 mb-2 mt-10">🌙 Journal Entries</h2>
      {entries.map((entry, index) => (
        <div key={entry.id} className="mb-4">
          <p className="text-sm text-teal-300 mb-1">{entry.content}</p>
          <p className="text-xs text-teal-200">Mood: {entry.mood}</p>
        </div>
      ))}
    </div>
  );
}
