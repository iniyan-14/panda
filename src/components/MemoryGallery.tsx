import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, limit, addDoc, deleteDoc, doc, startAfter, setDoc } from 'firebase/firestore';
import { Memory } from '../types';
import { 
  X as LucideX, 
  Calendar as LucideCalendar, 
  Plus as LucidePlus, 
  Trash2 as LucideTrash2, 
  Check as LucideCheck, 
  ChevronDown as LucideChevronDown, 
  Heart as LucideHeart, 
  Upload as LucideUpload, 
  ZoomIn as LucideZoomIn, 
  ZoomOut as LucideZoomOut, 
  Maximize as LucideMaximize, 
  RotateCcw as LucideRotateCcw, 
  Video as LucideVideo, 
  Play as LucidePlay, 
  ChevronLeft as LucideChevronLeft, 
  ChevronRight as LucideChevronRight, 
  Minimize2 as LucideMinimize2,
  Image as LucideImage
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import imageCompression from 'browser-image-compression';

interface MemoryGalleryProps {
  isAdmin?: boolean;
}

export default function MemoryGallery({ isAdmin }: MemoryGalleryProps) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemory, setNewMemory] = useState({ imageUrls: [] as string[], caption: '', date: new Date().toISOString().split('T')[0] });
  const [singleImageUrl, setSingleImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  useEffect(() => {
    if (showAddModal || selectedMemory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, selectedMemory]);

  useEffect(() => {
    if (showAddModal || selectedMemory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddModal, selectedMemory]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadLoading(true);
      const fileArray = Array.from(files) as File[];
      const newUrls: string[] = [];

      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        for (const file of fileArray) {
          let fileToProcess = file;
          
          if (file.type.startsWith('image/')) {
            // Compress large images
            if (file.size > 800000) {
              try {
                fileToProcess = await imageCompression(file, compressionOptions);
              } catch (err) {
                console.error("Compression failed:", err);
              }
            }
          } else if (file.type.startsWith('video/')) {
            if (file.size > 100000000) { // Limit videos to 100MB
              alert(`Video ${file.name} is too large (>100MB). skipping.`);
              continue;
            }
          }

          const reader = new FileReader();
          const dataUrl = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(fileToProcess);
          });

          // Firestore document limit is 1MB. Base64 is ~33% larger than binary.
          // Accurate check: base64 length in bytes
          if (dataUrl.length > 1000000) {
            alert(`File ${file.name} is still too large for our memory bank after optimization. Please use a direct image/video URL for this one!`);
            continue;
          }

          newUrls.push(dataUrl);
        }
        
        setNewMemory(p => ({ ...p, imageUrls: [...p.imageUrls, ...newUrls] }));
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMemories(true);
  }, []);

  const fetchMemories = async (isInitial = false) => {
    if (!isInitial && !hasMore) return;
    setLoading(true);
    try {
      const memoriesRef = collection(db, 'memories');
      let q;
      if (isInitial) {
        q = query(memoriesRef, orderBy('date', 'desc'), limit(12));
      } else {
        q = query(memoriesRef, orderBy('date', 'desc'), startAfter(lastDoc), limit(12));
      }
      
      const querySnapshot = await getDocs(q);
      const fetchedMemories = querySnapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data
        };
      }) as Memory[];
      
      if (isInitial) {
        setMemories(fetchedMemories);
      } else {
        setMemories(prev => [...prev, ...fetchedMemories]);
      }
      
      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setHasMore(querySnapshot.docs.length === 12);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrls = [...newMemory.imageUrls];
    if (singleImageUrl) finalUrls.push(singleImageUrl);
    
    if (finalUrls.length === 0 || !newMemory.caption) return;
    
    setIsSubmitting(true);
    try {
      // Add each image as a separate document
      const promises = finalUrls.map(url => 
        addDoc(collection(db, 'memories'), {
          imageUrl: url,
          caption: newMemory.caption,
          date: newMemory.date
        })
      );
      
      await Promise.all(promises);
      
      setNewMemory({ imageUrls: [], caption: '', date: new Date().toISOString().split('T')[0] });
      setSingleImageUrl('');
      setShowAddModal(false);
      fetchMemories(true);
    } catch (error) {
      console.error(error);
    }
    setIsSubmitting(false);
  };

  const handlePermanentDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this precious memory?')) return;
    try {
      await deleteDoc(doc(db, 'memories', id));
      setMemories(prev => prev.filter(m => m.id !== id));
      if (selectedMemory?.id === id) setSelectedMemory(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSetLoginImage = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await setDoc(doc(db, 'settings', 'surprise'), { landingImageUrl: imageUrl }, { merge: true });
      alert("✨ Success! This memory is now the gateway wallpaper for our garden. ❤️");
    } catch (err) {
      console.error(err);
      alert("Something went wrong while setting the wallpaper.");
    }
  };

  const navigateGallery = (direction: number) => {
    if (!selectedMemory) return;
    const currentIndex = memories.findIndex(m => m.id === selectedMemory.id);
    const nextIndex = currentIndex + direction;
    
    if (nextIndex >= 0 && nextIndex < memories.length) {
      setSelectedMemory(memories[nextIndex]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedMemory) return;
      if (e.key === 'ArrowLeft') navigateGallery(-1);
      if (e.key === 'ArrowRight') navigateGallery(1);
      if (e.key === 'Escape') setSelectedMemory(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMemory, memories]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="py-12"
    >
      <div className="text-center mb-16 px-4">
        <h2 className="text-4xl md:text-5xl font-serif italic text-[var(--rose-deep)] mb-4">Our Beautiful Journey</h2>
        <p className="text-[var(--ink)] opacity-60 font-sans tracking-[0.3em] uppercase text-[10px] font-black">A Living Gallery of Us</p>
        
        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-8 mx-auto flex items-center gap-3 px-8 py-4 bg-[var(--rose-deep)] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--ink)] transition-all shadow-xl hover:-translate-y-1"
          >
            <LucidePlus size={18} />
            Add New Memory
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {memories.map((memory) => (
          <motion.div
            key={memory.id}
            layoutId={`memory-${memory.id}`}
            onClick={() => setSelectedMemory(memory)}
            whileHover={{ y: -8 }}
            className="group cursor-pointer bg-white rounded-[2.5rem] overflow-hidden shadow-xl card-shadow border border-[var(--rose-deep)]/5 relative"
          >
            {isAdmin && (
              <div className="absolute top-5 right-5 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => handleSetLoginImage(memory.imageUrl, e)}
                  title="Step 1/1: Make this Login Wallpaper"
                  className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white shadow-lg"
                >
                  <LucideImage size={18} />
                </button>
                <button
                  onClick={(e) => handlePermanentDelete(memory.id!, e)}
                  className="w-10 h-10 rounded-2xl bg-white/90 backdrop-blur-md flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white shadow-lg"
                >
                  <LucideTrash2 size={18} />
                </button>
              </div>
            )}
            <div className="aspect-[4/5] overflow-hidden relative bg-gray-100 flex items-center justify-center">
              {memory.imageUrl && (
                memory.imageUrl.startsWith('data:video') ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover:bg-gray-800 transition-colors">
                    <LucidePlay size={48} className="text-white fill-white/20" />
                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full">
                      <LucideVideo size={16} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={memory.imageUrl} 
                    alt={memory.caption} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                )
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-[var(--ink)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <p className="text-white font-serif italic text-xl leading-snug mb-3 line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{memory.caption}</p>
                <div className="flex items-center gap-2 text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">
                  {/* Date removed as per request */}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-20">
          <button
            onClick={() => fetchMemories()}
            className="flex items-center gap-3 px-10 py-5 bg-white border-2 border-[var(--rose-soft)] text-[var(--ink)] rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[var(--rose-soft)] transition-all shadow-md group"
          >
            Explore More Memories
            <LucideChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center p-20">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <LucideHeart className="text-[var(--rose-deep)]" size={32} />
          </motion.div>
        </div>
      )}

      {/* Add Memory Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex flex-col items-center justify-start p-6 backdrop-blur-md bg-[var(--ink)]/40 overflow-y-auto pointer-events-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl max-w-md w-full relative border border-[var(--rose-deep)]/20 max-h-[90vh] overflow-y-auto custom-scrollbar my-auto"
            >
              <button onClick={() => setShowAddModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 transition-colors">
                <LucideX size={28} />
              </button>
              
              <h3 className="text-3xl font-serif italic text-[var(--ink)] mb-10 text-center">Preserve a Moment</h3>
              
              <form onSubmit={handleAddMemory} className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--rose-deep)] font-black mb-3 ml-2">Photo Source</label>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <label className="w-full flex flex-col items-center justify-center p-8 bg-[var(--rose-soft)]/20 border-2 border-dashed border-[var(--rose-soft)] rounded-3xl cursor-pointer hover:bg-[var(--rose-soft)]/30 transition-all group relative overflow-hidden">
                        <div className="flex flex-col items-center gap-2 z-10 text-center">
                          <LucideUpload size={32} className="text-[var(--rose-deep)] mb-2 group-hover:-translate-y-1 transition-transform" />
                          <span className="text-[10px] font-black uppercase text-[var(--ink)] tracking-widest">Bulk Upload Photos & Videos</span>
                          <p className="text-[9px] text-gray-400 font-medium italic">Max 100MB per file. Items over 1MB should use external URLs for best results.</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleFileUpload} disabled={uploadLoading} />
                        {uploadLoading && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                              <LucideRotateCcw className="text-[var(--rose-deep)]" size={32} />
                            </motion.div>
                          </div>
                        )}
                      </label>
                    </div>

                    {newMemory.imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-100">
                        {newMemory.imageUrls.map((url, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                            {url.startsWith('data:video') ? (
                              <LucideVideo className="text-white/50" size={20} />
                            ) : (
                              <img src={url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                            )}
                            <button 
                              type="button"
                              onClick={() => setNewMemory(p => ({ ...p, imageUrls: p.imageUrls.filter((_, i) => i !== index) }))}
                              className="absolute top-1 right-1 p-0.5 bg-black/50 rounded-full text-white hover:bg-black"
                            >
                              <LucideX size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {newMemory.imageUrls.length === 0 && (
                      <input
                        type="url"
                        value={singleImageUrl}
                        onChange={e => setSingleImageUrl(e.target.value)}
                        className="w-full px-6 py-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)]/50 rounded-2xl focus:outline-none focus:border-[var(--rose-deep)]/30 focus:ring-4 focus:ring-[var(--rose-soft)]"
                        placeholder="Or paste a single image URL here..."
                      />
                    )}

                    {uploadLoading && (
                      <div className="text-center text-[var(--rose-deep)] text-xs animate-pulse font-serif italic">
                        Processing your memory...
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-[var(--rose-deep)] font-black mb-3 ml-2">Caption or Story</label>
                  <textarea
                    required
                    value={newMemory.caption}
                    onChange={e => setNewMemory(p => ({ ...p, caption: e.target.value }))}
                    className="w-full px-6 py-4 bg-[var(--rose-soft)]/20 border-2 border-[var(--rose-soft)]/50 rounded-2xl focus:outline-none focus:border-[var(--rose-deep)]/30 focus:ring-4 focus:ring-[var(--rose-soft)] resize-none h-32"
                    placeholder="Tell the beautiful story behind this photo..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[var(--ink)] text-white rounded-[2rem] font-bold tracking-[0.2em] uppercase text-xs flex items-center justify-center gap-3 hover:bg-[var(--rose-deep)] transition-all shadow-xl"
                >
                  {isSubmitting ? 'Preserving...' : <><LucideCheck size={18} /> Save to Gallery</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-0 pointer-events-auto"
          >
            <motion.div 
              className="fixed inset-0 bg-[var(--ink)]/98 backdrop-blur-2xl"
              onClick={() => setSelectedMemory(null)}
            />
            
            <motion.div
              layoutId={`memory-${selectedMemory.id}`}
              className="relative z-10 w-full h-full md:h-[90vh] md:max-w-6xl md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row bg-white"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.05}
              onDragEnd={(_, info) => {
                const threshold = 100; // Increased for better stability
                if (info.offset.x > threshold) navigateGallery(-1);
                else if (info.offset.x < -threshold) navigateGallery(1);
              }}
            >
              {/* Navigation Arrows (Desktop) */}
              <div className="hidden md:block">
                <button 
                  onClick={() => navigateGallery(-1)}
                  disabled={memories.findIndex(m => m.id === selectedMemory.id) === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <LucideChevronLeft size={32} />
                </button>
                <button 
                  onClick={() => navigateGallery(1)}
                  disabled={memories.findIndex(m => m.id === selectedMemory.id) === memories.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <LucideChevronRight size={32} />
                </button>
              </div>

              <button 
                onClick={() => setSelectedMemory(null)}
                className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all border border-white/30"
              >
                <LucideX size={28} />
              </button>
              
              <div className="flex-1 h-3/5 md:h-full relative overflow-hidden bg-black flex items-center justify-center group/viewer">
                {selectedMemory.imageUrl && (
                  selectedMemory.imageUrl.startsWith('data:video') ? (
                    <video 
                      src={selectedMemory.imageUrl} 
                      controls 
                      className="max-w-full max-h-full"
                      autoPlay
                    />
                  ) : (
                    <TransformWrapper
                      initialScale={1}
                      minScale={0.5}
                      maxScale={4}
                      centerOnInit
                    >
                      {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 opacity-0 group-hover/viewer:opacity-100 transition-opacity">
                            <button onClick={() => zoomIn()} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Zoom In">
                              <LucideZoomIn size={20} />
                            </button>
                            <button onClick={() => zoomOut()} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Zoom Out">
                              <LucideZoomOut size={20} />
                            </button>
                            <button 
                              onClick={() => resetTransform()} 
                              className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/20 rounded-xl transition-colors border-l border-white/20 ml-1"
                              title="Zoom to Fit"
                            >
                              <LucideMaximize size={18} />
                              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Zoom to Fit</span>
                            </button>
                          </div>
  
                          <TransformComponent
                            wrapperClassName="!w-full !h-full"
                            contentClassName="!w-full !h-full flex items-center justify-center"
                          >
                            <img 
                              src={selectedMemory.imageUrl} 
                              alt={selectedMemory.caption} 
                              className="max-w-full max-h-full object-contain cursor-move"
                              referrerPolicy="no-referrer"
                            />
                          </TransformComponent>
                        </>
                      )}
                    </TransformWrapper>
                  )
                )}
              </div>
              
              <div className="h-2/5 md:h-full md:w-[450px] p-6 md:p-12 flex flex-col justify-center bg-white relative overflow-y-auto custom-scrollbar">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--rose-deep)] to-[var(--gold)]" />
                
                <div className="md:hidden flex justify-center gap-6 mb-4 shrink-0">
                  <button 
                    onClick={() => navigateGallery(-1)}
                    disabled={memories.findIndex(m => m.id === selectedMemory.id) === 0}
                    className="p-2 bg-[var(--rose-soft)] rounded-full text-[var(--rose-deep)] disabled:opacity-30"
                  >
                    <LucideChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => navigateGallery(1)}
                    disabled={memories.findIndex(m => m.id === selectedMemory.id) === memories.length - 1}
                    className="p-2 bg-[var(--rose-soft)] rounded-full text-[var(--rose-deep)] disabled:opacity-30"
                  >
                    <LucideChevronRight size={20} />
                  </button>
                </div>

                <div className="flex flex-col flex-1 justify-center py-2 md:py-4">
                  <h3 className="text-xl md:text-2xl font-serif italic text-[var(--ink)] leading-[1.4] mb-4 md:mb-6">
                    "{selectedMemory.caption}"
                  </h3>
                  
                  <div className="w-12 md:w-16 h-1 bg-[var(--rose-soft)] rounded-full mb-4 md:mb-6"></div>
                  
                  <p className="text-[var(--ink)] opacity-60 leading-relaxed italic text-sm md:text-base font-serif">
                    Every moment captured is a piece of my heart that belongs to you forever.
                  </p>
                </div>
                
                <div className="mt-4 md:mt-6 pt-4 border-t border-gray-100 flex items-center gap-3 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-[var(--rose-soft)]/30 flex items-center justify-center">
                    <LucideHeart size={16} className="text-[var(--rose-deep)] fill-[var(--rose-deep)]" />
                  </div>
                  <span className="text-[8px] md:text-[10px] uppercase font-black tracking-widest text-[var(--ink)] opacity-40">Made with love</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
