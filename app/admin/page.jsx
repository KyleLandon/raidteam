'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Admin.module.css';

export default function Admin() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchCharacters() {
            try {
                const response = await fetch('/api/characters');
                if (!response.ok) {
                    throw new Error('Failed to fetch characters');
                }
                const data = await response.json();
                setCharacters(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        if (session?.user?.role === 'admin') {
            fetchCharacters();
        }
    }, [session]);

    const handleUpdatePoints = async (characterId, points) => {
        try {
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ characterId, points }),
            });

            if (!response.ok) {
                throw new Error('Failed to update points');
            }

            // Refresh the characters list
            const updatedResponse = await fetch('/api/characters');
            const updatedData = await updatedResponse.json();
            setCharacters(updatedData);
        } catch (err) {
            setError(err.message);
        }
    };

    if (status === 'loading') return <div className={styles.loading}>Loading...</div>;
    if (!session || session.user.role !== 'admin') return null;

    return (
        <div className={styles.container}>
            <h1>Admin Dashboard</h1>
            {error && <div className={styles.error}>{error}</div>}
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