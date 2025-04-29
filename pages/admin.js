import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const response = await fetch('/api/characters');
        if (!response.ok) {
          throw new Error('Failed to fetch characters');
        }
        const data = await response.json();
        setCharacters(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching characters:', error);
        setError('Failed to load characters');
        setLoading(false);
      }
    };

    fetchCharacters();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCharacter || !points || !reason) return;

    try {
      const response = await fetch('/api/update-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: selectedCharacter,
          points: parseInt(points),
          reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      // Refresh the character list
      const updatedResponse = await fetch('/api/characters');
      const updatedData = await updatedResponse.json();
      setCharacters(updatedData);
      
      // Reset form
      setSelectedCharacter(null);
      setPoints('');
      setReason('');
    } catch (error) {
      console.error('Error updating points:', error);
      setError('Failed to update points');
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Raid Team Admin - Crayon Points</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Crayon Points Admin</h1>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="character">Character:</label>
                <select
                  id="character"
                  value={selectedCharacter || ''}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select a character</option>
                  {characters.map((character) => (
                    <option key={character.id} value={character.id}>
                      {character.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="points">Points:</label>
                <input
                  type="number"
                  id="points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className={styles.input}
                  placeholder="Enter points"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="reason">Reason:</label>
                <input
                  type="text"
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className={styles.input}
                  placeholder="Enter reason"
                />
              </div>

              <button type="submit" className={styles.button}>
                Add Points
              </button>
            </form>

            <div className={styles.leaderboard}>
              <h2>Current Points</h2>
              <div className={styles.header}>
                <span>Character</span>
                <span>Points</span>
              </div>
              {characters.map((character) => (
                <div key={character.id} className={styles.row}>
                  <span className={styles.name}>{character.name}</span>
                  <span className={styles.points}>{character.crayons}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
} 