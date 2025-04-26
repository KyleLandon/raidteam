import React from 'react';

export default function Page() {
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
          <span className="count">37</span>
        </div>
      </section>

      <footer>
        <p>Raid Team — Officially unofficial. Proudly low budget since forever.</p>
      </footer>
    </div>
  );
}
