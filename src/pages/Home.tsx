import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';

interface Player {
  name: string;
  isDealer: boolean;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState<Player[]>(() => {
    const saved = localStorage.getItem('teamA');
    return saved ? JSON.parse(saved) : [
      { name: '', isDealer: false },
      { name: '', isDealer: false },
    ];
  });
  const [teamB, setTeamB] = useState<Player[]>(() => {
    const saved = localStorage.getItem('teamB');
    return saved ? JSON.parse(saved) : [
      { name: '', isDealer: false },
      { name: '', isDealer: false },
    ];
  });
  const [showInputs, setShowInputs] = useState(() => {
    const saved = localStorage.getItem('showInputs');
    return saved ? JSON.parse(saved) : false;
  });
  const inputsRef = useRef<HTMLDivElement>(null);


  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('teamA', JSON.stringify(teamA));
  }, [teamA]);

  useEffect(() => {
    localStorage.setItem('teamB', JSON.stringify(teamB));
  }, [teamB]);

  useEffect(() => {
    localStorage.setItem('showInputs', JSON.stringify(showInputs));
  }, [showInputs]);

  useEffect(() => {
    if (showInputs && inputsRef.current) {
      gsap.fromTo(inputsRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 });
    }
  }, [showInputs]);

  const handleNewGame = () => {
    setShowInputs(true);
  };

  const handlePlayerChange = (team: 'A' | 'B', index: number, name: string) => {
    const setter = team === 'A' ? setTeamA : setTeamB;
    setter(prev => prev.map((p, i) => i === index ? { ...p, name } : p));
  };

  const handleDealerChange = (team: 'A' | 'B', index: number) => {
    const setter = team === 'A' ? setTeamA : setTeamB;
    const otherSetter = team === 'A' ? setTeamB : setTeamA;
    setter(prev => prev.map((p, i) => ({ ...p, isDealer: i === index })));
    otherSetter(prev => prev.map(p => ({ ...p, isDealer: false })));
  };

  const handleStart = () => {
    // Navigate to game with state
    navigate('/game', { state: { teamA, teamB } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {!showInputs ? (
        <button
          onClick={handleNewGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300"
        >
          بازی جدید
        </button>
      ) : (
        <div ref={inputsRef} className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">ورود نام بازیکنان</h2>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">تیم A</h3>
            {teamA.map((player, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder={`بازیکن ${index + 1}`}
                  value={player.name}
                  onChange={(e) => handlePlayerChange('A', index, e.target.value)}
                  className="flex-1 p-2 rounded mr-2 text-black"
                />
                <input
                  type="radio"
                  name="dealer"
                  checked={player.isDealer}
                  onChange={() => handleDealerChange('A', index)}
                  className="mr-2"
                />
                <label>دلت</label>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">تیم B</h3>
            {teamB.map((player, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder={`بازیکن ${index + 1}`}
                  value={player.name}
                  onChange={(e) => handlePlayerChange('B', index, e.target.value)}
                  className="flex-1 p-2 rounded mr-2 text-black"
                />
                <input
                  type="radio"
                  name="dealer"
                  checked={player.isDealer}
                  onChange={() => handleDealerChange('B', index)}
                  className="mr-2"
                />
                <label>دلت</label>
              </div>
            ))}
          </div>
          <button
            onClick={handleStart}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            شروع بازی
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;