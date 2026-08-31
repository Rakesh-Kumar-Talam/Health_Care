import React, { useState } from "react";
import { Appointment } from "../../types";
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  MessageSquare,
  ShieldCheck,
  Stethoscope,
  Send,
} from "lucide-react";

interface VideoCallModalProps {
  appointment: Appointment;
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({ appointment, onClose }) => {
  const [micOn, setMicOn] = useState<boolean>(true);
  const [videoOn, setVideoOn] = useState<boolean>(true);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: appointment.doctorName,
      text: "Hello! Welcome to our telehealth consultation room. How are you feeling today?",
      time: "Just now",
    },
  ]);
  const [inputMsg, setInputMsg] = useState("");

  const handleSendMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: inputMsg.trim(),
        time: "Just now",
      },
    ]);
    setInputMsg("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: appointment.doctorName,
          text: "Thank you for the update. I have reviewed your preliminary notes and symptoms.",
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full h-[85vh] shadow-2xl border border-slate-800 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <div className="text-white font-bold text-sm flex items-center gap-2">
                <span>{appointment.doctorName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                  {appointment.doctorSpecialty}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Encrypted Telehealth Call • Room #{appointment.videoRoomId || "CURA-992"}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HIPAA Encrypted</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Area + Chat */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Main Doctor Video Frame */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1200&auto=format&fit=crop&q=80"
              alt="Doctor live feed"
              className="w-full h-full object-cover opacity-90"
            />

            {/* Doctor Name Overlay */}
            <div className="absolute bottom-6 left-6 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-white text-xs font-semibold flex items-center gap-2">
              <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
              <span>{appointment.doctorName} (HD)</span>
            </div>

            {/* Self Video PIP */}
            <div className="absolute top-6 right-6 w-36 sm:w-48 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-teal-500/80 bg-slate-800">
              {videoOn ? (
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                  alt="Patient feed"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-bold">
                  Camera Off
                </div>
              )}
              <div className="absolute bottom-1.5 left-2 text-[10px] text-white/90 font-medium bg-black/60 px-1.5 rounded">
                You
              </div>
            </div>
          </div>

          {/* Sidebar Live Consultation Chat */}
          {chatOpen && (
            <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
              <div className="p-3.5 border-b border-slate-800 text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Consultation Notes & Chat</span>
                <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.sender === "You" ? "items-end" : "items-start"}`}
                  >
                    <div className="text-[10px] text-slate-400 mb-1">{m.sender}</div>
                    <div
                      className={`text-xs p-2.5 rounded-xl max-w-[90%] leading-relaxed ${
                        m.sender === "You"
                          ? "bg-teal-600 text-white rounded-br-none"
                          : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMsg} className="p-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Type message to doctor..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-500 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Bottom Call Control Bar */}
        <div className="px-6 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-center space-x-4">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`p-3.5 rounded-2xl transition-colors ${
              micOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
            title={micOn ? "Mute Microphone" : "Unmute Microphone"}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`p-3.5 rounded-2xl transition-colors ${
              videoOn ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-red-500/20 text-red-400 border border-red-500/50"
            }`}
            title={videoOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setChatOpen(!chatOpen)}
            className={`p-3.5 rounded-2xl transition-colors ${
              chatOpen ? "bg-teal-600 text-white" : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
            title="Toggle Live Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-3.5 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
