"use client";
import React, { useState, useEffect } from 'react';
import './ClaimCoin.css';

// Types
type ClaimCoinProps = {
  userAddress: string;
};

type TabType = 'claim' ;

type SocialPlatform = 'telegram' | 'twitter' ;

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
  // State
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
  const [balance, setBalance] = useState(0); // User's TPF balance

  // Load social platform follow status
  useEffect(() => {
    const loadSocialStatus = () => {
      const platforms: SocialPlatform[] = ['telegram', 'twitter'];
      const status: Record<SocialPlatform, boolean> = {
        telegram: false,
        twitter: false,
      };

      platforms.forEach(platform => {
        status[platform] = localStorage.getItem(`${platform}_followed_${userAddress}`) === 'true';
      });

      setSocialFollowed(status);
    };

    loadSocialStatus();
  }, [userAddress]);

  // Check claim status and set up countdown
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
    }, 50);

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
        setError('Please follow our Telegram, Twitter ,Youtube accounts to claim your rewards');
        return;
      }

      setIsClaiming(true);
      setError(null);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update local storage with claim time
      localStorage.setItem(`lastClaim_${userAddress}`, new Date().toISOString());

      // Update balance
      setBalance(prevBalance => prevBalance + 50);

      // Show success screen
      setClaimSuccess(true);

      // Reset after showing success
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

  // Computed properties
  const allSocialFollowed = Object.values(socialFollowed).every(Boolean);

  // Component rendering functions
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

  const renderSocialBadge = (platform: SocialPlatform) => {
    const { name, color, icon } = socialPlatforms[platform];
    const isComplete = socialFollowed[platform];

    return (
      <div
        key={platform}
        className={`social-badge ${isComplete ? 'completed' : ''}`}
        onClick={() => !isComplete && handleSocialFollow(platform)}
        style={{ cursor: isComplete ? 'default' : 'pointer' }}
      >
        <div className="badge-icon" style={{ backgroundColor: color }}>
          {icon}
        </div>
        <div className="badge-label">{name}</div>

        {isComplete && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
    );
  };

  if (claimSuccess) {
    return (  
      <div className="success-container">
        <div className="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#4CAF50" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3>Claim Successful!</h3>
        <p style={{ color: 'white', marginBottom: '15px' }}>50 TPF has been added to your wallet.</p>
        <div className="reward-amount" style={{
          background: 'white',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: '2rem'
        }}>
          {(balance).toLocaleString()} TPF
        </div>
      </div>
    );
  }

  // Main component
  return (
    <div className="claim-coin-container">
     
      <h1 className=' text-blue-800'>Daily TPulseFi Claim</h1>
      <p>Claim your daily rewards and earn TPulseFi tokens</p>

      <div className="tab-container">
        <button
          onClick={() => setActiveTab('claim')}
          className={`tab-button ${activeTab === 'claim' ? 'active' : ''}`}
          aria-label="View Claim Tab"
        >
          Claim Tokens
        </button>
        {/* <button
          onClick={() => setActiveTab('tasks')}
          className={`tab-button ${activeTab === 'tasks' ? 'active' : ''}`}
          aria-label="View Tasks Tab"
        >
          Tasks
        </button> */}
      </div>

      {activeTab === 'claim' && (
        <div className="claim-section">
          {/* Reward Card */}
          <div className="reward-card">
            <h2>Daily Reward</h2>
            <div className="reward-amount">
              <span>50 TPulseFi</span>
            </div>

            <div className="claim-status">
              <span className={hasClaimed ? 'claimed' : 'available'}>
                {hasClaimed ? 'Claimed' : 'Available'}
              </span>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={isClaiming || hasClaimed || !allSocialFollowed}
              className="claim-button"
              aria-label="Claim rewards"
            >
              {isClaiming ? (
                <>
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </>
              ) : hasClaimed ? (
                'Already Claimed'
              ) : !allSocialFollowed ? (
                'Follow All Channels to Claim'
              ) : (
                'Claim 1,000 TPulseFi Now'
              )}
            </button>

            {hasClaimed && countdown && (
              <div className="countdown-container" aria-label="Time until next claim">
                <div className="countdown-item">
                  <div className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</div>
                  <div className="countdown-label">Hours</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</div>
                  <div className="countdown-label">Minutes</div>
                </div>
                <div className="countdown-item">
                  <div className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</div>
                  <div className="countdown-label">Seconds</div>
                </div>
              </div>
            )}
          </div>

          <div className="follow-card">
            <h2 className='text- text-blue-800'>Follow Requirements</h2>
            <p>Follow our official channels to claim</p>

            <div className="social-grid">
              {Object.keys(socialPlatforms).map((platform) =>
                renderSocialButtons(platform as SocialPlatform)
              )}
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}