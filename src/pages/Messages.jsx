import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, User, Clock, Search, Check, 
  CheckCheck, MoreVertical, Paperclip, Image, Inbox,
  ShieldCheck, Activity, RefreshCw, ChevronLeft, Trash2, FileText,
  AlertTriangle, X as CloseIcon
} from 'lucide-react';
import { messageService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import useRBAC from '../hooks/useRBAC';  // ← RBAC
import toast from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const { can } = useRBAC();  // ← RBAC
  const { socket, unreadMessages, clearUnread } = useSocket();

  // Helper for standardized ID extraction
  const getCleanId = (entity) => {
    if (!entity) return null;
    const rawId = entity?._id || entity?.id || (typeof entity === 'string' ? entity : null);
    return rawId ? String(rawId).trim() : null;
  };

  const currentUserId = getCleanId(user);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState(null); // 'message' or 'conversation'
  const [targetId, setTargetId] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [reply, setReply] = useState('');

  const getIsMe = (msg) => {
    return getCleanId(msg?.sender) === currentUserId;
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (socket) {
        const handleNewMessage = (newMsg) => {
            const senderId = getCleanId(newMsg.sender);
            const receiverId = getCleanId(newMsg.receiver);
            
            if (!senderId || !receiverId || !currentUserId) return;
            
            const isMe = senderId === currentUserId;
            
            // Attach isMe property locally for correct alignment
            const messageWithMe = { ...newMsg, isMe };
            
            const partnerId = isMe ? receiverId : senderId;
            const partnerData = isMe ? newMsg.receiver : newMsg.sender;

            setConversations(prev => {
                const updated = [...prev];
                const idx = updated.findIndex(c => getCleanId(c.partner) === partnerId);
                
                if (idx !== -1) {
                    // Prevent duplicates
                    if (updated[idx].messages.some(m => m._id === newMsg._id)) return prev;

                    updated[idx] = {
                        ...updated[idx],
                        lastMessage: messageWithMe,
                        messages: [...updated[idx].messages, messageWithMe]
                    };
                    const [moved] = updated.splice(idx, 1);
                    updated.unshift(moved);
                } else {
                    // Create new conversation entry if it doesn't exist
                    updated.unshift({
                        partner: partnerData,
                        lastMessage: messageWithMe,
                        messages: [messageWithMe]
                    });
                }
                return updated;
            });

            if (selectedConv && getCleanId(selectedConv.partner) === partnerId) {
                setSelectedConv(prev => {
                    if (prev && prev.messages.some(m => m._id === newMsg._id)) return prev;
                    return {
                        ...prev,
                        lastMessage: messageWithMe,
                        messages: [...(prev?.messages || []), messageWithMe]
                    };
                });
                clearUnread(partnerId);
            }
        };

        const handleReadStatus = ({ readerId, partnerId }) => {
            // If the person we are chatting with read our messages
            if (selectedConv && (selectedConv.partner._id || selectedConv.partner) === readerId) {
                setSelectedConv(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        messages: prev.messages.map(m => ({ ...m, isRead: true }))
                    };
                });
            }
        };

        const handleMessageDeleted = (deletedId) => {
            setConversations(prev => prev.map(conv => ({
                ...conv,
                messages: conv.messages.filter(m => m._id !== deletedId)
            })).filter(conv => conv.messages.length > 0 || conv.lastMessage._id !== deletedId));

            if (selectedConv) {
                setSelectedConv(prev => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        messages: prev.messages.filter(m => m._id !== deletedId)
                    };
                });
            }
        };

        const handleConversationDeleted = (partnerId) => {
            setConversations(prev => prev.filter(c => (c.partner?._id || c.partner) !== partnerId));
            if (selectedConv && (selectedConv.partner?._id || selectedConv.partner) === partnerId) {
                setSelectedConv(null);
                toast.success('Conversation has been remote-purged');
            }
        };

        socket.on('new_message', handleNewMessage);
        socket.on('messages_read', handleReadStatus);
        socket.on('message_deleted', handleMessageDeleted);
        socket.on('conversation_deleted', handleConversationDeleted);
        
        return () => {
            socket.off('new_message', handleNewMessage);
            socket.off('messages_read', handleReadStatus);
            socket.off('message_deleted', handleMessageDeleted);
            socket.off('conversation_deleted', handleConversationDeleted);
        };
    }
  }, [socket, selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConv, selectedConv?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteMessage = (msgId) => {
    setDeleteType('message');
    setTargetId(msgId);
    setShowDeleteModal(true);
  };

  const handleDeleteConversation = () => {
    if (!selectedConv) return;
    setDeleteType('conversation');
    setShowDeleteModal(true);
  };

  const proceedDelete = async () => {
    try {
      if (deleteType === 'message') {
        await messageService.deleteMessage(targetId);
        toast.success('Record purged successfully');
      } else {
        await messageService.deleteConversation(selectedConv.partner._id);
        toast.success('Clinical history purged');
      }
    } catch (err) {
      toast.error('System failure during purge protocol');
    } finally {
      setShowDeleteModal(false);
      setTargetId(null);
      setDeleteType(null);
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await messageService.getMessages();
      const allMsgs = res.data.data;
      
      const messagesWithMe = allMsgs.map(m => {
        const senderId = getCleanId(m.sender);
        return { ...m, isMe: senderId === currentUserId };
      });

      setMessages(messagesWithMe);
      groupMessagesIntoConversations(messagesWithMe);
    } catch (err) {
      toast.error('Clinical records sync failure');
    } finally {
      setLoading(false);
    }
  };

  const groupMessagesIntoConversations = (allMsgs) => {
    if (!currentUserId) return;
    const convMap = new Map();

    allMsgs.forEach(msg => {
      const senderId = getCleanId(msg.sender);
      const receiverId = getCleanId(msg.receiver);
      if (!senderId || !receiverId) return;

      const isSenderMe = senderId === currentUserId;
      const partner = isSenderMe ? msg.receiver : msg.sender;
      const partnerId = getCleanId(partner);

      if (!partnerId || partnerId === currentUserId) return;
      
      if (!convMap.has(partnerId)) {
        convMap.set(partnerId, {
          partner,
          lastMessage: msg,
          messages: []
        });
      }
      convMap.get(partnerId).messages.push(msg);
    });

    const sortedConvs = Array.from(convMap.values()).sort((a, b) => 
      new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt)
    );

    setConversations(sortedConvs);
  };

  const handleSendReply = async (e, file = null) => {
    if (e) e.preventDefault();
    if ((!reply.trim() && !file) || !selectedConv || isSending) return;

    setIsSending(true);
    
    // CASE A: File Attachment (Must use API for reliable clinical upload)
    if (file) {
      const formData = new FormData();
      formData.append('receiver', selectedConv.partner?._id || selectedConv.partner);
      formData.append('attachment', file);
      if (reply.trim()) formData.append('content', reply);

      try {
        const res = await messageService.sendMessage(formData);
        const newMsg = { ...res.data.data, isMe: true };
        
        setSelectedConv(prev => {
           if (!prev || prev.messages.some(m => m._id === newMsg._id)) return prev;
           return { ...prev, lastMessage: newMsg, messages: [...prev.messages, newMsg] };
        });
        setReply('');
      } catch (err) {
        toast.error('Clinical upload protocol failed');
      } finally {
        setIsSending(false);
      }
      return;
    }

    // CASE B: Plain Text (Use Socket for instant transmission per your code)
    if (reply.trim()) {
      socket.emit('sendMessage', {
        senderId: currentUserId,
        receiverId: getCleanId(selectedConv.partner),
        content: reply
      });
      setReply('');
      setIsSending(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleSendReply(null, file);
      e.target.value = ''; // Reset input
    }
  };


  const filteredConversations = conversations.filter(conv => 
    conv.partner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentMessages = selectedConv 
    ? [...selectedConv.messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  const handleSelectConv = (conv) => {
    setSelectedConv(conv);
    clearUnread(conv.partner?._id || conv.partner);
  };

  return (
    <div className="h-[calc(100vh-160px)] flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
      {/* Sidebar: Conversation List */}
      <div className={`flex-none w-full md:w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-slate-50 space-y-4">
           <div className="flex items-center justify-between">
              <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Clinical <span className="text-slate-300 font-thin italic text-sm">(Chat)</span></h1>
              <button onClick={fetchMessages} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:rotate-180 duration-500">
                <RefreshCw className="w-4 h-4" />
              </button>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search specialists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-slate-200 outline-none text-xs font-bold transition-all"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {loading ? (
            [1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map(conv => (
              <button
                key={conv.partner._id || conv.partner}
                onClick={() => handleSelectConv(conv)}
                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                  (selectedConv?.partner?._id || selectedConv?.partner) === (conv.partner._id || conv.partner)
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <div className="relative">
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg ${
                     selectedConv?.partner._id === conv.partner._id ? 'bg-white/20' : 'bg-primary-600 text-white'
                   }`}>
                     {conv.partner.name.charAt(0)}
                   </div>
                   <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1 text-left overflow-hidden">
                   <div className="flex justify-between items-center mb-0.5">
                      <h4 className="font-black text-[11px] uppercase tracking-tight truncate">{conv.partner.name}</h4>
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${selectedConv?.partner._id === conv.partner._id ? 'text-white/50' : 'text-slate-400'}`}>
                         {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className="flex justify-between items-center gap-2">
                     <p className={`text-[10px] font-bold truncate tracking-tight ${selectedConv?.partner._id === conv.partner._id ? 'text-white/70' : 'text-slate-400'}`}>
                        {(getIsMe(conv.lastMessage)) ? 'You: ' : ''}{conv.lastMessage.content}
                     </p>
                     {unreadMessages[conv.partner._id] > 0 && (
                       <span className="flex-shrink-0 w-4 h-4 bg-primary-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                         {unreadMessages[conv.partner._id]}
                       </span>
                     )}
                   </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
               <Inbox className="w-10 h-10 mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Active Sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* Main: Chat View */}
      <div className={`flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-3xl shadow-slate-200/50 overflow-hidden flex flex-col ${!selectedConv ? 'hidden md:flex' : 'flex'}`}>
        {!selectedConv ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-slate-300">
             <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center">
                <MessageSquare className="w-12 h-12 opacity-20" />
             </div>
             <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Clinical Intake Hub</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Select a specialist to initiate secure transmission</p>
             </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-slate-50 rounded-xl">
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedConv.partner.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{selectedConv.partner.name}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Clinical Authority Verified</span>
                    </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                     <ShieldCheck className="w-4 h-4 text-primary-600" />
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Link</span>
                  </div>
                  {/* RBAC: Only authorized users can purge history */}
                  {can('delete') && (
                    <button 
                      onClick={handleDeleteConversation}
                      className="p-3 hover:bg-red-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all group"
                      title="Purge Conversation"
                    >
                       <Trash2 className="w-5 h-5 group-hover:animate-bounce" />
                    </button>
                  )}
               </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth scrollbar-hide">
               {currentMessages.map((msg, idx) => {
                 const isMe = msg.isMe;
                 const prevMsg = idx > 0 ? currentMessages[idx - 1] : null;
                 const nextMsg = idx < currentMessages.length - 1 ? currentMessages[idx + 1] : null;
                 
                 const isFirstInSequence = !prevMsg || (prevMsg.sender._id || prevMsg.sender) !== (msg.sender._id || msg.sender);
                 const isLastInSequence = !nextMsg || (nextMsg.sender._id || nextMsg.sender) !== (msg.sender._id || msg.sender);
                 const showAvatar = isFirstInSequence && !isMe;

                 // Calculate corner radii based on sequence
                 // SENT (Me) -> PRIMARY COLOR (Right)
                 // RECEIVED (Them) -> SLATE LIGHT (Left)
                 let bubbleStyles = isMe 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' 
                    : 'bg-slate-100 text-slate-800';

                 if (isMe) {
                    if (isFirstInSequence && isLastInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-tr-sm';
                    else if (isFirstInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-br-[0.5rem] rounded-tr-sm';
                    else if (isLastInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-tr-[0.5rem] rounded-br-sm';
                    else bubbleStyles += ' rounded-[1.75rem] rounded-r-[0.5rem]';
                 } else {
                    if (isFirstInSequence && isLastInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-tl-sm';
                    else if (isFirstInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-bl-[0.5rem] rounded-tl-sm';
                    else if (isLastInSequence) bubbleStyles += ' rounded-[1.75rem] rounded-tl-[0.5rem] rounded-bl-sm';
                    else bubbleStyles += ' rounded-[1.75rem] rounded-l-[0.5rem]';
                 }

                 return (
                   <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full animate-in slide-in-from-bottom-2 duration-300 ${!isLastInSequence ? 'mb-[2px]' : 'mb-6'}`} style={{ animationDelay: `${idx * 50}ms` }}>
                      <div className={`max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                         
                         {/* Avatar column to maintain spacing even if hidden */}
                         {!isMe && (
                           <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mt-1 border border-primary-200 ${showAvatar ? 'bg-primary-100 text-primary-700' : 'opacity-0'}`}>
                             {showAvatar && selectedConv.partner.name.charAt(0).toUpperCase()}
                           </div>
                         )}

                          <div className={`space-y-1.5 flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                             {msg.attachment && (
                                <div className={`mb-2 p-1 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm ${isMe ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}>
                                   {msg.attachment.fileType === 'image' ? (
                                      <img 
                                        src={`http://localhost:9090${msg.attachment.url}`} 
                                        alt="attachment" 
                                        className="max-w-[200px] h-auto object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => window.open(`http://localhost:9090${msg.attachment.url}`, '_blank')}
                                      />
                                   ) : (
                                      <a 
                                        href={`http://localhost:9090${msg.attachment.url}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 text-primary-600 hover:text-primary-700 font-bold"
                                      >
                                         <div className="p-2 bg-primary-50 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                         </div>
                                         <div className="flex flex-col min-w-0 pr-2">
                                            <span className="text-[10px] truncate max-w-[150px]">{msg.attachment.name}</span>
                                            <span className="text-[8px] opacity-60">{(msg.attachment.size / 1024).toFixed(1)} KB</span>
                                         </div>
                                      </a>
                                   )}
                                </div>
                             )}
                             {msg.content && (
                                <div className="group/msg relative">
                                  {/* RBAC: Message deletion check */}
                                  {(isMe && can('delete')) && (
                                    <button 
                                      onClick={() => handleDeleteMessage(msg._id)}
                                      className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-all active:scale-95"
                                      title="Delete message"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  <div className={`px-5 py-3.5 text-sm font-bold ${bubbleStyles}`}>
                                    {msg.content}
                                  </div>
                                </div>
                             )}
                             {isLastInSequence && (
                                <div className={`flex items-center gap-2 px-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                   <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                   </span>
                                   {isMe && (msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-primary-500" /> : <Check className="w-3.5 h-3.5 text-slate-200" />)}
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
             </div>
 
             {/* Input Port */}
             <div className="p-8 border-t border-slate-50">
                <form onSubmit={handleSendReply} className="relative group">
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileChange}
                   />
                   <input 
                      type="file" 
                      ref={imageInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileChange}
                   />
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <button 
                         type="button" 
                         onClick={() => fileInputRef.current?.click()}
                         className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all hover:text-slate-900"
                      >
                         <Paperclip className="w-4 h-4" />
                      </button>
                      <button 
                         type="button" 
                         onClick={() => imageInputRef.current?.click()}
                         className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all hover:text-slate-900"
                      >
                         <Image className="w-4 h-4" />
                      </button>
                   </div>
                  <input 
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type clinical inquiry protocol..."
                    className="w-full pl-28 pr-20 py-5 bg-slate-50 border-2 border-transparent rounded-[1.75rem] focus:bg-white focus:border-slate-200 outline-none text-sm font-bold shadow-inner transition-all placeholder:text-slate-300"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <button 
                        type="submit"
                        disabled={!reply.trim() || isSending}
                        className="w-12 h-12 bg-slate-900 hover:bg-primary-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-slate-900/10 active:scale-90 disabled:opacity-20 flex-shrink-0"
                      >
                        {isSending ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5 mt-[-1px]" />}
                      </button>
                  </div>
               </form>
               <div className="flex items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Clinical Thread Active</span>
                  </div>
                  <div className="w-px h-3 bg-slate-100"></div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">End-to-End Encryption protocol v4.2</span>
                  </div>
               </div>
            </div>
          </>
        )}
      </div>
      {/* Premium Deletion Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
             onClick={() => setShowDeleteModal(false)}
           />
           
           {/* Modal Body */}
           <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/20 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-12 flex flex-col items-center text-center space-y-6">
                 <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center group">
                    <AlertTriangle className="w-12 h-12 text-red-500 group-hover:animate-pulse transition-all" />
                 </div>
                 
                 <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase leading-tight">
                       {deleteType === 'message' ? 'Delete Message?' : 'Clear Entire Chat?'}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
                       {deleteType === 'message' 
                         ? 'This message will be permanently removed for both you and the specialist.'
                         : 'This will delete the entire conversation history. You cannot undo this action.'}
                    </p>
                 </div>
                 
                 <div className="flex flex-col w-full gap-3 pt-4">
                    <button 
                      onClick={proceedDelete}
                      className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      <Trash2 className="w-4 h-4" />
                      Yes, Delete Now
                    </button>
                    <button 
                      onClick={() => setShowDeleteModal(false)}
                      className="w-full py-5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Cancel
                    </button>
                 </div>
              </div>
              
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
