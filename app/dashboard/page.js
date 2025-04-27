'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userPoints, setUserPoints] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  // Fetch user data and leaderboard
  useEffect(() => {
    if (session?.user?.id) {
      // Fetch user's points
      fetch(`/api/crayons?action=userPoints`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setUserPoints(data);
          }
        })
        .catch(err => console.error('Error fetching user points:', err));

      // Fetch leaderboard
      fetch(`/api/crayons?action=leaderboard&period=season`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLeaderboard(data.leaderboard);
          }
        })
        .catch(err => console.error('Error fetching leaderboard:', err))
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === 'loading') {
    return <div className="text-center p-10">Loading...</div>;
  }

  if (!session) {
    return <div className="text-center p-10">Please log in to view this page.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Crayon Points Dashboard</h1>
        <button
          onClick={() => signOut()}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name}
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-semibold">{session.user.name}</h2>
            <p className="text-gray-600">{session.user.email}</p>
            {session.user.isOfficer && (
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Officer
              </span>
            )}
          </div>
        </div>

        {userPoints ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800">Week Points</h3>
              <p className="text-2xl font-bold">{userPoints.points?.week || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800">Season Points</h3>
              <p className="text-2xl font-bold">{userPoints.points?.season || 0}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800">All-time Points</h3>
              <p className="text-2xl font-bold">{userPoints.points?.total || 0}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 italic">Loading your points...</p>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Season Leaderboard</h2>
        {loading ? (
          <p className="text-gray-500 italic">Loading leaderboard...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Player</th>
                  <th className="py-2 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => (
                  <tr key={entry.userId} className="border-t hover:bg-gray-50">
                    <td className="py-2 px-4">{index + 1}</td>
                    <td className="py-2 px-4">{entry.name || entry.userId}</td>
                    <td className="py-2 px-4 text-right font-medium">{entry.points}</td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan="3" className="py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {session.user.isOfficer && (
        <div className="mt-8 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Officer Controls</h2>
          <div className="flex gap-4">
            <Link
              href="/admin/add-points"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Add Points
            </Link>
            <Link
              href="/admin/manage-players"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Manage Players
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 