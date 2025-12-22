import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import {
  Trophy,
  Target,
  Layers,
  Zap,
  Crown,
  Gamepad2,
  CheckCircle2,
  Settings2,
  Repeat, // Imported Repeat Icon
} from "lucide-react";
import { type Player } from "../types/game";

// --- Types ---
type GameSettings = {
  withJoker: boolean;
  targetScore: number;
  sets: number;
  doublePenalty: boolean;
  shelemScore: number | string;
  mode: "target" | "sets";
};

// --- Animations ---
const springTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
};

// --- Components ---
const DealerChip = () => (
  <motion.div
    layoutId="dealer-chip"
    transition={springTransition}
    className="absolute -top-3 -right-3 z-20 bg-yellow-400 text-yellow-900 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-lg border-2 border-yellow-200"
  >
    D
  </motion.div>
);

const PlayerSeat = ({
  position,
  player,
  label,
  teamColor,
  onChangeName,
  onChangeDealer,
}: {
  position: "top" | "bottom" | "left" | "right";
  player: Player;
  label: string;
  teamColor: string;
  onChangeName: (val: string) => void;
  onChangeDealer: () => void;
}) => {
  // Positioning logic for the circular table
  const positionClasses = {
    top: "-top-6 left-1/2 -translate-x-1/2 flex-col-reverse",
    bottom: "-bottom-6 left-1/2 -translate-x-1/2 flex-col",
    left: "top-1/2 -left-2 -translate-y-1/2 -translate-x-1/2 flex-col-reverse rotate-90 sm:rotate-0", // Rotated on tiny screens
    right:
      "top-1/2 -right-2 -translate-y-1/2 translate-x-1/2 flex-col rotate-90 sm:rotate-0",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} flex items-center gap-3`}
    >
      <motion.div
        className="relative group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Avatar Circle */}
        <div
          onClick={onChangeDealer}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 ${
            player.isDealer
              ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
              : "border-white/10"
          } bg-gray-900 flex items-center justify-center cursor-pointer transition-all duration-300 z-10 relative overflow-hidden`}
        >
          <span className={`text-${teamColor}-400 font-bold text-xl`}>
            {label}
          </span>
          {/* Active Glow Background */}
          {player.name && (
            <div className={`absolute inset-0 bg-${teamColor}-500/20`} />
          )}
        </div>
        {/* The Magic Flying Dealer Chip */}
        {player.isDealer && <DealerChip />}
      </motion.div>
      {/* Input Field */}
      <motion.input
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        type="text"
        placeholder="نام بازیکن..."
        value={player.name}
        onChange={(e) => onChangeName(e.target.value)}
        className={`w-32 sm:w-36 bg-gray-900/80 backdrop-blur text-center text-white text-sm py-1 px-2 rounded-lg border border-white/10 focus:border-${teamColor}-400 focus:ring-1 focus:ring-${teamColor}-400 outline-none transition-all shadow-xl`}
      />
    </div>
  );
};

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div
    onClick={() => onChange(!checked)}
    className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${
      checked ? "bg-green-500 justify-start" : "bg-white/10 justify-end"
    }`}
  >
    <motion.div
      layout
      transition={{
        type: "spring" as const,
        stiffness: 600,
        damping: 11,
      }}
      className="bg-white w-6 h-6 rounded-full shadow-md"
    />
  </div>
);

// --- New Swap Button Component ---
const SwapPlayersButton = ({
  position,
  onSwap,
}: {
  position: "top-right" | "bottom-right" | "bottom-left" | "top-left";
  onSwap: () => void;
}) => {
  const positionClasses = {
    "top-right": "top-[15%] right-[15%] sm:top-[20%] sm:right-[20%]",
    "bottom-right": "bottom-[15%] right-[15%] sm:bottom-[20%] sm:right-[20%]",
    "bottom-left": "bottom-[15%] left-[15%] sm:bottom-[20%] sm:left-[20%]",
    "top-left": "top-[15%] left-[15%] sm:top-[20%] sm:left-[20%]",
  };

  return (
    <motion.button
      onClick={onSwap}
      className={`absolute ${positionClasses[position]} z-30 w-8 h-8 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/60 hover:bg-purple-500/30 hover:text-white transition-all transform -translate-x-1/2 -translate-y-1/2`}
      whileHover={{ scale: 1.2, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Repeat className="w-4 h-4" />
    </motion.button>
  );
};

const Home: React.FC = () => {
  const navigate = useNavigate();

  // --- State (Kept identical to original logic) ---
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

  const [gameSettings, setGameSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem("gameSettings");
    return saved
      ? JSON.parse(saved)
      : {
          withJoker: true,
          targetScore: 800,
          sets: 8,
          doublePenalty: false,
          shelemScore: 330,
          mode: "target",
        };
  });

  // --- Effects ---
  useEffect(
    () => localStorage.setItem("teamA", JSON.stringify(teamA)),
    [teamA]
  );
  useEffect(
    () => localStorage.setItem("teamB", JSON.stringify(teamB)),
    [teamB]
  );
  useEffect(
    () => localStorage.setItem("showInputs", JSON.stringify(showInputs)),
    [showInputs]
  );
  useEffect(
    () => localStorage.setItem("gameSettings", JSON.stringify(gameSettings)),
    [gameSettings]
  );

  // --- Handlers ---
  const handlePlayerChange = (team: "A" | "B", index: number, name: string) => {
    const setter = team === "A" ? setTeamA : setTeamB;
    setter((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));
  };

  const handleDealerChange = (team: "A" | "B", index: number) => {
    const setA = team === "A" ? setTeamA : setTeamB; // Current Team
    const setB = team === "A" ? setTeamB : setTeamA; // Other Team
    
    // Get the current team to check if the clicked player is already dealer
    const currentTeam = team === "A" ? teamA : teamB;
    const isAlreadyDealer = currentTeam[index]?.isDealer;

    // Using functional updates to ensure we don't need dependencies
    setA((prev) => prev.map((p, i) => ({ ...p, isDealer: i === index })));
    setB((prev) => prev.map((p) => ({ ...p, isDealer: false })));

    // Only show toast if the clicked player was not already dealer
    if (!isAlreadyDealer) {
      const dealerName = currentTeam[index]?.name || `${team}${index + 1}`;
      toast.success(`دیلر به ${dealerName} تغییر کرد`, {
        duration: 3000
      });
    }
  };

  // --- New Player Swap Handler ---
  const handleSwapPlayers = (
    team1: "A" | "B",
    index1: number,
    team2: "A" | "B",
    index2: number
  ) => {
    const player1 = (team1 === "A" ? teamA : teamB)[index1];
    const player2 = (team2 === "A" ? teamA : teamB)[index2];
    
    const name1 = player1.name;
    const name2 = player2.name;
    
    // Check if either player was dealer
    const wasPlayer1Dealer = player1.isDealer;
    const wasPlayer2Dealer = player2.isDealer;

    const setter1 = team1 === "A" ? setTeamA : setTeamB;
    const setter2 = team2 === "A" ? setTeamA : setTeamB;

    setter1((prev) =>
      prev.map((p, i) => (i === index1 ? { ...p, name: name2 } : p))
    );
    setter2((prev) =>
      prev.map((p, i) => (i === index2 ? { ...p, name: name1 } : p))
    );

    // Show swap toast
    toast.success(`جای ${name1 || "Player"} و ${name2 || "Player"} عوض شد`, {
      duration: 3000
    });
    
    // Show dealer change toast if dealer was swapped
    if (wasPlayer1Dealer || wasPlayer2Dealer) {
      const dealerName = wasPlayer1Dealer ? (name2 || `${team2}${index2 + 1}`) : (name1 || `${team1}${index1 + 1}`);
      toast.success(`دیلر به ${dealerName} تغییر کرد`, {
        duration: 3000
      });
    }
  };

  const handleSettingsChange = (key: keyof GameSettings, value: unknown) => {
    setGameSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "shelemScore") {
      const displayValue = value === "double" ? "دوبل" : value;
      toast.success(`امتیاز شلم به ${displayValue} تغییر کرد`, {
        duration: 2000
      });
    } else if (key === "withJoker") {
      // Update shelemScore if it's not valid for the new joker setting
      if (value && gameSettings.shelemScore === 330) {
        setGameSettings((prev) => ({ ...prev, shelemScore: 400 }));
      } else if (!value && gameSettings.shelemScore === 400) {
        setGameSettings((prev) => ({ ...prev, shelemScore: 330 }));
      }
      toast.success(`جوکر ${value ? "فعال" : "غیرفعال"} شد`, {
        duration: 2000
      });
    } else if (key === "doublePenalty") {
      toast.success(`دوبل منفی ${value ? "فعال" : "غیرفعال"} شد`, {
        duration: 2000
      });
    }
  };

  const handleStart = () => {
    console.log("Start");
    const allNames = [...teamA, ...teamB].map((p) => p.name);
    if (allNames.some((name) => name.trim() === "")) {
      toast.error("لطفاً نام همه بازیکنان را وارد کنید.", {
        duration: 3000
      });
      console.log("Error: empty names");
      console.log("Error dealer");
      return;
    }
    if (![...teamA, ...teamB].some((p) => p.isDealer)) {
      toast.error("با کلیک روی آواتار، دیلر را انتخاب کنید.", {
        duration: 3000
      });
      return;
    }
    console.log("Start");
    toast.success("بازی شروع شد!", {
      duration: 2000
    });
    navigate("/game", { state: { teamA, teamB, gameSettings } });
  };

  // --- Custom React Select Styles ---
  const selectStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (base: any) => ({
      ...base,
      backgroundColor: "rgba(255,255,255,0.05)",
      borderColor: "rgba(255,255,255,0.1)",
      color: "white",
      borderRadius: "0.75rem",
      padding: "2px",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    singleValue: (base: any) => ({ ...base, color: "white" }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937",
      borderRadius: "0.75rem",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3b82f6"
        : state.isFocused
        ? "#374151"
        : "transparent",
      color: "white",
      cursor: "pointer",
    }),
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.15),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />
        <AnimatePresence mode="wait">
          {!showInputs ? (
            <motion.button
              key="start-btn"
              layoutId="main-card"
              onClick={() => setShowInputs(true)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative px-12 py-6 bg-transparent rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-blue-600 opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="absolute inset-0 border border-white/10 rounded-2xl" />
              <div className="flex flex-col items-center gap-4 relative z-10">
                <Gamepad2 className="w-16 h-16 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                <span className="text-3xl font-black tracking-tighter bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  شروع بازی
                </span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="config-panel"
              layoutId="main-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Col: Settings */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6 text-purple-300">
                    <Settings2 className="w-5 h-5" />
                    <h2 className="text-lg font-bold uppercase tracking-wider">
                      تنظیمات بازی
                    </h2>
                  </div>
                  {/* Shelem Score Dropdown at the top */}
                  <div className="p-3 bg-white/5 rounded-2xl mb-6">
                    <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
                      امتیاز شلم
                    </label>
                    <Select
                      options={
                        gameSettings.withJoker
                          ? [
                              {
                                value: 200 as number | string,
                                label: "200 امتیاز",
                              },
                              {
                                value: 400 as number | string,
                                label: "400 امتیاز",
                              },
                              {
                                value: "double" as number | string,
                                label: "دوبل",
                              },
                            ]
                          : [
                              {
                                value: 165 as number | string,
                                label: "165 امتیاز",
                              },
                              {
                                value: 330 as number | string,
                                label: "330 امتیاز",
                              },
                              {
                                value: "double" as number | string,
                                label: "دوبل",
                              },
                            ]
                      }
                      value={
                        gameSettings.withJoker
                          ? gameSettings.shelemScore === 200
                            ? {
                                value: 200 as number | string,
                                label: "200 امتیاز",
                              }
                            : gameSettings.shelemScore === 400
                            ? {
                                value: 400 as number | string,
                                label: "400 امتیاز",
                              }
                            : {
                                value: "double" as number | string,
                                label: "دوبل",
                              }
                          : gameSettings.shelemScore === 165
                          ? {
                              value: 165 as number | string,
                              label: "165 امتیاز",
                            }
                          : gameSettings.shelemScore === 330
                          ? {
                              value: 330 as number | string,
                              label: "330 امتیاز",
                            }
                          : {
                              value: "double" as number | string,
                              label: "دوبل",
                            }
                      }
                      onChange={(opt) =>
                        opt && handleSettingsChange("shelemScore", opt.value)
                      }
                      styles={selectStyles}
                      isSearchable={false}
                    />
                  </div>
                  {/* Mode Select */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {["target", "sets"].map((m) => (
                      <motion.button
                        key={m}
                        onClick={() => handleSettingsChange("mode", m)}
                        className={`relative p-4 rounded-2xl border transition-all ${
                          gameSettings.mode === m
                            ? "border-purple-500/50 bg-purple-500/10"
                            : "border-white/5 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {gameSettings.mode === m && (
                          <motion.div
                            layoutId="active-mode"
                            className="absolute inset-0 border-2 border-purple-500 rounded-2xl"
                          />
                        )}
                        <div className="flex flex-col items-center gap-2">
                          {m === "target" ? (
                            <Target className="w-6 h-6" />
                          ) : (
                            <Layers className="w-6 h-6" />
                          )}
                          <span className="text-sm font-medium">
                            {m === "target" ? "هدف امتیاز" : "تعداد ست"}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  {/* Score / Sets Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {(gameSettings.mode === "target"
                      ? [600, 800, 1165, 2000]
                      : [4, 8]
                    ).map((val) => (
                      <button
                        key={val}
                        onClick={() =>
                          handleSettingsChange(
                            gameSettings.mode === "target"
                              ? "targetScore"
                              : "sets",
                            val
                          )
                        }
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${
                          (gameSettings.mode === "target"
                            ? gameSettings.targetScore
                            : gameSettings.sets) === val
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50"
                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {/* Toggles List */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                          <Crown className="w-5 h-5" />
                        </div>
                        <span className="font-medium"> جوکر</span>
                      </div>
                      <ToggleSwitch
                        checked={gameSettings.withJoker}
                        onChange={(v) => handleSettingsChange("withJoker", v)}
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 text-red-400 rounded-lg">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-medium">دوبل منفی</span>
                      </div>
                      <ToggleSwitch
                        checked={gameSettings.doublePenalty}
                        onChange={(v) =>
                          handleSettingsChange("doublePenalty", v)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Col: The Table (Visual) */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 relative flex items-center justify-center overflow-hidden shadow-2xl">
                  {/* Decorative Table Felt */}
                  <div className="absolute w-75 h-75 sm:w-100 sm:h-100 rounded-full border-2 border-white/5 bg-linear-to-br from-green-900/20 to-blue-900/20 flex items-center justify-center">
                    <div className="w-[60%] h-[60%] rounded-full border border-white/5 flex items-center justify-center">
                      <Trophy className="w-12 h-12 text-white/5" />
                    </div>
                  </div>
                  {/* --- The Players (Satellite Layout) --- */}
                  <div className="relative w-70 h-70 sm:w-87.5 sm:h-87.5">
                    {/* Top: Team A-1 */}
                    <PlayerSeat
                      position="top"
                      player={teamA[0]}
                      label="A1"
                      teamColor="blue"
                      onChangeName={(n) => handlePlayerChange("A", 0, n)}
                      onChangeDealer={() => handleDealerChange("A", 0)}
                    />
                    {/* Bottom: Team A-2 */}
                    <PlayerSeat
                      position="bottom"
                      player={teamA[1]}
                      label="A2"
                      teamColor="blue"
                      onChangeName={(n) => handlePlayerChange("A", 1, n)}
                      onChangeDealer={() => handleDealerChange("A", 1)}
                    />
                    {/* Left: Team B-1 */}
                    <PlayerSeat
                      position="left"
                      player={teamB[0]}
                      label="B1"
                      teamColor="purple"
                      onChangeName={(n) => handlePlayerChange("B", 0, n)}
                      onChangeDealer={() => handleDealerChange("B", 0)}
                    />
                    {/* Right: Team B-2 */}
                    <PlayerSeat
                      position="right"
                      player={teamB[1]}
                      label="B2"
                      teamColor="purple"
                      onChangeName={(n) => handlePlayerChange("B", 1, n)}
                      onChangeDealer={() => handleDealerChange("B", 1)}
                    />
                    {/* --- Swap Buttons --- */}
                    <SwapPlayersButton
                      position="top-right"
                      onSwap={() => handleSwapPlayers("A", 0, "B", 1)}
                    />
                    <SwapPlayersButton
                      position="bottom-right"
                      onSwap={() => handleSwapPlayers("A", 1, "B", 1)}
                    />
                    <SwapPlayersButton
                      position="bottom-left"
                      onSwap={() => handleSwapPlayers("A", 1, "B", 0)}
                    />
                    <SwapPlayersButton
                      position="top-left"
                      onSwap={() => handleSwapPlayers("A", 0, "B", 0)}
                    />
                  </div>
                </div>
                {/* Start Button */}
                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Button clicked");
                    handleStart();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative z-50 mt-4 w-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 py-4 rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(147,51,234,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.5)] transition-shadow border border-white/20 flex items-center justify-center gap-3"
                  style={{ pointerEvents: "auto" }}
                >
                  <span>شروع بازی</span>
                  <CheckCircle2 className="w-6 h-6" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Home;
