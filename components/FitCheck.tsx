/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StartScreen from './StartScreen';
import Canvas from './Canvas';
import WardrobePanel from './WardrobeModal';
import OutfitStack from './OutfitStack';
import { generateVirtualTryOnImage, generatePoseVariation } from '../services/geminiService';
import { OutfitLayer, WardrobeItem, SavedOutfit } from '../types';
import { ChevronDownIcon, ChevronUpIcon, HeartIcon, EyeIcon, Trash2Icon, CheckCircleIcon } from './icons';
import { defaultWardrobe } from '../wardrobe';
import { getFriendlyErrorMessage } from '../lib/utils';
import Spinner from './Spinner';

const POSE_INSTRUCTIONS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const SAVED_OUTFITS_KEY = 'great-labels-saved-outfits';

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};


const FitCheck: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(defaultWardrobe);
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [sidePanelTab, setSidePanelTab] = useState<'wardrobe' | 'saved'>('wardrobe');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Load saved outfits from localStorage on initial render
  useEffect(() => {
    try {
        const storedOutfits = localStorage.getItem(SAVED_OUTFITS_KEY);
        if (storedOutfits) {
            setSavedOutfits(JSON.parse(storedOutfits));
        }
    } catch (error) {
        console.error("Failed to load saved outfits from localStorage", error);
    }
  }, []);

  // Save outfits to localStorage whenever they change
  useEffect(() => {
      try {
          localStorage.setItem(SAVED_OUTFITS_KEY, JSON.stringify(savedOutfits));
      } catch (error) {
          console.error("Failed to save outfits to localStorage", error);
      }
  }, [savedOutfits]);


  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = useMemo(() => 
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[], 
    [activeOutfitLayers]
  );
  
  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    return currentLayer.poseImages[poseInstruction] ?? Object.values(currentLayer.poseImages)[0];
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      poseImages: { [POSE_INSTRUCTIONS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setIsSheetCollapsed(false);
    setWardrobe(defaultWardrobe);
  };

  const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!displayImageUrl || isLoading) return;

    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex(prev => prev + 1);
        setCurrentPoseIndex(0);
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Adding ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(displayImageUrl, garmentFile);
      const currentPoseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
      
      const newLayer: OutfitLayer = { 
        garment: garmentInfo, 
        poseImages: { [currentPoseInstruction]: newImageUrl } 
      };

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
            return prev;
        }
        return [...prev, garmentInfo];
      });
    // FIX: Explicitly type `err` in the catch block to `any` to handle `unknown` type, resolving a TypeScript error.
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'Failed to apply garment'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex]);

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(prevIndex => prevIndex - 1);
      setCurrentPoseIndex(0);
    }
  };
  
  const handlePoseSelect = useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;
    
    const poseInstruction = POSE_INSTRUCTIONS[newIndex];
    const currentLayer = outfitHistory[currentOutfitIndex];

    if (currentLayer.poseImages[poseInstruction]) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const baseImageForPoseChange = Object.values(currentLayer.poseImages)[0];
    if (!baseImageForPoseChange) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Changing pose...`);
    
    const prevPoseIndex = currentPoseIndex;
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });
    // FIX: Explicitly type `err` in the catch block to `any` to handle `unknown` type, resolving a TypeScript error.
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'Failed to change pose'));
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex]);

  const handleSaveOutfit = () => {
    if (!displayImageUrl || isLoading || outfitHistory.length <= 1) return;

    const newSavedOutfit: SavedOutfit = {
        id: `saved-${Date.now()}`,
        previewUrl: displayImageUrl,
        layers: [...outfitHistory],
        poseIndex: currentPoseIndex,
        activeLayerIndex: currentOutfitIndex,
    };

    setSavedOutfits(prev => [newSavedOutfit, ...prev]);

    setToastMessage('Outfit Saved!');
    setTimeout(() => {
        setToastMessage(null);
    }, 3000);
  };

  const handleLoadOutfit = (outfitId: string) => {
      const outfitToLoad = savedOutfits.find(o => o.id === outfitId);
      if (outfitToLoad) {
          setModelImageUrl(outfitToLoad.layers[0]?.poseImages[POSE_INSTRUCTIONS[0]] || null);
          setOutfitHistory(outfitToLoad.layers);
          setCurrentOutfitIndex(outfitToLoad.activeLayerIndex);
          setCurrentPoseIndex(outfitToLoad.poseIndex);
          setError(null);
          setSidePanelTab('wardrobe');
      }
  };

  const handleDeleteOutfit = (outfitId: string) => {
      setSavedOutfits(prev => prev.filter(o => o.id !== outfitId));
  };


  const viewVariants = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!modelImageUrl ? (
          <motion.div
            key="start-screen"
            className="w-screen min-h-[calc(100vh-5rem)] flex items-start sm:items-center justify-center bg-black p-4"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <StartScreen onModelFinalized={handleModelFinalized} />
          </motion.div>
        ) : (
          <motion.div
            key="main-app"
            className="relative flex flex-col h-[calc(100vh-5rem)] bg-black overflow-hidden"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <main className="flex-grow relative flex flex-col md:flex-row overflow-hidden">
              <div className="w-full h-full flex-grow flex items-center justify-center bg-black pb-16 relative">
                <button
                  onClick={handleSaveOutfit}
                  className="absolute top-4 right-4 z-30 flex items-center justify-center text-center bg-black/60 border border-gray-700/80 text-gray-200 font-semibold py-2 px-4 rounded-full transition-all duration-200 ease-in-out hover:bg-white hover:text-black active:scale-95 text-sm backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || outfitHistory.length <= 1}
                  aria-label="Save current outfit"
                >
                  <HeartIcon className="w-4 h-4 mr-2" />
                  Save Outfit
                </button>
                <AnimatePresence>
                    {toastMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="absolute bottom-24 z-40 flex items-center gap-3 px-4 py-2 rounded-full bg-black/70 backdrop-blur-lg border border-gray-700/80"
                        >
                            <CheckCircleIcon className="w-5 h-5 text-green-400" />
                            <span className="text-sm font-semibold text-white">{toastMessage}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <Canvas 
                  displayImageUrl={displayImageUrl}
                  onStartOver={handleStartOver}
                  isLoading={isLoading}
                  loadingMessage={loadingMessage}
                  onSelectPose={handlePoseSelect}
                  poseInstructions={POSE_INSTRUCTIONS}
                  currentPoseIndex={currentPoseIndex}
                  availablePoseKeys={availablePoseKeys}
                />
              </div>

              <aside 
                className={`absolute md:relative md:flex-shrink-0 bottom-0 right-0 h-auto md:h-full w-full md:w-1/3 md:max-w-sm bg-black/80 backdrop-blur-md flex flex-col border-t md:border-t-0 md:border-l border-gray-800/60 transition-transform duration-500 ease-in-out ${isSheetCollapsed ? 'translate-y-[calc(100%-4.5rem)]' : 'translate-y-0'} md:translate-y-0`}
                style={{ transitionProperty: 'transform' }}
              >
                  <button 
                    onClick={() => setIsSheetCollapsed(!isSheetCollapsed)} 
                    className="md:hidden w-full h-8 flex items-center justify-center bg-gray-900/50"
                    aria-label={isSheetCollapsed ? 'Expand panel' : 'Collapse panel'}
                  >
                    {isSheetCollapsed ? <ChevronUpIcon className="w-6 h-6 text-gray-400" /> : <ChevronDownIcon className="w-6 h-6 text-gray-400" />}
                  </button>
                  <div className="p-4 md:p-6 pb-20 overflow-y-auto flex-grow flex flex-col gap-6">
                    {error && (
                      <div className="bg-red-900/50 border-l-4 border-red-500 text-red-200 p-4 rounded-md" role="alert">
                        <p className="font-bold">Error</p>
                        <p>{error}</p>
                      </div>
                    )}
                    <OutfitStack 
                      outfitHistory={activeOutfitLayers}
                      onRemoveLastGarment={handleRemoveLastGarment}
                    />
                    
                    <div className="border-b border-gray-700/80">
                      <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                        <button
                          onClick={() => setSidePanelTab('wardrobe')}
                          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            sidePanelTab === 'wardrobe'
                              ? 'border-white text-white'
                              : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                          }`}
                        >
                          Wardrobe
                        </button>
                        <button
                          onClick={() => setSidePanelTab('saved')}
                          className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            sidePanelTab === 'saved'
                              ? 'border-white text-white'
                              : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                          }`}
                        >
                          Saved Fits <span className="bg-gray-700 text-gray-300 text-xs font-mono ml-1 px-1.5 py-0.5 rounded-full">{savedOutfits.length}</span>
                        </button>
                      </nav>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={sidePanelTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {sidePanelTab === 'wardrobe' && (
                          <WardrobePanel
                            onGarmentSelect={handleGarmentSelect}
                            activeGarmentIds={activeGarmentIds}
                            isLoading={isLoading}
                            wardrobe={wardrobe}
                          />
                        )}
                        {sidePanelTab === 'saved' && (
                           <div>
                            {savedOutfits.length === 0 ? (
                              <p className="text-center text-sm text-gray-500 pt-4">Your saved outfits will appear here. Press 'Save Outfit' on a look you like!</p>
                            ) : (
                              <div className="grid grid-cols-3 gap-3">
                                {savedOutfits.map(outfit => (
                                  <div key={outfit.id} className="relative group aspect-square border border-gray-700 rounded-lg overflow-hidden">
                                    <img src={outfit.previewUrl} alt="Saved outfit" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-2">
                                      <button onClick={() => handleLoadOutfit(outfit.id)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Load outfit">
                                        <EyeIcon className="w-5 h-5 text-white" />
                                      </button>
                                      <button onClick={() => handleDeleteOutfit(outfit.id)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors" aria-label="Delete outfit">
                                        <Trash2Icon className="w-5 h-5 text-red-400" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
              </aside>
            </main>
            <AnimatePresence>
              {isLoading && isMobile && (
                <motion.div
                  className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Spinner />
                  {loadingMessage && (
                    <p className="text-lg font-serif text-gray-300 mt-4 text-center px-4">{loadingMessage}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FitCheck;