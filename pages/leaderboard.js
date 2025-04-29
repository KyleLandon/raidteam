import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Leaderboard.module.css';

export default function Leaderboard() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }
        const data = await response.json();
        // Sort characters by crayon points in descending order
        const sortedCharacters = data.sort((a, b) => b.crayons - a.crayons);
        setCharacters(sortedCharacters);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Raid Team Crayon Leaderboard</title>
        <meta name="description" content="Track your Crayon points and see who's leading the pack!" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Crayon Leaderboard</h1>
        
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <div className={styles.leaderboard}>
            <div className={styles.header}>
              <span>Rank</span>
              <span>Character</span>
              <span>Crayons</span>
            </div>
            {characters.map((character, index) => (
              <div key={character.id} className={styles.row}>
                <span className={styles.rank}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </span>
                <span className={styles.name}>{character.name}</span>
                <span className={styles.points}>{character.crayons}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 