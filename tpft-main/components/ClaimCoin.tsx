import React, { useState, useEffect } from 'react';
import './ClaimCoin.css';

// Types
type ClaimCoinProps = {
  userAddress: string;
};

type TabType = 'claim';

type SocialPlatform = 'telegram' | 'twitter';

// Social platform configuration
const socialPlatforms: Record<SocialPlatform, {
  name: string;
  color: string;
  url: string;
  icon: React.ReactNode;
}> = {
  telegram: {
    name: 'Telegram',
    color: '#0088cc',
    url: 'https://t.me/tpulsefi',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    )
  },
  twitter: {
    name: 'Twitter',
    color: '#1DA1F2',
    url: 'https://x.com/TradePulseToken?t=pVsX5va6z7eOJj70W9pSog&s=09',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
};

export function ClaimCoin({ userAddress }: ClaimCoinProps) {
  const [activeTab, setActiveTab] = useState<TabType>('claim');
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [socialFollowed, setSocialFollowed] = useState<Record<SocialPlatform, boolean>>({
    telegram: false,
    twitter: false,
  });
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const loadSocialStatus = () => {
      const platforms: SocialPlatform[] = ['telegram', 'twitter'];
      const status: Record<SocialPlatform, boolean> = {
        telegram: localStorage.getItem(`${'telegram'}_followed_${userAddress}`) === 'true',
        twitter: localStorage.getItem(`${'twitter'}_followed_${userAddress}`) === 'true',
      };

      setSocialFollowed(status);
    };

    loadSocialStatus();
  }, [userAddress]);

  useEffect(() => {
    const checkClaimStatus = () => {
      const lastClaimTime = localStorage.getItem(`lastClaim_${userAddress}`);

      if (lastClaimTime) {
        const lastClaim = new Date(lastClaimTime);
        const now = new Date();
        const nextClaimTime = new Date(lastClaim);
        nextClaimTime.setHours(nextClaimTime.getHours() + 24);

        if (now < nextClaimTime) {
          setHasClaimed(true);

          const timeLeft = nextClaimTime.getTime() - now.getTime();
          const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
          const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);

          setCountdown({ hours: hoursLeft, minutes: minutesLeft, seconds: secondsLeft });
          return true;
        } else {
          setHasClaimed(false);
          setCountdown(null);
          return false;
        }
      }
      return false;
    };

    const isClaimActive = checkClaimStatus();
    const intervalId = setInterval(() => {
      if (countdown) {
        if (countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0) {
          setHasClaimed(false);
          setCountdown(null);
          clearInterval(intervalId);
        } else {
          let newHours = countdown.hours;
          let newMinutes = countdown.minutes;
          let newSeconds = countdown.seconds - 1;

          if (newSeconds < 0) {
            newSeconds = 59;
            newMinutes -= 1;
          }

          if (newMinutes < 0) {
            newMinutes = 59;
            newHours -= 1;
          }

          setCountdown({ hours: newHours, minutes: newMinutes, seconds: newSeconds });
        }
      } else if (isClaimActive) {
        checkClaimStatus();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [userAddress, countdown]);

  const handleSocialFollow = (platform: SocialPlatform) => {
    window.open(socialPlatforms[platform].url, '_blank');
    setSocialFollowed(prev => ({
      ...prev,
      [platform]: true
    }));
    localStorage.setItem(`${platform}_followed_${userAddress}`, 'true');
  };

  const handleClaim = async () => {
    try {
      if (!allSocialFollowed) {
        setError('Please follow our Telegram, Twitter accounts to claim your rewards');
        return;
      }

      setIsClaiming(true);
      setError(null);

      await new Promise(resolve => setTimeout(resolve, 2000));

      localStorage.setItem(`lastClaim_${userAddress}`, new Date().toISOString());

      setBalance(prevBalance => prevBalance + 50);

      setClaimSuccess(true);

      setTimeout(() => {
        setHasClaimed(true);
        setClaimSuccess(false);
        setCountdown({ hours: 23, minutes: 59, seconds: 59 });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim coins');
    } finally {
      setIsClaiming(false);
    }
  };

  const allSocialFollowed = Object.values(socialFollowed).every(Boolean);

  const renderSocialButtons = (platform: SocialPlatform) => {
    const { name, color, icon } = socialPlatforms[platform];
    const isFollowed = socialFollowed[platform];

    return (
      <div className="social-button" key={platform}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="social-icon" style={{ backgroundColor: color }}>
            {icon}
          </div>
          <span>{name}</span>
        </div>
        <button
          onClick={() => handleSocialFollow(platform)}
          disabled={isFollowed}
          className={`follow-btn ${isFollowed ? 'followed-btn' : ''}`}
          aria-label={`Follow ${name}`}
        >
          {isFollowed ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Followed
            </>
          ) : 'Follow'}
        </button>
      </div>
    );
  };

  return (
    <div className="claim-coin-container">
      <h2>Claim your TPulseFi Tokens</h2>
      <div className="tabs">
        <button className={activeTab === 'claim' ? 'active' : ''} onClick={() => setActiveTab('claim')}>Claim</button>
      </div>

      {activeTab === 'claim' && (
        <div className="claim-content">
          {!hasClaimed ? (
            <div>
              {Object.keys(socialPlatforms).map((platform) =>
                renderSocialButtons(platform as SocialPlatform)
              )}
              <button onClick={handleClaim} disabled={isClaiming || !allSocialFollowed} className="claim-btn">
                {isClaiming ? 'Claiming...' : 'Claim Tokens'}
              </button>
            </div>
          ) : (
            <div className="claim-status">
              {countdown ? (
                <p>
                  You can claim again in {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </p>
              ) : (
                <p>Claim Successful!</p>
              )}
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>
      )}
    </div>
  );
}

export default ClaimCoin;
