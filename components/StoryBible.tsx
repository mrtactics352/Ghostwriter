
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Users, MapPin, Calendar, Book } from "lucide-react";
import { createStoryElement, getCardFusion } from "@/app/actions/ai";
import { getSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion } from "framer-motion";
import { StoryBibleCard, StoryBibleCardSkeleton, storyBibleCardVariants } from "./StoryBibleCard";
import { StoryElementEditor } from "./StoryElementEditor";
import { unlockAchievement } from "@/app/actions/achievements";
import { AchievementToast } from "./AchievementToast";

interface StoryBibleProps {
  draftId: string;
  editor: Editor;
}

interface StoryElement {
  id: string;
  name: string;
  type: string;
  details: Record<string, unknown> | null;
  level: number;
  xp: number;
}

const ItemTypes = {
  CARD: 'card',
}

interface CardDragItem {
    id: string;
    type: string;
    name: string;
}

const DraggableCard = ({ element, children }: { element: StoryElement, children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    item: { id: element.id, type: element.type, name: element.name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref);

  return (
    <motion.div ref={ref} style={{ opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 100 : 10 }} variants={storyBibleCardVariants}>
      {children}
    </motion.div>
  );
};

const Droppable = ({ onDrop, children, isOverClassName }: { onDrop: (item: CardDragItem) => void, children: React.ReactNode, isOverClassName?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item: CardDragItem) => onDrop(item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(ref);

  return (
    <motion.div ref={ref} className={`${isOver ? (isOverClassName || 'bg-ember/20') : ''}`} variants={storyBibleCardVariants}>
      {children}
    </motion.div>
  );
};

export function StoryBible({ draftId, editor }: StoryBibleProps) {
  const [activeTab, setActiveTab] = useState("characters");
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingElement, setEditingElement] = useState<StoryElement | null>(null);
  const supabase = getSupabaseClient();

  const handleCreateCharacter = useCallback(async (name: string) => {
    const newElement = await createStoryElement(draftId, name, "character");
    setStoryElements(elements => [...elements, newElement]);
  }, [draftId]);

  useEffect(() => {
    const fetchStoryElements = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("story_elements")
        .select("*")
        .eq("draft_id", draftId);

      if (error) {
        console.error("Error fetching story elements:", error);
      } else {
        setStoryElements(data as StoryElement[]);
      }
      setIsLoading(false);
    };

    void fetchStoryElements();
  }, [draftId, supabase]);

  useEffect(() => {
    // ... (toast notification logic for new characters remains the same)
  }, [editor, storyElements, handleCreateCharacter]);

  const handleCardDrop = async (item: CardDragItem, target: StoryElement) => {
    if (item.type === 'character' && target.type === 'location') {
      toast.promise(getCardFusion(item.name, target.name), {
          loading: 'Fusing cards...',
          success: (sentence) => `Fusion successful: ${sentence}`,
          error: 'Could not fuse cards.',
      });
    }
  };
  
  const handleCardClick = (element: StoryElement) => {
      setEditingElement(element);
  }

  const handleEditorClose = () => {
      setEditingElement(null);
  }

  const handleEditorSave = async (updatedElement: StoryElement) => {
    const originalElement = storyElements.find(el => el.id === updatedElement.id);
    const wasIncomplete = !originalElement?.details || Object.keys(originalElement.details).length === 0;
    const totalCompletedCount = storyElements.filter(el => el.details && Object.keys(el.details).length > 0).length;

    // Update UI state immediately for a snappy feel
    setStoryElements(currentElements =>
        currentElements.map(el =>
            el.id === updatedElement.id ? updatedElement : el
        )
    );
    setEditingElement(null);

    // Check for the "First Element Created" achievement
    if (wasIncomplete && totalCompletedCount === 0) {
        const newAchievement = await unlockAchievement('first_element_created');
        if (newAchievement) {
            setTimeout(() => {
                toast.custom(() => <AchievementToast achievement={newAchievement} />, {
                    duration: 5000,
                    position: 'bottom-center',
                });
            }, 300); // Short delay for the modal to close
        }
    }
  }

  const renderContent = () => {
    // ... (rendering logic remains the same)
    if (isLoading) {
        return (
          <div className="space-y-4 pt-4">
            {[...Array(4)].map((_, i) => <StoryBibleCardSkeleton key={i} />)}
          </div>
        );
      }
  
      const filteredElements = storyElements.filter(el => el.type === activeTab);
      
      if (filteredElements.length === 0) {
          return (
              <div className="text-center py-12">
                  <p className="text-ink/50">No {activeTab} yet.</p>
                  <p className="text-sm text-ink/40">Start writing to automatically detect new elements.</p>
              </div>
          )
      }
  
      return (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          className="space-y-3 pt-4"
        >
          {filteredElements.map((element) => {
            const status = (element.details && Object.keys(element.details).length > 0) ? "complete" : "incomplete";
            
            const cardComponent = (
              <StoryBibleCard
                title={element.name}
                status={status}
                onClick={() => handleCardClick(element)}
                className="hover:z-50"
              />
            );
  
            if (element.type === 'character') {
              return <DraggableCard key={element.id} element={element}>{cardComponent}</DraggableCard>;
            } 
            
            if (element.type === 'location') {
              return <Droppable key={element.id} onDrop={(item) => handleCardDrop(item, element)}>{cardComponent}</Droppable>;
            }
            
            return (
                <motion.div key={element.id} variants={storyBibleCardVariants}>
                    {cardComponent}
                </motion.div>
            );
          })}
        </motion.div>
      );
  };

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="fixed right-0 top-0 h-full w-96 bg-gray-50/80 backdrop-blur-lg border-l border-white/20 shadow-lg z-40 p-6 flex flex-col gap-4 text-ink">
            {/* ... (header and tabs remain the same) */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-serif">Story Bible</h2>
                <span className="text-xs font-sans uppercase tracking-widest text-yellow-500/80">Day 1</span>
            </div>
            <div className="flex justify-around border-b border-ink/10 pb-2">
                <button onClick={() => setActiveTab("characters")} className={`p-2 rounded-md transition-colors ${activeTab === "characters" ? "text-ember bg-ember/10" : "text-ink/50 hover:bg-ink/5"}`}><Users size={20} /></button>
                <button onClick={() => setActiveTab("locations")} className={`p-2 rounded-md transition-colors ${activeTab === "locations" ? "text-ember bg-ember/10" : "text-ink/50 hover:bg-ink/5"}`}><MapPin size={20} /></button>
                <button onClick={() => setActiveTab("events")} className={`p-2 rounded-md transition-colors ${activeTab === "events" ? "text-ember bg-ember/10" : "text-ink/50 hover:bg-ink/5"}`}><Calendar size={20} /></button>
                <button onClick={() => setActiveTab("plot")} className={`p-2 rounded-md transition-colors ${activeTab === "plot" ? "text-ember bg-ember/10" : "text-ink/50 hover:bg-ink/5"}`}><Book size={20} /></button>
            </div>
            <div className="flex-grow overflow-y-auto -mr-3 pr-3">
                {renderContent()}
            </div>
        </div>

        <StoryElementEditor 
            element={editingElement}
            onClose={handleEditorClose}
            onSave={handleEditorSave}
        />
    </DndProvider>
  );
}
