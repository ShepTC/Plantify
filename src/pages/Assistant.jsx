import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/entities/User';
import { Plant } from '@/entities/Plant';
import { UserPlant } from '@/entities/UserPlant';
import { ChatHistory } from '@/entities/ChatHistory';
import { InvokeLLM, UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bot,
  Send,
  User as UserIcon,
  Loader2,
  Sparkles,
  ArrowLeft,
  Paperclip,
  X,
  Menu,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeft } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PlantCard from '../components/library/PlantCard';
import MiniPlantCard from '../components/assistant/MiniPlantCard';
import PlantDetailView from '../components/library/PlantDetailView';
import LoginPrompt from '../components/auth/LoginPrompt';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger } from
"@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { createPageUrl } from '@/components/utils';


const GREEN_BOT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/374d491f7_Newlogogreen.png";
const SUNSET_BOT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/7ced5ca45_ChatLogoSunset.png";
const PASTEL_BOT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/10aed8d4c_ChatPastelLogo.png";
const OCEAN_BOT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68941e9da4c1421699b441d7/459893860_OceanChatLogo.png";

export default function Assistant() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [colorPalette, setColorPalette] = useState('default');
  const [userPlants, setUserPlants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const scrollAreaRef = useRef(null);
  const mobileInputRef = useRef(null);
  const desktopInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedPlantDetail, setSelectedPlantDetail] = useState(null);

  // New state variables for chat management
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [contextPlant, setContextPlant] = useState(null);


  useEffect(() => {
    const initializeAssistant = async () => {
      await loadUserData();
      
      // Get color palette from document
      const palette = document.documentElement.getAttribute('data-palette') || 'default';
      setColorPalette(palette);

      // Check for highlighted plant ID in URL
      const urlParams = new URLSearchParams(window.location.search);
      const highlightPlantId = urlParams.get('highlightPlantId');
      if (highlightPlantId) {
        await loadPlantContext(highlightPlantId);
        // Clear the URL parameter after loading
        window.history.replaceState({}, '', createPageUrl('Assistant'));
      }
    };

    initializeAssistant();
  }, []);

  const loadPlantContext = async (plantId) => {
    try {
      const allPlants = await Plant.list();
      const plant = allPlants.find(p => p.id === plantId);
      if (plant) {
        setContextPlant(plant);
        // Always create a brand new chat with this plant as context
        await createNewChatWithPlant(plant);
      }
    } catch (error) {
      console.error('Error loading plant context:', error);
    }
  };

  const createNewChatWithPlant = async (plant) => {
    const welcomeMessage = {
      id: 1,
      type: 'assistant',
      content: `I'm ready to help you with **${plant.name}**! Ask me anything about growing, caring for, or harvesting this plant.`,
      timestamp: new Date().toISOString(),
      suggestedPlantIds: []
    };

    const savedChat = await ChatHistory.create({
      title: `${plant.name} Chat`,
      messages: [welcomeMessage]
    });

    const newChat = {
      id: savedChat.id,
      title: savedChat.title,
      messages: [{
        ...welcomeMessage,
        timestamp: new Date(welcomeMessage.timestamp),
        suggestedPlants: []
      }],
      createdAt: new Date(savedChat.created_date),
      contextPlantId: plant.id
    };

    // Add to beginning of chat history
    setChatHistory((prev) => [newChat, ...prev]);
    setCurrentChatId(savedChat.id);
    setMessages(newChat.messages);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [messages]);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      const plants = await UserPlant.filter({ created_by: currentUser.email });
      setUserPlants(plants);

      // Load saved chat history from database
      const savedChats = await ChatHistory.filter({ created_by: currentUser.email }, '-created_date');

      if (savedChats.length > 0) {
        // Get all plants for matching IDs
        const allPlants = await Plant.list();

        // Convert saved chats to local format
        const formattedChats = savedChats.map((chat) => ({
          id: chat.id,
          title: chat.title,
          messages: chat.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            suggestedPlants: msg.suggestedPlantIds ?
            msg.suggestedPlantIds.
            map((id) => allPlants.find((p) => p.id === id)).
            filter(Boolean) :
            []
          })),
          createdAt: new Date(chat.created_date)
        }));
        setChatHistory(formattedChats);
        setCurrentChatId(formattedChats[0].id);
        setMessages(formattedChats[0].messages);
      } else {
        // Create initial chat if none exists
        const welcomeMessage = {
          id: 1,
          type: 'assistant',
          content: `Hello ${currentUser.full_name?.split(' ')[0] || 'there'}! I'm your AI Garden Assistant. I can help with plant care, pest ID, and more. Upload an image or ask me a question!`,
          timestamp: new Date().toISOString(),
          suggestedPlantIds: []
        };

        const newChat = await ChatHistory.create({
          title: 'Garden Assistant Chat',
          messages: [welcomeMessage]
        });

        const defaultChat = {
          id: newChat.id,
          title: newChat.title,
          messages: [{
            ...welcomeMessage,
            timestamp: new Date(welcomeMessage.timestamp),
            suggestedPlants: []
          }],
          createdAt: new Date(newChat.created_date)
        };

        setChatHistory([defaultChat]);
        setCurrentChatId(newChat.id);
        setMessages(defaultChat.messages);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  };

  const createNewChat = async () => {
    const welcomeMessage = {
      id: 1,
      type: 'assistant',
      content: `Hello! I'm your AI Garden Assistant. How can I help you with your garden today?`,
      timestamp: new Date().toISOString(),
      suggestedPlantIds: []
    };

    const savedChat = await ChatHistory.create({
      title: 'New Chat',
      messages: [welcomeMessage]
    });

    const newChat = {
      id: savedChat.id,
      title: savedChat.title,
      messages: [{
        ...welcomeMessage,
        timestamp: new Date(welcomeMessage.timestamp),
        suggestedPlants: []
      }],
      createdAt: new Date(savedChat.created_date)
    };

    setChatHistory((prev) => [newChat, ...prev]);
    setCurrentChatId(savedChat.id);
    setMessages(newChat.messages);
    setIsMenuOpen(false);
  };

  const switchToChat = (chatId) => {
    const chat = chatHistory.find((c) => c.id === chatId);
    if (chat) {
      setCurrentChatId(chatId);
      setMessages(chat.messages);
      setIsMenuOpen(false); // Close the sheet after switching chat
    }
  };

  const updateCurrentChat = async (newMessages) => {
    const newTitle = newMessages.length > 1 ? generateChatTitle(newMessages[1].content) : 'New Chat';

    // Update local state
    setChatHistory((prev) => prev.map((chat) =>
    chat.id === currentChatId ?
    { ...chat, messages: newMessages, title: newTitle } :
    chat
    ));

    // Save to database (convert messages to storable format)
    const messagesToSave = newMessages.map((msg) => ({
      id: msg.id,
      type: msg.type,
      content: msg.content,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      imageUrl: msg.imageUrl || null,
      suggestedPlantIds: msg.suggestedPlants?.map((p) => p.id) || []
    }));

    await ChatHistory.update(currentChatId, {
      title: newTitle,
      messages: messagesToSave
    });
  };

  const generateChatTitle = (firstUserMessage) => {
    // Use the first user message (which is at index 1 if index 0 is assistant's initial message)
    const content = firstUserMessage || 'New Chat';
    return content.length > 30 ?
    content.substring(0, 30) + '...' :
    content;
  };


  const buildUserContext = () => {
    let context = `You are an expert gardening assistant. Here's information about the user:\n\n`;
    context += `- User's name: ${user?.full_name || 'Unknown'}\n`;
    if (user?.location?.city) {
      context += `- Location: ${user.location.city}${
      user.location.state ? `, ${user.location.state}` : ''}${
      user.location.country ? `, ${user.location.country}` : ''}\n`;
    }
    if (user?.growing_zone)
    context += `- USDA Hardiness Zone: ${user.growing_zone}\n`;
    if (user?.experience_level)
    context += `- Experience level: ${user.experience_level}\n`;
    if (user?.garden_size)
    context += `- Garden size: ${user.garden_size}\n`;
    if (user?.garden_goals)
    context += `- Garden goals: "${user.garden_goals}"\n`;
    if (user?.favorite_plants?.length > 0)
    context += `- Favorite plants: ${user.favorite_plants.join(', ')}\n`;
    if (userPlants.length > 0) {
      context += `\n- Plants currently in their garden:\n`;
      userPlants.forEach((plant) => {
        context += `• ${plant.plant_name} (Status: ${plant.status}`;
        if (plant.actual_planting_date)
        context += `, planted: ${plant.actual_planting_date}`;
        context += `)\n`;
      });
    } else {
      context += `\n- The user doesn't have any plants in their garden yet.\n`;
    }
    
    // Add context plant information if available
    if (contextPlant) {
      context += `\n**IMPORTANT CONTEXT**: The user is specifically asking about ${contextPlant.name}.\n`;
      context += `Here's detailed information about this plant:\n`;
      context += `- Category: ${contextPlant.category}\n`;
      context += `- Type: ${contextPlant.plant_type}\n`;
      if (contextPlant.botanical_name) context += `- Botanical name: ${contextPlant.botanical_name}\n`;
      if (contextPlant.days_to_maturity) context += `- Days to maturity: ${contextPlant.days_to_maturity}\n`;
      if (contextPlant.sun_requirements) context += `- Sun requirements: ${contextPlant.sun_requirements}\n`;
      if (contextPlant.water_needs) context += `- Water needs: ${contextPlant.water_needs}\n`;
      if (contextPlant.spacing) context += `- Spacing: ${contextPlant.spacing}\n`;
      if (contextPlant.planting_depth) context += `- Planting depth: ${contextPlant.planting_depth}\n`;
      if (contextPlant.growing_tips) context += `- Growing tips: ${contextPlant.growing_tips}\n`;
      if (contextPlant.companion_plants?.length > 0) {
        context += `- Companion plants: ${contextPlant.companion_plants.join(', ')}\n`;
      }
      context += `\nFocus your responses on this specific plant unless the user asks about something else.\n`;
    }
    
    context += `\n`;
    return context;
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !imageFile || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      imageUrl: imagePreview
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    updateCurrentChat(newMessages);

    setInputMessage('');
    const fileToUpload = imageFile;
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileInputRef.current) mobileInputRef.current.style.height = 'auto';
    if (desktopInputRef.current)
    desktopInputRef.current.style.height = 'auto';

    setIsLoading(true);

    try {
      let uploadedFileUrl = null;
      if (fileToUpload) {
        const { file_url } = await UploadFile({ file: fileToUpload });
        uploadedFileUrl = file_url;
      }

      const context = buildUserContext();
      let prompt = `User's query: "${
      inputMessage || 'Please analyze the image.'}"`;

      if (uploadedFileUrl) {
        prompt = `Based on the attached image and the user's garden context, respond to the following query: "${
        inputMessage || 'Please analyze this image and tell me what you see.'}"`;

      }

      const fullPrompt = `${context}\n${prompt}\n\nYou're a knowledgeable, friendly gardening expert having a natural conversation. Be warm, personal, and genuinely helpful—not robotic or formulaic. Speak like you're texting a friend who happens to know a lot about plants. Keep responses concise (2-4 sentences typically) unless more detail is specifically requested. Vary your phrasing and personality—don't sound copy-paste. If they greet you, be casual back. If they ask about non-gardening topics, acknowledge it naturally and gently redirect. Share practical, actionable advice based on their specific context (zone, location, experience level). When you mention specific plants in your response, include them in the 'suggested_plants' array so users can explore them further.`;

      const llmParams = {
        prompt: fullPrompt,
        response_json_schema: {
          type: 'object',
          properties: {
            response: { type: 'string' },
            suggested_plants: {
              type: 'array',
              items: { type: 'string' }
            }
          },
          required: ['response', 'suggested_plants']
        }
      };

      if (uploadedFileUrl) {
        llmParams.file_urls = [uploadedFileUrl];
      }

      const response = await InvokeLLM(llmParams);

      let plantCards = [];
      if (response.suggested_plants?.length > 0) {
        const allPlants = await Plant.list();
        response.suggested_plants.forEach((suggestedName) => {
          if (!suggestedName || !suggestedName.trim()) return;

          const normalizedSuggested = suggestedName.toLowerCase().trim();

          // Exact match first
          let matchedPlant = allPlants.find(
            (p) => p.name.toLowerCase().trim() === normalizedSuggested ||
            p.common_name?.toLowerCase().trim() === normalizedSuggested
          );

          // Try common_name field
          if (!matchedPlant) {
            matchedPlant = allPlants.find(
              (p) => p.common_name?.toLowerCase().includes(normalizedSuggested)
            );
          }

          // Try partial match on name
          if (!matchedPlant) {
            matchedPlant = allPlants.find(
              (p) => p.name.toLowerCase().includes(normalizedSuggested) ||
              normalizedSuggested.includes(p.name.toLowerCase())
            );
          }

          // Try with cleanup (remove descriptors)
          if (!matchedPlant) {
            const cleanSuggested = normalizedSuggested.
            replace(/\b(plant|herb|flower|vegetable|fruit|seeds?|seedling|variety)\b/gi, '').
            trim();

            if (cleanSuggested) {
              matchedPlant = allPlants.find((p) => {
                const cleanName = p.name.toLowerCase().
                replace(/\b(plant|herb|flower|vegetable|fruit|seeds?|seedling|variety)\b/gi, '').
                trim();
                return cleanName === cleanSuggested ||
                cleanName.includes(cleanSuggested) ||
                cleanSuggested.includes(cleanName);
              });
            }
          }

          if (matchedPlant && !plantCards.find((p) => p.id === matchedPlant.id)) {
            plantCards.push(matchedPlant);
          }
        });
      }

      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
        suggestedPlants: plantCards.slice(0, 4)
      };
      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      updateCurrentChat(finalMessages);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'm sorry, I seem to be having trouble connecting to my knowledge base. Please try again in a moment.",
        timestamp: new Date(),
        suggestedPlants: []
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      updateCurrentChat(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlant = async (plant) => {
    try {
      const newUserPlant = await UserPlant.create({
        plant_id: plant.id,
        plant_name: plant.name,
        status: 'planned'
      });
      setUserPlants((prev) => [...prev, newUserPlant]);
    } catch (error) {
      console.error('Error adding plant to garden:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const userPlantIds = new Set(userPlants.map((p) => p.plant_id));

  const getBotLogo = () => {
    if (colorPalette === 'sunset') return SUNSET_BOT_LOGO;
    if (colorPalette === 'pastel') return PASTEL_BOT_LOGO;
    if (colorPalette === 'ocean') return OCEAN_BOT_LOGO;
    return GREEN_BOT_LOGO;
  };

  if (isInitializing)
  return (
    <div className="min-h-screen bg-background p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-4 animate-pulse">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading your garden assistant...</p>
        </div>
      </div>);


  if (!user) return <LoginPrompt />;

  const handleInputResize = (ref) => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = ref.current.scrollHeight + 'px';
  };

  const currentChat = chatHistory.find((chat) => chat.id === currentChatId);

  return (
    <>
      {/* Mobile View */}
      <div className="block md:hidden h-screen w-full flex flex-col bg-background relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-card/98 backdrop-blur-xl border-b border-border/50 shadow-sm flex-shrink-0">
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="flex items-center justify-center h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 flex-1 justify-center">
            {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
            <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                <img src={getBotLogo()} alt="Garden Helper" className="w-full h-full object-cover" />
              </div> :

            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            }
            <span className="text-base font-semibold text-foreground">Garden Helper</span>
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-orange-900/40 border border-purple-400 dark:border-purple-700 rounded-full px-2.5 py-0.5 shadow-[0_0_12px_rgba(168,85,247,0.4)] dark:shadow-[0_0_12px_rgba(168,85,247,0.4)]">
              <Sparkles className="w-3 h-3 text-white" />
              <span className="text-[10px] font-bold text-white">Pro</span>
            </div>
          </div>

          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <button className="flex items-center justify-center h-11 w-11 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-200">
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-card border-border">
              <SheetHeader className="border-b border-border pb-4">
                <SheetTitle className="text-foreground text-left">Chat History</SheetTitle>
                <Button
                  onClick={createNewChat}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {chatHistory.map((chat) =>
                <Button
                  key={chat.id}
                  variant={currentChatId === chat.id ? "secondary" : "ghost"}
                  className="w-full text-left justify-start text-foreground hover:bg-muted rounded-xl"
                  onClick={() => switchToChat(chat.id)}>
                    <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{chat.title}</span>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="pt-1 pb-4 pl-2 space-y-4">
            {/* Context Plant Card - Mobile */}
            {contextPlant && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-2 mb-4 mt-2"
              >
                <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-400/10 border-2 border-purple-400/50 dark:border-purple-600/50 rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center shadow-md">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">Chatting about:</p>
                      <p className="text-sm font-bold text-foreground">{contextPlant.name}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All responses will focus on this plant. Ask me anything!
                  </p>
                </div>
              </motion.div>
            )}
            <AnimatePresence>
              {messages.map((message) =>
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full">

                  <div className="py-2 flex items-start gap-2 max-w-[95%]">






                    <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden ${
                    message.type === 'user' ?
                    'bg-gradient-to-br from-primary to-secondary shadow-md' :
                    colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ? '' : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'}`
                    }>

                      {message.type === 'user' ?
                    user?.profile_picture ?
                    <img
                      src={user.profile_picture}
                      alt="User"
                      className="w-full h-full object-cover" /> :


                    <UserIcon className="w-4 h-4 text-primary-foreground" /> :

                    colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
                    <img src={getBotLogo()} alt="Bot" className="w-full h-full object-cover" /> :
                    <Bot className="w-4 h-4 text-white" />
                    }
                    </div>
                    <div
                    className={`rounded-xl px-3.5 py-2.5 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${
                    message.type === 'user' ?
                    'bg-primary/20 border border-primary/30 text-foreground' :
                    'bg-muted border border-border text-foreground'}`
                    }>

                      {message.imageUrl &&
                    <img
                      src={message.imageUrl}
                      alt="User upload"
                      className="rounded-lg mb-2 max-h-48 w-full object-cover" />

                    }
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                  {message.suggestedPlants?.length > 0 &&
                <div className="mt-3 px-2 w-full flex flex-col items-center">
                      <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Plants I recommend:
                      </p>
                      <div className="grid grid-cols-2 gap-2 justify-center">
                        {message.suggestedPlants.map((plant) =>
                    <div key={plant.id} className="drop-shadow-[0_0_8px_rgba(168,85,247,0.3)] dark:drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                      <MiniPlantCard
                        plant={plant}
                        onAddPlant={handleAddPlant}
                        isAdded={userPlantIds.has(plant.id)}
                        onClick={() => setSelectedPlantDetail(plant)} />
                    </div>

                    )}
                      </div>
                    </div>
                }
                </motion.div>
              )}
            </AnimatePresence>
            {isLoading &&
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 max-w-[95%] mr-auto">

                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ? '' : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]'}`}>
                  {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
                <img src={getBotLogo()} alt="Bot" className="w-full h-full object-cover" /> :
                <Loader2 className="w-4 h-4 text-white animate-spin" />
                }
                </div>
                <div className="rounded-lg px-3 py-2 bg-muted border border-border shadow-[0_2px_8px_rgba(0,0,0,0.12)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
                  <p className="text-sm text-muted-foreground italic">Thinking...</p>
                </div>
              </motion.div>
            }
            {/* Starter Prompts - Mobile */}
            {messages.length === 1 && !isLoading &&
            <div className="px-2 pt-2 space-y-2">
                <p className="text-xs text-muted-foreground/70 text-center mb-2">Try asking:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                "What should I plant next?",
                "What plants is my garden missing?",
                "How do I reduce weeds?",
                "Best companion plants for tomatoes?"].
                map((prompt) =>
                <button
                  key={prompt}
                  onClick={() => {
                    setInputMessage(prompt);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                  className="px-3 py-2 text-xs bg-transparent hover:bg-muted/50 border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-colors">

                      {prompt}
                    </button>
                )}
                </div>
              </div>
            }
          </div>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/jpeg, image/png"
          className="hidden" />



        {/* Input Bar */}
        <div className="flex-shrink-0 p-3 bg-gradient-to-t from-background via-background to-transparent">
          {imagePreview &&
          <div className="relative w-fit mx-auto mb-3">
              <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 rounded-xl object-cover border border-border/50 shadow-md" />

              <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={clearImage}>

                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          }
          <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] flex items-end gap-1.5 max-w-md mx-auto p-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
              onClick={() => fileInputRef.current?.click()}>

              <Paperclip className="w-5 h-5" />
            </Button>
            <textarea
              ref={mobileInputRef}
              placeholder="Ask anything..."
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleInputResize(mobileInputRef);
              }}
              onKeyPress={handleKeyPress}
              className="flex-1 resize-none bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none text-base py-2.5 px-1 max-h-36 overflow-y-auto"
              rows={1}
              disabled={isLoading} />

            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && !imageFile || isLoading}
              className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg disabled:opacity-40 disabled:shadow-none rounded-xl transition-all duration-200">

              {isLoading ?
              <Loader2 className="w-5 h-5 animate-spin" /> :

              <Send className="w-5 h-5" />
              }
            </Button>
          </div>
        </div>
      </div>
      {/* Desktop View */}
      <div className="hidden md:flex h-screen w-full bg-background">
        {/* Desktop Sidebar */}
        <motion.div
          initial={false}
          animate={{ width: isSidebarCollapsed ? 0 : 320 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="border-r border-border bg-card flex flex-col flex-shrink-0 overflow-hidden">

          <div className="w-80 flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-3 border-b border-border/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={getBotLogo()} alt="Garden Helper" className="w-full h-full object-cover" />
                    </div> :

                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  }
                  <span className="text-sm font-medium text-foreground">Garden Helper</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(true)}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors">

                  <PanelLeftClose className="w-4 h-4" />
                </Button>
              </div>
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-muted/50 text-foreground border border-border/50 rounded-lg transition-all duration-200">
                <Plus className="w-4 h-4" />
                <span className="text-sm">New chat</span>
              </button>
            </div>
            
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {chatHistory.map((chat) =>
              <button
                key={chat.id}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group relative ${
                currentChatId === chat.id ?
                'bg-muted/80 text-foreground' :
                'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`
                }
                onClick={() => switchToChat(chat.id)}>
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-70" />
                    <span className="truncate text-sm font-normal">{chat.title}</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-h-0 bg-background relative">
          {/* Chat Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-card">
            <div className="flex items-center gap-3 max-w-4xl mx-auto">
              {isSidebarCollapsed &&
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarCollapsed(false)}
                className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg mr-1">

                  <PanelLeft className="w-5 h-5" />
                </Button>
              }
              {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden border border-border">
                  <img src={getBotLogo()} alt="Garden Helper" className="w-full h-full object-cover" />
                </div> :

              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              }
              <div>
                <h3 className="font-semibold text-foreground">AI Garden Assistant</h3>
                <p className="text-xs text-muted-foreground">Ready to help with your garden</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Context Plant Card - Desktop */}
              {contextPlant && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-400/10 border-2 border-purple-400/50 dark:border-purple-600/50 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-muted-foreground">Chatting about:</p>
                        <p className="text-lg font-bold text-foreground">{contextPlant.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      All responses will focus on this plant. Ask me anything about growing, caring for, or harvesting it!
                    </p>
                  </div>
                </motion.div>
              )}
              {messages.map((message) =>
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}>
                  <div
                  className={`flex items-start gap-4 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'}`
                  }>

                    {message.type === 'assistant' &&
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ? 'border border-border' : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'}`}>
                        {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
                    <img src={getBotLogo()} alt="Bot" className="w-full h-full object-cover" /> :
                    <Bot className="w-5 h-5 text-white" />
                    }
                      </div>
                  }
                    <div
                    className={`rounded-2xl px-4 py-3 max-w-2xl shadow-sm ${
                    message.type === 'user' ?
                    'bg-primary text-primary-foreground' :
                    'bg-muted text-foreground border border-border'}`
                    }>

                      {message.imageUrl &&
                    <img
                      src={message.imageUrl}
                      alt="User upload"
                      className="rounded-xl mb-2 max-h-64 w-full object-cover" />

                    }
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                    {message.type === 'user' &&
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary flex-shrink-0 overflow-hidden shadow-sm">
                        {user?.profile_picture ?
                    <img
                      src={user.profile_picture}
                      alt="User"
                      className="w-full h-full object-cover" /> :


                    <UserIcon className="w-5 h-5 text-primary-foreground" />
                    }
                      </div>
                  }
                  </div>
                  {message.type === 'assistant' &&
                message.suggestedPlants?.length > 0 &&
                <div className="flex justify-center">
                      <div className="mt-3">
                        <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1.5 justify-center">
                          <Sparkles className="w-4 h-4" />
                          Plants I recommend:
                        </p>
                        <div className="grid grid-cols-2 gap-3 justify-center">
                          {message.suggestedPlants.map((plant) =>
                      <div className="drop-shadow-[0_0_12px_rgba(168,85,247,0.4)] dark:drop-shadow-[0_0_16px_rgba(168,85,247,0.6)]">
                        <MiniPlantCard
                          key={plant.id}
                          plant={plant}
                          onAddPlant={handleAddPlant}
                          isAdded={userPlantIds.has(plant.id)}
                          onClick={() => setSelectedPlantDetail(plant)} />
                      </div>

                      )}
                        </div>
                      </div>
                    </div>
                }
                </motion.div>
              )}
              {isLoading &&
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 justify-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ? 'border border-border' : 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'}`}>
                    {colorPalette === 'default' || colorPalette === 'sunset' || colorPalette === 'pastel' || colorPalette === 'ocean' ?
                  <img src={getBotLogo()} alt="Bot" className="w-full h-full object-cover" /> :
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                  }
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-muted border border-border">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                </motion.div>
              }
              {/* Starter Prompts - Desktop */}
              {messages.length === 1 && !isLoading &&
              <div className="pt-8 space-y-4">
                  <p className="text-sm text-muted-foreground text-center">Try asking:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    {[
                  "What should I plant next?",
                  "What plants is my garden missing?",
                  "How do I reduce weeds?",
                  "Best companion plants for tomatoes?"].
                  map((prompt) =>
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputMessage(prompt);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="px-4 py-2.5 text-sm bg-card hover:bg-muted border border-border rounded-full text-muted-foreground hover:text-foreground transition-all shadow-sm hover:shadow">

                        {prompt}
                      </button>
                  )}
                  </div>
                </div>
              }
            </div>
          </ScrollArea>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/jpeg, image/png"
            className="hidden" />



          {/* Input Area */}
          <div className="flex-shrink-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
            <div className="max-w-4xl mx-auto">
              {imagePreview &&
              <div className="relative self-start mb-3">
                  <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-xl object-cover border border-border/50 shadow-lg" />

                  <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground hover:bg-muted"
                  onClick={clearImage}>

                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              }
              <div className="bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-end gap-2 p-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-11 w-11 flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                  onClick={() => fileInputRef.current?.click()}>

                  <Paperclip className="w-5 h-5" />
                </Button>
                <div className="flex-1 relative">
                  <textarea
                    ref={desktopInputRef}
                    placeholder="Ask anything about your garden..."
                    value={inputMessage}
                    onChange={(e) => {
                      setInputMessage(e.target.value);
                      handleInputResize(desktopInputRef);
                    }}
                    onKeyPress={handleKeyPress}
                    className="w-full resize-none bg-transparent border-none text-foreground placeholder:text-muted-foreground/60 focus:ring-0 focus:outline-none p-2.5 max-h-40 overflow-y-auto text-base"
                    rows={1}
                    disabled={isLoading} />
                  </div>

                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() && !imageFile || isLoading}
                  className="h-11 w-11 flex-shrink-0 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-xl disabled:opacity-40 disabled:shadow-none shadow-lg hover:shadow-xl transition-all duration-200">

                  {isLoading ?
                  <Loader2 className="w-5 h-5 animate-spin" /> :

                  <Send className="w-5 h-5" />
                  }
                </Button>
              </div>
            </div>
            </div>
          </div>
      </div>
      <PlantDetailView
        plant={selectedPlantDetail}
        userZone={user?.growing_zone}
        open={!!selectedPlantDetail}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedPlantDetail(null);
          }
        }}
        onAddPlant={handleAddPlant}
        isAdded={selectedPlantDetail ? userPlantIds.has(selectedPlantDetail.id) : false}
        userPlantData={null} />

    </>);

}