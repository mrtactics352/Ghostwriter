"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { Editor } from "@tiptap/react";
import { Users, MapPin, Calendar, Book, Wand2 } from "lucide-react";
import { createStoryElement, getAICharacterDetails, getCardFusion } from "@/app/actions/ai";
import { getSupabaseClient } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface StoryBibleProps {
  draftId: string;
  editor: Editor;
}

interface StoryElement {
  id: string;
  name: string;
  type: string;
  details: Record<string, unknown>;
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
    <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {children}
    </div>
  );
};

const Droppable = ({ onDrop, children }: { onDrop: (item: CardDragItem) => void, children: React.ReactNode }) => {
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
    <div ref={ref} className={`${isOver ? 'bg-ember/20' : ''}`}>
      {children}
    </div>
  );
};

export function StoryBible({ draftId, editor }: StoryBibleProps) {
  const [activeTab, setActiveTab] = useState("characters");
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const supabase = getSupabaseClient();

  const handleCreateCharacter = useCallback(async (name: string) => {
    const newElement = await createStoryElement(draftId, name, "character");
    setStoryElements(elements => [...elements, newElement]);
  }, [draftId]);

  useEffect(() => {
    const fetchStoryElements = async () => {
      const { data, error } = await supabase
        .from("story_elements")
        .select("*")
        .eq("draft_id", draftId);

      if (error) {
        console.error("Error fetching story elements:", error);
      } else {
        setStoryElements(data);
      }
    };

    void fetchStoryElements();
  }, [draftId, supabase]);

  useEffect(() => {
    const handleNewCharacter = (name: string) => {
      if (!storyElements.some(el => el.name === name && el.type === 'character')) {
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">New Character Detected</p>
                  <p className="mt-1 text-sm text-gray-500">A new character, &ldquo;{name}&rdquo;, has been detected. Would you like to create a card for them?</p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  void handleCreateCharacter(name);
                  toast.dismiss(t.id);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Create
              </button>
            </div>
          </div>
        ));
      }
    };

    const detectNewNames = () => {
      const text = editor.getText();
      const words = text.split(/\s+/);
      const potentialNames = words.filter((word: string) => /^[A-Z][a-z]+$/.test(word));

      potentialNames.forEach((name: string) => handleNewCharacter(name));
    };

    const interval = setInterval(detectNewNames, 5000);

    return () => clearInterval(interval);
  }, [editor, storyElements, handleCreateCharacter]);

  const handleAIFill = async (elementId: string) => {
    const element = storyElements.find(el => el.id === elementId);
    if (!element) return;

    const aiDetails = await getAICharacterDetails(element.name, editor.getText());

    const { data, error } = await supabase
      .from("story_elements")
      .update({ details: { ...element.details, ...aiDetails }, xp: element.xp + 50 })
      .eq("id", elementId)
      .select();

    if (error) {
      console.error("Error updating story element:", error);
    } else {
      setStoryElements(storyElements.map(el => el.id === elementId ? data[0] : el));
    }
  };

  const handleCardDrop = async (item: CardDragItem, target: StoryElement) => {
    if (item.type === 'character' && target.type === 'location') {
      const sentence = await getCardFusion(item.name, target.name);
      toast.success(sentence, { duration: 5000 });
    }
  };

  const renderCard = (element: StoryElement) => {
    const xpToNextLevel = element.level * 100;
    const levelProgress = (element.xp / xpToNextLevel) * 100;

    const card = (
      <div key={element.id} className={`p-4 border rounded-lg mb-4 bg-white/80 backdrop-blur-sm shadow-md border-white/20`}>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg font-serif">{element.name}</h3>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-2.5">
              <div className="bg-ember h-2.5 rounded-full" style={{ width: `${levelProgress}%` }}></div>
            </div>
            <span className="text-xs font-bold">LVL {element.level}</span>
            <button onClick={() => handleAIFill(element.id)}><Wand2 className="w-4 h-4" /></button>
          </div>
        </div>
        {typeof element.details?.backstory === 'string' && (
          <p className="text-sm mt-2">
            <strong>Backstory:</strong> {element.details.backstory}
          </p>
        )}
        {typeof element.details?.core_motivation === 'string' && (
          <p className="text-sm mt-2">
            <strong>Core Motivation:</strong> {element.details.core_motivation}
          </p>
        )}
      </div>
    );

    if (element.type === 'character') {
      return <DraggableCard element={element}>{card}</DraggableCard>;
    } else if (element.type === 'location') {
      return <Droppable onDrop={(item) => handleCardDrop(item, element)}>{card}</Droppable>;
    }
    return card;
  };

  const renderContent = () => {
    const filteredElements = storyElements.filter(el => el.type === activeTab);
    return filteredElements.map(renderCard);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="fixed right-0 top-0 h-full w-80 bg-white/50 backdrop-blur-lg border-l border-white/20 shadow-lg z-50 p-4 flex flex-col gap-4 text-ink">
        <h2 className="text-2xl font-serif">Story Bible</h2>
        <div className="flex justify-around border-b border-ink/10 pb-2">
          <button onClick={() => setActiveTab("characters")} className={`p-2 ${activeTab === "characters" ? "text-ember" : ""}`}><Users /></button>
          <button onClick={() => setActiveTab("locations")} className={`p-2 ${activeTab === "locations" ? "text-ember" : ""}`}><MapPin /></button>
          <button onClick={() => setActiveTab("events")} className={`p-2 ${activeTab === "events" ? "text-ember" : ""}`}><Calendar /></button>
          <button onClick={() => setActiveTab("plot")} className={`p-2 ${activeTab === "plot" ? "text-ember" : ""}`}><Book /></button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </DndProvider>
  );
}
