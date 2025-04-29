'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import playerData from '../../../data/players.js';
import { logComponentRender, logImageLoad, logImageError, logImageSuccess } from '../../../utils/debug';

export default function PlayerProfile({ params }) {
  const playerName = params.name;
  const player = playerData[playerName];
  
  useEffect(() => {
    // Ensure the page is properly rendered on the client side
    logComponentRender('PlayerProfile', { playerName });
    if (player && player.imageUrl) {
      logImageLoad(player.imageUrl);
    }
  }, [playerName, player]);
  
  if (!player) {
    return (
      <div className="paper">
        <div className="player-profile">
          <h1>Player Not Found</h1>
          <p>This player has gone missing in the Twisting Nether...</p>
          <Link href="/" className="back-button">Return to Home Base</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="paper">
      <div className="player-profile">
        <Link href="/" className="back-button">← Back to Raid Team</Link>
        
        <div className="player-header">
          <div className="player-title">
            <h1>{player.displayName}</h1>
            <div className="player-role">{player.role}</div>
          </div>
          {player.imageUrl && (
            <div className="player-image">
              <img 
                src={player.imageUrl} 
                alt={player.displayName}
                onLoad={() => logImageSuccess(player.imageUrl)}
                onError={(e) => {
                  logImageError(player.imageUrl, e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
        
        <div className="player-content">
          {player.content && (
            <div dangerouslySetInnerHTML={{ __html: player.content }} />
          )}
        </div>
        
        <div className="player-meta">
          {player.characterClass && (
            <div className="player-class">Class: <span>{player.characterClass}</span></div>
          )}
          {player.joinDate && (
            <div className="player-join-date">Raiding since: <span>{player.joinDate}</span></div>
          )}
        </div>
      </div>
    </div>
  );
} 