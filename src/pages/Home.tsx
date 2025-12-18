import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { type Player } from "../types/game";

// Reusable component for the player input block to reduce code duplication and enforce consistent styling
const PlayerInputBlock = ({
  placeholder,
  player,
  onChangeName,
  onChangeDealer,
}: {
  placeholder: string;
  player: Player;
  onChangeName: (val: string) => void;
  onChangeDealer: () => void;
}) => (
  <div className="flex flex-col items-center justify-center w-full">
    <input
      type="text"
      placeholder={placeholder}
      value={player.name}
      onChange={(e) => onChangeName(e.target.value)}
      // Responsive width: w-40 on mobile, growing on larger screens
      className="w-40 sm:w-32 md:w-full p-1.5 sm:p-2 text-black mb-1 text-center text-sm sm:text-base border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
    <div
      className="flex items-center justify-center cursor-pointer"
      onClick={onChangeDealer}
    >
      <input
        type="radio"
        name="dealer"
        checked={player.isDealer}
        onChange={onChangeDealer}
        className="mr-1 sm:mr-2 cursor-pointer"
      />
      <label className="text-xs sm:text-sm cursor-pointer select-none">
        Dealer
      </label>
    </div>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState<Player[]>(() => {
    const saved = localStorage.getItem("teamA");
    return saved
      ? JSON.parse(saved)
      : [
          { name: "", isDealer: false },
          { name: "", isDealer: false },
        ];
  });
  const [teamB, setTeamB] = useState<Player[]>(() => {
    const saved = localStorage.getItem("teamB");
    return saved
      ? JSON.parse(saved)
      : [
          { name: "", isDealer: false },
          { name: "", isDealer: false },
        ];
  });
  const [showInputs, setShowInputs] = useState(() => {
    const saved = localStorage.getItem("showInputs");
    return saved ? JSON.parse(saved) : false;
  });
  const inputsRef = useRef<HTMLDivElement>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("teamA", JSON.stringify(teamA));
  }, [teamA]);

  useEffect(() => {
    localStorage.setItem("teamB", JSON.stringify(teamB));
  }, [teamB]);

  useEffect(() => {
    localStorage.setItem("showInputs", JSON.stringify(showInputs));
  }, [showInputs]);

  useEffect(() => {
    if (showInputs && inputsRef.current) {
      gsap.fromTo(
        inputsRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }, [showInputs]);

  const handleNewGame = () => {
    setShowInputs(true);
  };

  const handlePlayerChange = (team: "A" | "B", index: number, name: string) => {
    const setter = team === "A" ? setTeamA : setTeamB;
    setter((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  const handleDealerChange = (team: "A" | "B", index: number) => {
    const setter = team === "A" ? setTeamA : setTeamB;
    const otherSetter = team === "A" ? setTeamB : setTeamA;
    setter((prev) => prev.map((p, i) => ({ ...p, isDealer: i === index })));
    otherSetter((prev) => prev.map((p) => ({ ...p, isDealer: false })));
  };

  const handleStart = () => {
    const allNames = [...teamA, ...teamB].map(p => p.name);
    if (allNames.some(name => name.length > 10)) {
      alert('Each player name must be at last 10 characters long.');
      return;
    }
    navigate("/game", { state: { teamA, teamB } });
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      {!showInputs ? (
        <button
          onClick={handleNewGame}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition duration-300 shadow-lg"
        >
          بازی جدید
        </button>
      ) : (
        <div
          ref={inputsRef}
          className="w-[95%] max-w-lg bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 sm:p-6 shadow-2xl border border-white/20"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">
            ورود نام بازیکنان
          </h2>

          {/* Grid Layout:
            On mobile, we use tighter gaps. 
            We use col-start classes to position items in a cross shape 
          */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center justify-items-center">
            {/* Row 1: Top Center */}
            <div className="col-start-2">
              <PlayerInputBlock
                placeholder="Top (A)"
                player={teamA[0]}
                onChangeName={(val) => handlePlayerChange("A", 0, val)}
                onChangeDealer={() => handleDealerChange("A", 0)}
              />
            </div>

            {/* Row 2: Left, Center(Empty), Right */}
            <div className="col-start-1 row-start-2">
              <PlayerInputBlock
                placeholder="Left (B)"
                player={teamB[0]}
                onChangeName={(val) => handlePlayerChange("B", 0, val)}
                onChangeDealer={() => handleDealerChange("B", 0)}
              />
            </div>

            {/* Center decorative element (Optional - Table Visual) */}
            <div className="row-start-2 col-start-2 flex justify-center items-center opacity-30">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 rounded-full flex items-center justify-center">
                <span className="text-xs">VS</span>
              </div>
            </div>

            <div className="col-start-3 row-start-2">
              <PlayerInputBlock
                placeholder="Right (B)"
                player={teamB[1]}
                onChangeName={(val) => handlePlayerChange("B", 1, val)}
                onChangeDealer={() => handleDealerChange("B", 1)}
              />
            </div>

            {/* Row 3: Bottom Center */}
            <div className="col-start-2 row-start-3">
              <PlayerInputBlock
                placeholder="Bottom (A)"
                player={teamA[1]}
                onChangeName={(val) => handlePlayerChange("A", 1, val)}
                onChangeDealer={() => handleDealerChange("A", 1)}
              />
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-500 text-black hover:bg-blue-600 font-bold py-3 px-4 rounded-lg transition duration-300 mt-8 shadow-md text-sm sm:text-base"
          >
            شروع بازی
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
