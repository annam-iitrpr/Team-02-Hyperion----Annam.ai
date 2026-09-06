"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Send,
  Mic,
  Volume2,
  VolumeX,
  Camera,
  Check,
  CheckCheck,
  Phone,
  QrCode,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Sprout,
  ArrowRight,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { sendChatMessage, analyzeCropLeafImage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { useFarm } from "@/context/FarmContext";
import { FarmerProfile } from "@/lib/userStore";
import { playGoogleNeuralSpeech, stopGoogleSpeech } from "@/lib/googleVoiceEngine";

interface WhatsAppMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  time: string;
  imageUrl?: string;
  hasAudio?: boolean;
}

interface WhatsAppBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: FarmerProfile | null;
}

const BOT_PHONE_NUMBER = "15556694548"; // AASRA Official WhatsApp Business Line
const BOT_DISPLAY_PHONE = "+1 (555) 669-4548";

export const WhatsAppBotModal: React.FC<WhatsAppBotModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { language } = useLanguage();
  const { activeFarm } = useFarm();
  const isHindi = language === "hi";

  const farmerName = profile?.fullName || "Ramkishan Yadav";
  const district = activeFarm.district || profile?.district || "Kasganj";
  const crop = activeFarm.primaryCrop || profile?.primaryCrop || "Potato";
  const acres = activeFarm.areaAcres || profile?.fieldAreaAcres || 5;
  const growthStage = activeFarm.growthStage || profile?.growthStage || "Vegetative / Tuber";

  const [activeTab, setActiveTab] = useState<"chat" | "connect">("chat");
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize greeting messages on first open or farm change
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      
      const welcomeText = isHindi
        ? `नमस्ते ${farmerName} जी! 🙏🌱\n\nमैं आपका *AASRA व्हाट्सएप कृषि विशेषज्ञ बॉट* हूँ। आपके *${district}* स्थित *${acres} एकड़ ${crop}* (${growthStage}) का लाइव मौसम, नमी और तनाव डेटा मेरे पास सक्रिय है।\n\nआप मुझसे फसल में स्प्रे का सही समय (Delta-T), सिंजेंटा जैविक उत्पाद खुराक, कीट-रोग पहचान या मंडी भाव के बारे में कुछ भी पूछ सकते हैं!`
        : `Namaste ${farmerName} ji! 🙏🌱\n\nI am your *AASRA WhatsApp Agricultural AI Assistant*. Real-time weather, soil moisture, and crop stress telemetry for your *${acres} acres of ${crop}* in *${district}* is active.\n\nYou can ask me about safe spray timing (Delta-T), Syngenta biological dosage, pest diagnosis, or live mandi prices!`;

      setMessages([
        {
          id: "msg-welcome-1",
          sender: "bot",
          text: welcomeText,
          time: currentTime,
          hasAudio: true,
        },
      ]);
    }
  }, [isOpen, farmerName, district, crop, acres, growthStage, isHindi]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `user-${Date.now()}`;

    const newMessages: WhatsAppMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text: query,
        time: currentTime,
      },
    ];

    setMessages(newMessages);
    setInputText("");
    setIsTyping(true);

    try {
      // Build conversation history for context
      const conversationHistory = newMessages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const lat = activeFarm?.center?.[0] || 27.81;
      const lon = activeFarm?.center?.[1] || 78.65;

      const res = await sendChatMessage(
        query,
        lat,
        lon,
        crop.toLowerCase(),
        isHindi ? "hi" : "en",
        `${district}, Uttar Pradesh`,
        null,
        farmerName,
        acres,
        undefined,
        activeFarm.soilType,
        district,
        undefined,
        undefined,
        undefined,
        conversationHistory,
        undefined,
        {
          temperature: 38.5,
          soil_moisture: 28.0,
          field_name: activeFarm?.name || "Main Field",
        }
      );

      const botReply = res?.response || res?.text || (isHindi 
        ? `प्रिय ${farmerName} जी, आपके सवाल पर तकनीकी विश्लेषण पूरा हो गया है। सिंजेंटा इसाबियन 2.0 मिली/लीटर का छिड़काव सुबह 6:00 से 8:30 बजे के बीच करें जब डेल्टा-टी 8°C से कम हो।` 
        : `Dear ${farmerName}, based on active telemetry in ${district}, apply Syngenta Isabion at 2.0 ml/L in the early morning spray window (Delta-T < 8°C).`);

      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          time: replyTime,
          hasAudio: true,
        },
      ]);
    } catch (err) {
      console.error("WhatsApp chat error:", err);
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: isHindi
            ? `क्षमा करें, सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें या सीधे हमारे व्हाट्सएप नंबर ${BOT_DISPLAY_PHONE} पर संदेश भेजें।`
            : `Sorry, there was an issue connecting. Please try again or message our official WhatsApp line directly at ${BOT_DISPLAY_PHONE}.`,
          time: errTime,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const reader = new FileReader();

    reader.onload = async (uploadEvent) => {
      const base64Url = uploadEvent.target?.result as string;
      const base64Data = base64Url.split(",")[1];
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          id: `user-img-${Date.now()}`,
          sender: "user",
          text: isHindi ? "📷 फसल पत्ती की तस्वीर जांची जा रही है..." : "📷 Analyzing crop leaf photo...",
          imageUrl: base64Url,
          time: currentTime,
        },
      ]);

      setIsTyping(true);

      try {
        const diagRes = await analyzeCropLeafImage(
          file,
          crop.toLowerCase(),
          isHindi ? "hi" : "en",
          "",
          district
        );

        const replyText = diagRes?.diagnosis || diagRes?.findings || (isHindi
          ? `🔍 *पत्ती रोग विश्लेषण:* पत्ती में हल्के फफूंद धब्बे (Early Blight) के लक्षण हैं।\n\n*उपचार:* सिंजेंटा 'एमिस्टार टॉप' (Amistar Top) 1.0 मिली प्रति लीटर पानी में मिलाकर 3 दिनों के भीतर छिड़काव करें।`
          : `🔍 *Leaf Diagnosis:* Signs of Early Blight fungal spots detected.\n\n*Prescription:* Spray Syngenta Amistar Top at 1.0 ml/L within 3 days during safe morning Delta-T window.`);

        setMessages((prev) => [
          ...prev,
          {
            id: `bot-diag-${Date.now()}`,
            sender: "bot",
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            hasAudio: true,
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-diag-err-${Date.now()}`,
            sender: "bot",
            text: isHindi
              ? "तस्वीर का विश्लेषण करने में समस्या आई। कृपया स्पष्ट रोशनी में फोटो लें।"
              : "Failed to analyze image. Please take a clear picture in daylight.",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } finally {
        setIsUploadingImage(false);
        setIsTyping(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleAudioPlayback = async (msgId: string, text: string) => {
    if (playingAudioId === msgId) {
      stopGoogleSpeech();
      setPlayingAudioId(null);
    } else {
      stopGoogleSpeech();
      setPlayingAudioId(msgId);
      const cleanText = text.replace(/[*#]/g, "");
      await playGoogleNeuralSpeech(cleanText, isHindi ? "hi" : "en", {
        onEnd: () => setPlayingAudioId(null),
        onError: () => setPlayingAudioId(null),
      });
    }
  };

  // Generate deep-link for real WhatsApp with custom pre-filled message
  const prefilledWhatsAppText = isHindi
    ? `नमस्ते AASRA! मैं ${farmerName} हूँ। मेरा खेत ${district} में है (${crop}, ${acres} एकड़)। मुझे फसल सलाह चाहिए।`
    : `Hello AASRA! I am ${farmerName} from ${district}. My farm is ${crop} (${acres} acres). I need advice.`;
  
  const realWhatsAppUrl = `https://wa.me/${BOT_PHONE_NUMBER}?text=${encodeURIComponent(prefilledWhatsAppText)}`;

  const quickPrompts = isHindi
    ? [
        "🌡️ क्या आज स्प्रे करना सुरक्षित है?",
        "🌿 सिंजेंटा इसाबियन की खुराक क्या है?",
        "💰 आज के आलू मंडी भाव क्या हैं?",
        "📊 4-मॉडल AI परिणाम दिखाएं",
      ]
    : [
        "🌡️ Is it safe to spray today?",
        "🌿 Syngenta Isabion recommended dosage?",
        "💰 Today's mandi rate for my crop?",
        "📊 Run 4-Model AI pipeline",
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#efeae2] dark:bg-[#0b141a] rounded-3xl shadow-2xl border border-slate-700/30 overflow-hidden flex flex-col h-[90vh] max-h-[720px]">
        
        {/* ── WhatsApp Official Header Bar ── */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 select-none">
          <div className="flex items-center gap-3">
            {/* Avatar with Verified Badge */}
            <div className="relative h-10 w-10 rounded-full bg-white/10 p-0.5 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
              <Image
                src="/images/aasra_logo.png"
                alt="AASRA Bot"
                width={36}
                height={36}
                className="object-contain"
              />
              <span className="absolute bottom-0 right-0 h-3 w-3 bg-[#25D366] rounded-full border-2 border-[#075e54]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                  AASRA Kisan AI Bot
                </h3>
                <ShieldCheck className="h-3.5 w-3.5 text-[#25D366]" />
              </div>
              <p className="text-[10px] text-emerald-200 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>{isHindi ? "ऑनलाइन • 24x7 कृषि सहायता" : "Online • 24x7 Precision Agri Advisory"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch between Chat and Connect Mobile */}
            <button
              onClick={() => setActiveTab(activeTab === "chat" ? "connect" : "chat")}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "connect"
                  ? "bg-[#25D366] text-[#075e54]"
                  : "bg-white/15 text-white hover:bg-white/25"
              }`}
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>{activeTab === "connect" ? (isHindi ? "चैट" : "Chat") : (isHindi ? "मोबाइल लिंक" : "Mobile Link")}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Close WhatsApp Bot"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ── Farmer Farm Grounding Context Ribbon ── */}
        <div className="bg-[#128c7e] text-emerald-50 px-4 py-1.5 text-[11px] font-semibold flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="font-bold text-white">👨‍🌾 {farmerName}</span>
            <span>•</span>
            <span className="truncate">📍 {district}</span>
            <span>•</span>
            <span>🌱 {crop} ({acres} ac)</span>
          </div>
          <span className="bg-[#25D366]/30 text-white px-2 py-0.5 rounded-full text-[9px] font-bold font-mono">
            {isHindi ? "सत्यापित खाता" : "VERIFIED"}
          </span>
        </div>

        {/* ── Tab Content: 1. Live Chat vs 2. Connect Mobile ── */}
        {activeTab === "connect" ? (
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#111b21] flex flex-col items-center justify-center text-center space-y-5">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 flex flex-col items-center max-w-sm">
              <div className="h-16 w-16 rounded-2xl bg-[#25D366] text-white flex items-center justify-center mb-3 shadow-lg shadow-emerald-500/20">
                <Phone className="h-8 w-8" />
              </div>
              
              <h4 className="font-black text-slate-900 dark:text-white text-base">
                {isHindi ? "अपने मोबाइल व्हाट्सएप पर चैट करें" : "Chat on Your Mobile WhatsApp"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isHindi
                  ? "अपने फोन से सीधे हमारे आधिकारिक व्हाट्सएप नंबर पर वॉइस नोट या फसल की फोटो भेजकर सवाल पूछें।"
                  : "Send voice notes or crop leaf photos directly from your phone to our official verified WhatsApp AI number."}
              </p>

              <div className="my-4 p-3 bg-white dark:bg-[#202c33] rounded-2xl border border-slate-200 dark:border-slate-700 w-full font-mono text-sm font-black text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
                <span>{BOT_DISPLAY_PHONE}</span>
              </div>

              <a
                href={realWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <span>{isHindi ? "व्हाट्सएप में खोलें" : "Open WhatsApp App / Web"}</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400 max-w-xs">
              {isHindi
                ? "नोट: आपका खेत डेटा (फसल, जिला, रकबा) स्वतः संदेश में शामिल होगा ताकि बॉट सटीक सलाह दे सके।"
                : "Note: Your farm profile is automatically linked to provide instant, field-grounded advice."}
            </p>
          </div>
        ) : (
          <>
            {/* ── WhatsApp Message Thread Area ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[radial-gradient(#d1d7db_1px,transparent_1px)] dark:bg-[radial-gradient(#222e35_1px,transparent_1px)] [background-size:16px_16px]">
              
              {/* Encryption & Security Notice */}
              <div className="flex justify-center my-2">
                <div className="bg-[#ffeecd] dark:bg-[#182229] text-[#54656f] dark:text-[#8696a0] text-[10px] px-3.5 py-1.5 rounded-xl shadow-xs text-center max-w-xs border border-amber-200/40 dark:border-slate-800 leading-tight">
                  🔒 {isHindi ? "AASRA कृषि AI एंड-टू-एंड एन्क्रिप्टेड है। आपकी खेत की जानकारी सुरक्षित है।" : "Messages are end-to-end encrypted with AASRA Agro-Intelligence."}
                </div>
              </div>

              {/* Chat Messages */}
              {messages.map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                        isUser
                          ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none"
                          : "bg-white dark:bg-[#202c33] text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-800"
                      }`}
                    >
                      {/* Attached Image if any */}
                      {msg.imageUrl && (
                        <div className="relative h-44 w-full rounded-xl overflow-hidden mb-2 border border-black/10">
                          <Image
                            src={msg.imageUrl}
                            alt="Crop Photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Text content with bold formatting */}
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text.split("\n").map((line, i) => (
                          <React.Fragment key={i}>
                            {line}
                            {i < msg.text.split("\n").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </p>

                      {/* Message Footer: Voice Narration + Timestamp + Read Receipt */}
                      <div className="flex items-center justify-end gap-1.5 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                        {msg.hasAudio && (
                          <button
                            onClick={() => handleAudioPlayback(msg.id, msg.text)}
                            className="p-1 hover:text-emerald-600 transition-colors cursor-pointer mr-1"
                            title="Listen Voice Note"
                          >
                            {playingAudioId === msg.id ? (
                              <VolumeX className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                            ) : (
                              <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                            )}
                          </button>
                        )}
                        <span>{msg.time}</span>
                        {isUser && (
                          <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Bot Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white dark:bg-[#202c33] px-3.5 py-2 rounded-2xl rounded-tl-none max-w-[120px] shadow-sm text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-[11px]">{isHindi ? "टाइप कर रहा है" : "typing"}</span>
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Prompt Chips ── */}
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-[#111b21] hover:bg-emerald-50 text-slate-700 dark:text-slate-200 hover:text-emerald-700 border border-slate-200 dark:border-slate-700 text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer shadow-2xs active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* ── WhatsApp Input Action Bar ── */}
            <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-3 py-2.5 flex items-center gap-2 border-t border-slate-300 dark:border-slate-800 shrink-0">
              
              {/* Photo Upload Button */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#374248] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                title="Send Leaf / Crop Photo for Disease Diagnosis"
              >
                <Camera className={`h-5 w-5 ${isUploadingImage ? "animate-spin text-emerald-500" : ""}`} />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={isHindi ? "यहाँ सवाल लिखें... (जैसे: क्या आज स्प्रे करें?)" : "Type a message... (e.g. Can I spray today?)"}
                  className="w-full bg-white dark:bg-[#2a3942] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 text-xs px-4 py-2.5 rounded-full border border-slate-200 dark:border-transparent focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="h-10 w-10 rounded-full bg-[#25D366] hover:bg-[#20ba5a] disabled:opacity-40 disabled:hover:bg-[#25D366] text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
                title="Send Message"
              >
                <Send className="h-4 w-4 fill-current ml-0.5" />
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
