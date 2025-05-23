'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Admin.module.css';
import { logApiCall, logApiResponse, logApiError, logComponentRender, logStateChange } from '../../utils/debug';

export default function AdminClient() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [syncing, setSyncing] = useState(false);

    logComponentRender('AdminClient', { status, session: session ? 'authenticated' : 'unauthenticated' });

    useEffect(() => {
        if (status === 'unauthenticated') {
            console.log('[Auth] Redirecting to login');
            router.push('/login');
        }
    }, [status, router]);

    const fetchCharacters = async () => {
        try {
            const baseUrl = process.env.NODE_ENV === 'production' ? 'https://raidteam.netlify.app' : '';
            const url = `${baseUrl}/api/characters`;
            
            logApiCall('GET', url);
            const response = await fetch(url);
            logApiResponse('GET', url, response);
            
            if (!response.ok) {
                throw new Error('Failed to fetch characters');
            }
            const data = await response.json();
            logStateChange('AdminClient', 'characters', data);
            setCharacters(data);
        } catch (err) {
            logApiError('GET', '/api/characters', err);
            setError(err.message);
        } finally {
            logStateChange('AdminClient', 'loading', false);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session?.user?.isAdmin) {
            fetchCharacters();
        }
    }, [session]);

    const handleSync = async () => {
        try {
            setSyncing(true);
            setError(null);
            
            const baseUrl = process.env.NODE_ENV === 'production' ? 'https://raidteam.netlify.app' : '';
            const url = `${baseUrl}/api/sync`;
            
            logApiCall('POST', url);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            logApiResponse('POST', url, response);

            if (!response.ok) {
                throw new Error('Failed to sync characters');
            }

            const data = await response.json();
            logStateChange('AdminClient', 'sync', data);

            // Refresh the characters list after sync
            await fetchCharacters();
        } catch (err) {
            logApiError('POST', '/api/sync', err);
            setError(err.message);
        } finally {
            setSyncing(false);
        }
    };

    const handleUpdatePoints = async (characterId, points) => {
        try {
            const baseUrl = process.env.NODE_ENV === 'production' ? 'https://raidteam.netlify.app' : '';
            const url = `${baseUrl}/api/characters`;
            
            logApiCall('POST', url, { characterId, points });
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characterId, points }),
            });
            
            logApiResponse('POST', url, response);

            if (!response.ok) {
                throw new Error('Failed to update points');
            }

            // Refresh the characters list
            await fetchCharacters();
        } catch (err) {
            logApiError('POST', '/api/characters', err);
            setError(err.message);
        }
    };

    if (status === 'loading') return <div className={styles.loading}>Loading...</div>;
    if (!session || !session.user.isAdmin) return null;

    return (
        <div className={styles.container}>
            <h1>Admin Dashboard</h1>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.actions}>
                <button 
                    onClick={handleSync} 
                    disabled={syncing}
                    className={styles.syncButton}
                >
                    {syncing ? 'Syncing...' : 'Sync from WowAudit'}
                </button>
            </div>

            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Character</th>
                        <th>Current Points</th>
                        <th>Update Points</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map((character) => (
                        <tr key={character.id}>
                            <td>{character.name}</td>
                            <td>{character.points}</td>
                            <td>
                                <input
                                    type="number"
                                    defaultValue={character.points}
                                    onChange={(e) => handleUpdatePoints(character.id, parseInt(e.target.value))}
                                />
                            </td>
                            <td>
                                <button onClick={() => handleUpdatePoints(character.id, character.points)}>
                                    Save
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 