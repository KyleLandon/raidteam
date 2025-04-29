'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '../../styles/Login.module.css';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const result = await signIn('credentials', {
                username,
                password,
                redirect: false
            });

            if (result.error) {
                setError('Invalid username or password');
            } else {
                router.push('/admin');
            }
        } catch (error) {
            setError('An error occurred during login');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginBox}>
                <h1>Admin Login</h1>
                {error && <div className={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button}>
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
} 