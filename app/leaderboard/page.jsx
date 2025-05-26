'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logApiCall } from '@/utils/debug';

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session) {
            router.push('/');
            return;
        }

        const fetchLeaderboard = async () => {
            try {
                logApiCall('GET', '/api/leaderboard', 'Fetching leaderboard data');
                const response = await fetch('/api/leaderboard');
                if (!response.ok) {
                    throw new Error('Failed to fetch leaderboard');
                }
                const data = await response.json();
                setLeaderboard(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching leaderboard:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [session, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-700 rounded mb-4"></div>
                        <div className="h-8 bg-gray-700 rounded mb-4"></div>
                        <div className="h-8 bg-gray-700 rounded mb-4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 text-white p-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
                    <div className="bg-red-500 text-white p-4 rounded">
                        <p>Error: {error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-700">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Realm</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Season Crayons</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Weekly Crayons</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {leaderboard.map((character, index) => (
                                <tr key={character.id} className="hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{character.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <Link href={`/player/${character.name}`} className="text-blue-400 hover:text-blue-300">
                                            {character.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{character.realm}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        {character.class} {character.spec ? `(${character.spec})` : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{character.currentPoints}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{character.weeklyPoints}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 