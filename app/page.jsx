'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [wipeCount, setWipeCount] = useState(37); // Default value
  
  useEffect(() => {
    // Fetch wipe count from our API
    fetch('/api/wipe-counter')
      .then(res => res.json())
      .then(data => {
        if (data && data.count) {
          setWipeCount(data.count);
        }
      })
      .catch(err => {
        console.error('Error fetching wipe count:', err);
        // If error, the default count will remain
      });
  }, []);

  return (
    <div className="paper">
      <header>
        <div className="top-bar">
          <a href="https://discord.gg/raidteam" className="join-button header-button">
            JOIN US NOW
          </a>
        </div>
        <div className="logo-container">
          <img src="/images/raidteam.png" alt="Raid Team Logo" className="logo" />
          <div className="sparkles"></div>
        </div>
        <h2 className="tagline">you show up. we kill bosses.</h2>
      </header>

      <section className="about">
        <h2>ABOUT US</h2>
        <p>Raid Team is a no-drama, early AOTC guild that dives into Mythic. We&apos;re serious about playing well, not about acting serious.</p>
        <ul>
          <li><span className="marker-bullet">●</span> Early AOTC every tier</li>
          <li><span className="marker-bullet">●</span> Mythic progression for those who want it</li>
          <li><span className="marker-bullet">●</span> Mythic+ keys always popping</li>
          <li><span className="marker-bullet">●</span> Adult vibes, no crybabies</li>
        </ul>
      </section>

      <section className="raid-info">
        <h2>RAID INFO</h2>
        <div className="raid-times">
          <div className="raid-text">
            <h3>Raid Days:</h3>
            <ul>
              <li><span className="marker-bullet"></span> Tuesday @ 6PM CST</li>
              <li><span className="marker-bullet"></span> Wednesday @ 6PM CST</li>
            </ul>
          </div>
          <div className="raid-art">
            <div className="sword"></div>
            <div className="shield"></div>
          </div>
        </div>
        <div className="raid-banner">
          <span>RAID TIME</span>
        </div>
      </section>

      <section className="join-us">
        <h2>JOIN US</h2>
        <a href="https://discord.gg/raidteam" className="join-button">
          JOIN US NOW
        </a>
        <div className="requirements">
          <h3>Requirements:</h3>
          <ul>
            <li><span className="marker-bullet"></span> Know your class</li>
            <li><span className="marker-bullet"></span> Show up prepared</li>
            <li><span className="marker-bullet"></span> Laugh when we wipe</li>
          </ul>
        </div>
        <div className="wipe-counter">
          <span>Wipe Counter: </span>
          <span className="count">{wipeCount}</span>
        </div>
      </section>

      <section className="roster">
        <h2>CURRENT ROSTER</h2>
        <div className="roster-categories">
          <div className="roster-category">
            <h3>Masta:</h3>
            <ul>
              <li><span className="marker-bullet"></span> <Link href="/player/kylandon" className="player-link">KyleLandon</Link></li>
            </ul>
          </div>
          <div className="roster-category">
            <h3>Workers:</h3>
            <ul>
              <li><span className="marker-bullet"></span> <Link href="/player/covert" className="player-link">Covert</Link></li>
              <li><span className="marker-bullet"></span> <Link href="/player/greg" className="player-link">Greg</Link></li>
            </ul>
          </div>
          <div className="roster-category">
            <h3>Blastas:</h3>
            <ul>
              <li><span className="marker-bullet"></span> <Link href="/player/redeemer" className="player-link">Redeemer</Link></li>
            </ul>
          </div>
          <div className="roster-category">
            <h3>New Guys:</h3>
            <ul>
              <li><span className="marker-bullet"></span> <Link href="/player/fallen" className="player-link">Fallen</Link></li>
              <li><span className="marker-bullet"></span> <Link href="/player/jelloh" className="player-link">Jelloh</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <footer>
        <div className="social-buttons">
          <a href="https://discord.gg/raidteam" className="social-button discord">
            <span className="icon">👾</span>
          </a>
          <a href="https://x.com/Raid_Team_" className="social-button twitter">
            <span className="icon">🐦</span>
          </a>
          <a href="https://twitch.tv/yourteam" className="social-button twitch">
            <span className="icon">📺</span>
          </a>
        </div>
        <p>Raid Team — Officially unofficial. Proudly low budget since forever.</p>
      </footer>
    </div>
  );
}
