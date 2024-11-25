"use client";
import { useState, useEffect } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { TypographyH1 } from "./components/ui/typography";
import { ModeToggle } from "./components/mode-toggle";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./components/ui/tooltip";
import "./home.css"; // Import the CSS file

const removeEmojis = (text: string): string =>
  text.replace(
    /[\u{1F600}-\u{1F6FF}\u{1F300}-\u{1F5FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
    ""
  );

function Home() {
  const [text, setText] = useState("");
  const [brainrot, setBrainrot] = useState("");
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  // Load available voices for TTS
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      console.log("Loaded voices:", availableVoices);
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name); // Default to the first voice
      }
    };

    speechSynthesis.addEventListener("voiceschanged", loadVoices);
    loadVoices(); // Initial attempt to load voices

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, [selectedVoice]);

  const speakText = (text: string) => {
    if (text && voices.length > 0) {
      const sentences =
        text.match(/[^\.!\?]+[\.!\?]+|[^\.!\?]+$/g) || [text]; // Split into sentences
      let index = 0;

      const speakNextSentence = () => {
        if (index < sentences.length) {
          const utterance = new SpeechSynthesisUtterance(sentences[index]);
          const voice = voices.find((v) => v.name === selectedVoice);
          utterance.voice = voice || voices[0]; // Fallback to first voice
          utterance.pitch = 0.8; // Controlled pitch
          utterance.rate = 0.7; // Controlled rate

          // Event listener to trigger the next sentence after current finishes
          utterance.onend = () => {
            index++;
            speakNextSentence();
          };

          speechSynthesis.speak(utterance);
        }
      };

      speakNextSentence();
    } else {
      console.error("No voices available for speech synthesis.");
    }
  };

  // Handle API Request
  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        "https://rotbot-production.up.railway.app/api/brainrot/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        }
      );

      const data = await response.json();
      const cleanBrainrot = removeEmojis(
        data.brainrot || "Server's doing the skibidi bop bop..."
      );
      setBrainrot(cleanBrainrot);

      // Trigger TTS
      speakText(cleanBrainrot);
    } catch (error) {
      console.error("Error fetching brainrot:", error);
      setBrainrot("Server go brrr... Try again later 💀.");
    } finally {
      setLoading(false);
    }
  };

  // Manual TTS
  const handleSpeakAgain = () => {
    if (brainrot) speakText(brainrot);
  };

  return (
    <>
      {/* Slimy Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Chaotic Background Video */}
        <div className="absolute inset-0 bg-black z-0">
          <video
            autoPlay
            loop
            muted
            className="w-full h-full object-cover opacity-50"
          >
            <source src="/path-to-your-chaotic-video.mp4" type="video/mp4" />
          </video>
        </div>
        {/* Slimy Animated Background */}
        <div className="absolute inset-0 z-10">
          {[...Array(30)].map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={i}
              className={`absolute w-24 h-24 rounded-full blur-2xl opacity-70 bg-gradient-to-r ${
                i % 2 === 0
                  ? "from-yellow-300 to-green-400"
                  : "from-pink-500 to-purple-600"
              }`}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 5}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      {/* Wrap with TooltipProvider */}
      <TooltipProvider delayDuration={200}>
        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-transparent">
          {/* Header */}
          <TypographyH1 className="text-center text-white z-10 font-goofy mb-4">
            BotRot 🤖
          </TypographyH1>
          {/* Description */}
          <TypographyH1 className="text-center text-white z-10 mb-12">
            This here lil' buddy turns ur boring normie English 🥱 into some
            chaotic z or brainrot lingo 🤪. Wanna confuse ur frens? Type away!
          </TypographyH1>
          {/* Goofy Brain Icon */}
          <img
            src="/path-to-goofy-brain.gif"
            alt="Goofy Brain"
            className="w-32 h-32 animate-spin-slow z-10"
          />
          <br />
          {/* Input-Output Box */}
          <div className="flex flex-col lg:flex-row justify-between w-11/12 max-w-6xl bg-black bg-opacity-80 p-8 rounded-lg shadow-lg gap-8 z-10">
            {/* Left Side: Input */}
            <div className="flex-1 flex flex-col gap-4">
              <Input
                placeholder="Enter ur brainrot text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="h-16 text-lg text-white bg-gray-800"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="hover:animate-wiggle"
                  >
                    {loading ? "Converting..." : "Brainrot It"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to unleash chaos!</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Right Side: Output */}
            <div className="flex-1 flex flex-col gap-4">
              <textarea
                readOnly
                value={brainrot || "Loading goofy chaos..."}
                className="h-32 bg-gray-800 rounded-lg p-4 text-white resize-none text-lg"
              />
              <Button
                onClick={handleSpeakAgain}
                disabled={!brainrot}
                className="hover:animate-wiggle"
              >
                Speak Again 🗣️
              </Button>
              {/* Voice Selector */}
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="p-2 rounded-lg border border-gray-600 bg-black text-white"
              >
                {voices.map((voice, idx) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
<option key={idx} value={voice.name}>
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              {/* Suggestion */}
              <p className="text-sm text-yellow-400 mt-2">
                Try the Eddy (German (Germany)) (de-DE) voice too! 😂😂
              </p>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </>
  );
}

export default Home;
