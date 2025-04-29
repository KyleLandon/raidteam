'use client';

import { useEffect, useState } from 'react';
import styles from '../../styles/Leaderboard.module.css';

export default function Leaderboard() {
    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

        fetchCharacters();
    }, []);

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h1>Character Leaderboard</h1>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Character</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {characters.map((character, index) => (
                        <tr key={character.id}>
                            <td>{index + 1}</td>
                            <td>{character.name}</td>
                            <td>{character.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
} 