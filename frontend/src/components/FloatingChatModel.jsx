import { useState, useEffect } from "react";
import { Send, Mic, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const API_BASE = import.meta.env.VITE_API_BASE;

const FloatingChatbotModal = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "👋 Hi! I’m your Sudhaar Sevak. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [recognition, setRecognition] = useState(null);
  const [listening, setListening] = useState(false);

  // Speech recognition setup
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recog = new window.webkitSpeechRecognition();
      recog.lang = "en-US";
      recog.continuous = true;
      recog.interimResults = false;
      let manualStop = false;
      recog.onstart = () => {
        setListening(true);
        manualStop = false;
      };
      recog.onend = () => {
        if (!manualStop) return;
        setListening(false);
      };
      recog.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        sendMessage(transcript);
      };
      setRecognition(recog);
    }
  }, []);

  // Stop speech when closing modal
  useEffect(() => {
    if (!open && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (recognition && listening) {
        recognition.stop();
        setListening(false);
      }
    }
  }, [open]);

  // Speak bot responses
  const speakText = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
  
      // Get all available voices.
      const synth = window.speechSynthesis;
      let voices = synth.getVoices();
  
      // Workaround: Chrome sometimes loads voices async
      if (!voices.length) {
        // Chrome loads voices async, so listen to the voiceschanged event
        window.speechSynthesis.onvoiceschanged = () => speakText(text);
        return;
      }
  
      // Pick a preferred English voice (modify to fit your need)
      const preferVoices = [
        "Google UK English Male",
        "Google US English",
        "Google UK English Female",
        "Google español",
        "Microsoft Aria Online (Natural) - English (United States)"
      ];
  
      let voice =
        voices.find(v => v.name.includes("Google") && v.lang === "en-US") ||
        voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
        voices.find(v => v.default && v.lang.startsWith("en")) ||
        voices.find(v => v.lang.startsWith("en")) ||
        voices[0];
  
      // Or (if you want to be more specific)
      // let voice = voices.find(v => preferVoices.includes(v.name)) || voices[0];
  
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.voice = voice;
  
      // Optional: fine tune
      utterance.rate = 1;
      utterance.pitch = 1.1;
  
      synth.speak(utterance);
    }
  };

  
  
  const handleMicClick = () => {
    if (!recognition) return;
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
    }
  };
  

  const sendMessage = async (forcedMessage = null) => {
    const userInput = forcedMessage || input;
    if (!userInput.trim()) return;
    const newUserMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await res.json();
      const botReply = { role: "bot", content: data.reply };
      setMessages((prev) => [...prev, botReply]);
      speakText(data.reply);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "❌ Server error, please try again later." },
      ]);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        size="lg"
        style={{ bottom: "30px", left: "32px" }}
        className="fixed w-16 h-16 rounded-full
             bg-gradient-to-r from-indigo-600 to-purple-600 
             hover:from-indigo-700 hover:to-purple-700 
             shadow-lg flex items-center justify-center z-50 border-2"
        onClick={() => setOpen(true)}
        aria-label="Open Chatbot"
      >
        <Bot className="w-7 h-7 text-white" />
      </Button>

      {/* Chat Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="sm:max-w-md flex flex-col h-[90vh] max-h-[600px] rounded-2xl 
          shadow-2xl border border-white/10 backdrop-blur-xl bg-neutral-900/90 text-white"
        >
          {/* Header */}
          <DialogHeader className="p-3 border-b border-white/10">
            <DialogTitle className="text-white text-lg flex items-center gap-2">
              🤖 Civic AI Assistant
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div
            className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            style={{ minHeight: "300px", maxHeight: "360px" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[80%] text-sm shadow transition-all ${
                  msg.role === "user"
                    ? "ml-auto bg-indigo-600 text-white"
                    : "mr-auto bg-gray-800/80 text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Input */}
          <DialogFooter className="flex gap-2 items-center border-t border-white/10 pt-2 bg-neutral-900/90">
          <Input
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1 bg-gray-800 text-white border border-gray-700 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-blue-500"
            style={{ backgroundColor: "#1f2937", color: "#fff" }} // Inline fallback
            />



            {/* Send button (was mic #1) */}
<Button
  size="icon"
  className="bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200"
  onClick={() => sendMessage()}
  aria-label="Send message"
  disabled={!input.trim()}
>
  <Send className="w-5 h-5 text-white" />
</Button>

{/* Voice mic (mic #2 stays as recorder toggle) */}
{recognition && (
  <Button
    size="icon"
    className={`transition-colors duration-200 ${
      listening ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
    }`}
    onClick={handleMicClick}
    aria-label={listening ? "Stop recording" : "Start recording"}
  >
    <Mic className="w-5 h-5 text-white" />
  </Button>
)}

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingChatbotModal;
