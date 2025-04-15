'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import GoalCard from '@/components/GoalCard';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export default function GoalsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
    }
  }, []);

  const [goals, setGoals] = useState<{ id: number; title: string; description: string, completed: boolean, target_date: string }[]>([]);
  const [newGoal, setNewGoal] = useState({title: '', description: '', targetDate: ''});

  const fetchGoals = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const res = await api.get('/goals', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }); 
    setGoals(res.data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const submitGoal = async () => {
    if (!newGoal) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    console.log(newGoal);
    try {
      await api.post('/goals', { goal: newGoal }, { 
        headers: { 
          Authorization: `Bearer ${token}`,
         }
      });
      setNewGoal({title: '', description: '', targetDate: ''});
      await fetchGoals(); // <--- this refreshes the list!
    } catch (err) {
      console.error('Failed to submit goal', err);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 space-y-4">
      <h2 className="text-xl font-bold">Set Your Goals</h2>
      
      <div className="flex gap-2">
        <input
          id="goal"
          type="text"
          className="flex-1 p-2 border rounded"
          value={newGoal.title}
          onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
          placeholder="Goal title"
        />
        <input
          id="description"
          type="text"
          className="flex-1 p-2 border rounded"
          value={newGoal.description}
          onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
          placeholder="Goal description"
        />
        <input
          id="targetDate"
          type="date"
          className="flex-1 p-2 border rounded"
          value={newGoal.targetDate}
          onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
          placeholder="Target date"
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:shadow-[0_0_8px_2px_rgba(255,221,153,0.9)] transition"
          onClick={submitGoal}
        >
          Add
        </button>
      </div>

      <div className="p-6 space-y-6 max-w-4xl mx-auto mt-8">
        <h1 className="text-3xl font-bold text-center text-white mb-6"> Your Goals</h1>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <AnimatePresence>
              {goals.map((goal, index) => (
                <GoalCard key={goal.id} goal={goal} index={index} />
              ))}
            </AnimatePresence>
        </motion.div>
      </div>
    </div>  
);
}

