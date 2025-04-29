'use client';

import { useEffect, useState } from 'react';
import styles from '../../styles/Leaderboard.module.css';
import Image from 'next/image';

const rankIcons = ['🥇', '🥈', '🥉'];

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
            <div className={styles.banner}>
                <Image src="/images/raidteam.png" alt="Raid Team Logo" width={80} height={80} className={styles.logo} />
                <h1 className={styles.title}>Crayon Leaderboard</h1>
                <div className={styles.subtitle}>Who is the biggest crayon eater this tier?</div>
            </div>
            <div className={styles.leaderboard}>
                <div className={styles.header}>
                    <div>Rank</div>
                    <div>Character</div>
                    <div>Points</div>
                </div>
                {characters.map((character, index) => (
                    <div className={styles.row} key={character.id}>
                        <div className={styles.rank}>
                            {rankIcons[index] || index + 1}
                        </div>
                        <div className={styles.name}>{character.name}</div>
                        <div className={styles.points}>{character.points}</div>
                    </div>
                ))}
            </div>
        </div>
    );
} 