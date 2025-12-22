import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaUsers, FaTimes } from "react-icons/fa";
import { type Player, type Set, type GameSettings } from "../types/game";

// --- Reusable UI Components ---

const Modal: React.FC<{
  children: React.ReactNode;
  closeModal: () => void;
}> = ({ children, closeModal }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
    onClick={closeModal}
  >
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="bg-gray-800 bg-opacity-50 backdrop-blur-lg rounded-2xl w-full max-w-md relative shadow-2xl border border-white border-opacity-20"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-white text-opacity-70 hover:text-opacity-100 transition-opacity"
      >
        <FaTimes size={24} />
      </button>
      {children}
    </motion.div>
  </motion.div>
);

const FloatingActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  position: "left" | "right";
  color: string;
}> = ({ onClick, icon, position, color }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`fixed bottom-6 ${
      position === "left" ? "left-6" : "right-6"
    } ${color} text-white p-4 rounded-full shadow-lg z-40`}
  >
    {icon}
  </motion.button>
);

// --- Main Game Component ---

const GameDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const setsEndRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [teamA, setTeamA] = useState<Player[]>(() => {
    const saved = localStorage.getItem("teamA");
    return saved ? JSON.parse(saved) : [];
  });
  const [teamB, setTeamB] = useState<Player[]>(() => {
    const saved = localStorage.getItem("teamB");
    return saved ? JSON.parse(saved) : [];
  });
  const [gameSettings, setGameSettings] = useState<GameSettings | null>(() => {
    const saved = localStorage.getItem("gameSettings");
    return saved ? JSON.parse(saved) : null;
  });
  const [sets, setSets] = useState<Set[]>(() => {
    const saved = localStorage.getItem("sets");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddSetModal, setShowAddSetModal] = useState(false);
  const [biddingTeam, setBiddingTeam] = useState<"A" | "B">("A");
  const [bid, setBid] = useState(100);
  const [defenderPoints, setDefenderPoints] = useState(65);
  const [bidderPlayer, setBidderPlayer] = useState("");
  const [gameFinished, setGameFinished] = useState(false);
  const [winner, setWinner] = useState<"A" | "B" | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(() => {
    const saved = localStorage.getItem("elapsedTime");
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- Effects ---

  // Load initial state from navigation and localStorage
  useEffect(() => {
    if (location.state) {
      const {
        teamA: stateTeamA,
        teamB: stateTeamB,
        gameSettings: stateGameSettings,
      } = location.state as {
        teamA: Player[];
        teamB: Player[];
        gameSettings: GameSettings;
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stateTeamA) setTeamA(stateTeamA);
      if (stateTeamB) setTeamB(stateTeamB);
      if (stateGameSettings) setGameSettings(stateGameSettings);
    }
  }, [location.state]);

  // Persist state to localStorage
  useEffect(
    () => localStorage.setItem("teamA", JSON.stringify(teamA)),
    [teamA]
  );
  useEffect(
    () => localStorage.setItem("teamB", JSON.stringify(teamB)),
    [teamB]
  );
  useEffect(
    () => localStorage.setItem("gameSettings", JSON.stringify(gameSettings)),
    [gameSettings]
  );
  useEffect(() => localStorage.setItem("sets", JSON.stringify(sets)), [sets]);
  useEffect(
    () => localStorage.setItem("elapsedTime", elapsedTime.toString()),
    [elapsedTime]
  );

  // Timer
  useEffect(() => {
    if (gameFinished) return;
    const interval = setInterval(
      () => setElapsedTime((prev) => prev + 1),
      1000
    );
    return () => clearInterval(interval);
  }, [gameFinished]);

  // Auto-scroll to new sets
  useEffect(() => {
    setsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sets]);

  // Check for game completion
  useEffect(() => {
    if (!gameSettings || sets.length === 0) return;

    const totalA = sets.reduce((sum, set) => sum + set.teamA, 0);
    const totalB = sets.reduce((sum, set) => sum + set.teamB, 0);

    let isFinished = false;
    let newWinner: "A" | "B" | null = null;

    if (gameSettings.mode === "target") {
      if (totalA >= gameSettings.targetScore) {
        isFinished = true;
        newWinner = "A";
      } else if (totalB >= gameSettings.targetScore) {
        isFinished = true;
        newWinner = "B";
      }
    } else if (gameSettings.mode === "sets") {
      if (sets.length >= gameSettings.sets) {
        isFinished = true;
        newWinner = totalA > totalB ? "A" : "B"; // B wins ties
      }
    }

    if (isFinished) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGameFinished(true);
      setWinner(newWinner);
    }
  }, [sets, gameSettings]);

  // Set default bidder player when team changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBidderPlayer(
      biddingTeam === "A" ? teamA[0]?.name || "" : teamB[0]?.name || ""
    );
  }, [biddingTeam, teamA, teamB]);

  // --- Handlers ---
  const handleAddSet = () => setShowAddSetModal(true);
  const handleCloseModal = () => setShowAddSetModal(false);
  const togglePlayerScores = () => setShowPlayerModal(true);
  const closePlayerModal = () => setShowPlayerModal(false);

  const handleSubmitSet = () => {
    if (!gameSettings) return;

    const doubleShelemBid = gameSettings.withJoker ? 400 : 330;

    const biddingPoints = 165 - defenderPoints;
    const bidderSucceeded = biddingPoints >= bid;
    let biddingScore: number;
    let type: "normal" | "shelem" | "double_penalty" | "double_shelem";

    if (defenderPoints === 0) {
      if (bid === doubleShelemBid) {
        type = "double_shelem";
        biddingScore =
          gameSettings.shelemScore === "double"
            ? 660
            : 2 * Number(gameSettings.shelemScore);
      } else {
        type = "shelem";
        biddingScore =
          gameSettings.shelemScore === "double"
            ? 330
            : Number(gameSettings.shelemScore);
      }
    } else if (!bidderSucceeded && gameSettings.doublePenalty) {
      type = "double_penalty";
      biddingScore = -2 * bid;
    } else {
      type = "normal";
      biddingScore = bidderSucceeded ? biddingPoints : -bid;
    }

    setSets((prev) => [
      ...prev,
      {
        bid,
        teamA: biddingTeam === "A" ? biddingScore : defenderPoints,
        teamB: biddingTeam === "B" ? biddingScore : defenderPoints,
        biddingTeam,
        bidderPlayer,
        type,
      },
    ]);

    handleCloseModal();
    // Reset form for next round
    setBid(100);
    setDefenderPoints(65);
  };

  const handleNewGame = () => {
    localStorage.clear();
    navigate("/");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const calculatePlayerStats = () => {
    const allPlayers = [...teamA, ...teamB];
    return allPlayers.map((player) => {
      let positive = 0;
      let negative = 0;
      let shelem = 0;
      let doubleNegative = 0;
      sets.forEach((set) => {
        if (set.bidderPlayer === player.name) {
          const score = set.biddingTeam === "A" ? set.teamA : set.teamB;
          if (score > 0) {
            positive += score;
          } else {
            negative += score;
          }
          if (set.type === "shelem" || set.type === "double_shelem") {
            shelem += 1;
          } else if (set.type === "double_penalty") {
            doubleNegative += 1;
          }
        }
      });
      const total = positive + negative;
      return { name: player.name, positive, negative, total, shelem, doubleNegative };
    });
  };

  // --- Render Logic ---

  if (gameFinished && winner) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-900 to-blue-900 text-white p-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <div className="text-5xl font-bold tracking-widest mb-6">
            {formatTime(elapsedTime)}
          </div>
          <h1 className="text-6xl font-extrabold mb-4">پایان بازی</h1>
          <div className="text-3xl mb-8">
            <span className="font-light">تیم برنده:</span>{" "}
            <span className="font-bold text-yellow-400">تیم {winner}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewGame}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 text-xl shadow-lg"
          >
            بازی جدید
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const cumulativeScores = sets.reduce(
    (acc, set) => {
      const newTotalA = acc.totalA + set.teamA;
      const newTotalB = acc.totalB + set.teamB;
      acc.rows.push({ ...set, cumulativeA: newTotalA, cumulativeB: newTotalB });
      acc.totalA = newTotalA;
      acc.totalB = newTotalB;
      return acc;
    },
    {
      totalA: 0,
      totalB: 0,
      rows: [] as (Set & { cumulativeA: number; cumulativeB: number })[],
    }
  );

  const allPlayers = [teamA[1], teamB[1], teamA[0], teamB[0]].filter(Boolean);
  const initialDealerIndex = allPlayers.findIndex((p) => p.isDealer);

  const chunkedRows: (Set & { cumulativeA: number; cumulativeB: number })[][] =
    [];
  for (let i = 0; i < cumulativeScores.rows.length; i += 2) {
    chunkedRows.push(cumulativeScores.rows.slice(i, i + 2));
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 to-indigo-900 text-white p-4">
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-md py-4 px-2 text-center shadow-lg rounded-b-2xl">
        <div className="text-4xl font-bold tracking-widest">
          {formatTime(elapsedTime)}
        </div>
        <div className="flex justify-between items-center mt-2 text-xl max-w-lg mx-auto">
          <div className="font-bold text-blue-400">
            {teamA[0]?.name || "تیم A"}: {cumulativeScores.totalA}
          </div>
          <div className="font-bold text-red-400">
            {teamB[0]?.name || "تیم B"}: {cumulativeScores.totalB}
          </div>
        </div>
      </header>

      <main className="space-y-3 pt-4 pb-24">
        <AnimatePresence>
          {chunkedRows.map((chunk, chunkIndex) => {
            const dealerIndex =
              (initialDealerIndex - chunkIndex + allPlayers.length) %
              allPlayers.length;
            const dealer = allPlayers[dealerIndex];
            const dealerName = dealer ? dealer.name : "Unknown";
            const isTeamA = dealer
              ? teamA.some((player) => player.name === dealer.name)
              : false;
            const borderColor = isTeamA ? "border-blue-400" : "border-red-400";
            const bgColor = isTeamA
              ? "bg-blue-400 bg-opacity-10"
              : "bg-red-400 bg-opacity-10";

            return (
              <motion.div
                key={chunkIndex}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ type: "spring", damping: 20, stiffness: 200 }}
                className={`${bgColor} border-2 ${borderColor} rounded-xl p-3`}
              >
                {chunk.map((set, setIndex) => {
                  const wasSuccessful =
                    (set.biddingTeam === "A" && set.teamA > 0) ||
                    (set.biddingTeam === "B" && set.teamB > 0);
                  return (
                    <motion.div
                      key={chunkIndex * 2 + setIndex}
                      className="grid grid-cols-3 items-center bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl p-3 border border-white border-opacity-20 shadow-lg mb-2 last:mb-0"
                    >
                      <div className="text-center text-2xl font-bold text-blue-400">
                        {set.cumulativeA}
                      </div>
                      <div className="text-center border-x border-white border-opacity-20 px-2">
                        <div className="text-lg font-semibold">{set.bid}</div>
                        <div
                          className={`text-5xl font-black my-1 ${
                            set.type === "shelem"
                              ? "text-green-400"
                              : set.type === "double_penalty"
                              ? "text-red-400"
                              : wasSuccessful
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {set.biddingTeam === "A" ? "→" : "←"}
                        </div>
                        <div className="text-md text-white text-opacity-80 truncate">
                          {set.bidderPlayer}
                        </div>
                        {set.type === "shelem" && (
                          <div className="text-green-400 font-bold text-xs mt-1">
                            شلم
                          </div>
                        )}
                        {set.type === "double_shelem" && (
                          <div className="text-green-400 font-bold text-xs mt-1">
                            دوبل شلم
                          </div>
                        )}
                        {set.type === "double_penalty" && (
                          <div className="text-red-400 font-bold text-xs mt-1">
                            دوبل منفی
                          </div>
                        )}
                      </div>
                      <div className="text-center text-2xl font-bold text-red-400">
                        {set.cumulativeB}
                      </div>
                    </motion.div>
                  );
                })}
                <div className="text-center text-md text-white/70 font-semibold mt-2 rounded px-2">
                  دیلر: {dealerName}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={setsEndRef} />
      </main>

      {!gameFinished && (
        <>
          <FloatingActionButton
            onClick={togglePlayerScores}
            icon={<FaUsers size={24} />}
            position="left"
            color="bg-blue-600"
          />
          <FloatingActionButton
            onClick={handleAddSet}
            icon={<FaPlus size={24} />}
            position="right"
            color="bg-green-600"
          />
        </>
      )}

      <AnimatePresence>
        {showAddSetModal && (
          <Modal closeModal={handleCloseModal}>
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">افزودن ست</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold">
                    تیم پیشنهاد دهنده
                  </label>
                  <div className="relative flex bg-gray-700 bg-opacity-50 rounded-lg p-1">
                    {biddingTeam === "A" ? (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute top-1 bottom-1 rounded-md bg-blue-600"
                        style={{
                          width: "calc(50% - 8px)",
                          right: "4px",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    ) : (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute top-1 bottom-1 rounded-md bg-red-600"
                        style={{
                          width: "calc(50% - 8px)",
                          right: "calc(50% + 4px)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    <button
                      className={`flex-1 p-2 rounded-md transition-colors relative z-10 ${
                        biddingTeam === "A" ? "text-white" : "text-gray-300"
                      }`}
                      onClick={() => setBiddingTeam("A")}
                    >
                      تیم A
                    </button>
                    <button
                      className={`flex-1 p-2 rounded-md transition-colors relative z-10 ${
                        biddingTeam === "B" ? "text-white" : "text-gray-300"
                      }`}
                      onClick={() => setBiddingTeam("B")}
                    >
                      تیم B
                    </button>
                  </div>
                </div>
                {[
                  {
                    label: "بازیکن پیشنهاد دهنده",
                    value: bidderPlayer,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                      setBidderPlayer(e.target.value),
                    options: (biddingTeam === "A" ? teamA : teamB).map((p) => ({
                      label: p.name,
                      value: p.name,
                    })),
                  },
                  {
                    label: "مقدار پیشنهاد",
                    value: bid,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                      setBid(Number(e.target.value)),
                    options: (() => {
                      const minBid = gameSettings?.doublePenalty ? 85 : 70;
                      const maxBid = gameSettings?.withJoker ? 195 : 160;
                      const shelemBid = gameSettings?.withJoker ? 200 : 165;
                      const doubleShelemBid = gameSettings?.withJoker ? 400 : 330;
                      return [
                        ...Array.from(
                          { length: (maxBid - minBid) / 5 + 1 },
                          (_, i) => ({
                            label: minBid + i * 5,
                            value: minBid + i * 5,
                          })
                        ),
                        { label: "شلم", value: shelemBid },
                        { label: "دوبل شلم", value: doubleShelemBid },
                      ];
                    })(),
                  },
                  {
                    label: "امتیاز تیم مدافع",
                    value: defenderPoints,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
                      setDefenderPoints(Number(e.target.value)),
                    options: (() => {
                      const maxDefenderPoints = gameSettings?.withJoker ? 195 : 160;
                      return Array.from({ length: maxDefenderPoints / 5 + 1 }, (_, i) => ({
                        label: i * 5,
                        value: i * 5,
                      }));
                    })(),
                  },
                ].map(({ label, value, onChange, options }) => (
                  <div key={label}>
                    <label className="block mb-2 font-semibold">{label}</label>
                    <select
                      value={value}
                      onChange={onChange}
                      className="w-full p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {options.map((opt, index) => (
                        <option key={index} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="flex space-x-4 rtl:space-x-reverse pt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmitSet}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    افزودن
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    لغو
                  </motion.button>
                </div>
              </div>
            </div>
          </Modal>
        )}
        {showPlayerModal && (
          <Modal closeModal={closePlayerModal}>
            <div className="p-6 text-white w-full h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">امتیازات بازیکنان</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewGame}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300"
                >
                  بازی جدید
                </motion.button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-center">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="p-3 font-semibold"></th>
                      {calculatePlayerStats().map((stat) => (
                        <th key={stat.name} className="p-3 font-semibold">
                          {stat.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        label: "مثبت",
                        key: "positive",
                        color: "text-green-400",
                      },
                      { label: "منفی", key: "negative", color: "text-red-400" },
                      { label: "مجموع", key: "total", color: "" },
                      { label: "شلم", key: "shelem", color: "text-yellow-400" },
                      {
                        label: "دوبل منفی",
                        key: "doubleNegative",
                        color: "text-orange-400",
                      },
                    ].map(({ label, key, color }) => (
                      <tr
                        key={key}
                        className="border-b border-white border-opacity-10"
                      >
                        <td className="p-3 font-semibold">{label}</td>
                        {calculatePlayerStats().map((stat) => (
                          <td
                            key={stat.name}
                            className={`p-3 font-mono text-lg ${color}`}
                          >
                            {stat[key as keyof typeof stat]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameDetail;
