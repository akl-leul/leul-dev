import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  PageSection, 
  PageComponent, 
  ComponentType, 
  COMPONENT_DEFAULTS, 
  ComponentStyle,
  PageBuilderState 
} from './types';

const MAX_HISTORY = 50;

export function usePageBuilder(initialSections: PageSection[] = []) {
  const [sections, setSections] = useState<PageSection[]>(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'section' | 'component' | null>(null);
  const [history, setHistory] = useState<PageSection[][]>([initialSections]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(100);
  const skipHistoryRef = useRef(false);

  // Generate unique ID
  const generateId = () => uuidv4().slice(0, 8);

  // Add to history
  const addToHistory = useCallback((newSections: PageSection[]) => {
    if (skipHistoryRef.current) {
      skipHistoryRef.current = false;
      return;
    }
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newSections)));
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  // Undo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      skipHistoryRef.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSections(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  // Redo
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      skipHistoryRef.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSections(JSON.parse(JSON.stringify(history[newIndex])));
    }
  }, [history, historyIndex]);

  // Add section
  const addSection = useCallback((index?: number) => {
    const newSection: PageSection = {
      id: generateId(),
      type: 'section',
      name: `Section ${sections.length + 1}`,
      components: [],
      styles: {
        padding: '48px 24px',
        backgroundColor: 'transparent',
      },
    };
    
    setSections(prev => {
      const newSections = [...prev];
      if (index !== undefined) {
        newSections.splice(index, 0, newSection);
      } else {
        newSections.push(newSection);
      }
      addToHistory(newSections);
      return newSections;
    });
    
    setSelectedId(newSection.id);
    setSelectedType('section');
    return newSection.id;
  }, [sections.length, addToHistory]);

  // Remove section
  const removeSection = useCallback((sectionId: string) => {
    setSections(prev => {
      const newSections = prev.filter(s => s.id !== sectionId);
      addToHistory(newSections);
      return newSections;
    });
    if (selectedId === sectionId) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId, addToHistory]);

  // Duplicate section
  const duplicateSection = useCallback((sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const section = sections[sectionIndex];
    const duplicated: PageSection = {
      ...JSON.parse(JSON.stringify(section)),
      id: generateId(),
      name: `${section.name} (Copy)`,
    };

    // Generate new IDs for all components
    duplicated.components = duplicated.components.map(comp => ({
      ...comp,
      id: generateId(),
    }));

    setSections(prev => {
      const newSections = [...prev];
      newSections.splice(sectionIndex + 1, 0, duplicated);
      addToHistory(newSections);
      return newSections;
    });
  }, [sections, addToHistory]);

  // Move section
  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    setSections(prev => {
      const newSections = [...prev];
      const [removed] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, removed);
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Update section
  const updateSection = useCallback((sectionId: string, updates: Partial<PageSection>) => {
    setSections(prev => {
      const newSections = prev.map(s => 
        s.id === sectionId ? { ...s, ...updates } : s
      );
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Add component to section
  const addComponent = useCallback((
    sectionId: string, 
    componentType: ComponentType, 
    index?: number
  ) => {
    const defaults = COMPONENT_DEFAULTS[componentType];
    const newComponent: PageComponent = {
      id: generateId(),
      type: componentType,
      content: defaults.content,
      styles: defaults.styles || {},
      children: defaults.children,
    };

    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        const components = [...s.components];
        if (index !== undefined) {
          components.splice(index, 0, newComponent);
        } else {
          components.push(newComponent);
        }
        return { ...s, components };
      });
      addToHistory(newSections);
      return newSections;
    });

    setSelectedId(newComponent.id);
    setSelectedType('component');
    return newComponent.id;
  }, [addToHistory]);

  // Remove component
  const removeComponent = useCallback((sectionId: string, componentId: string) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.filter(c => c.id !== componentId),
        };
      });
      addToHistory(newSections);
      return newSections;
    });

    if (selectedId === componentId) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId, addToHistory]);

  // Duplicate component
  const duplicateComponent = useCallback((sectionId: string, componentId: string) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        const compIndex = s.components.findIndex(c => c.id === componentId);
        if (compIndex === -1) return s;
        
        const component = s.components[compIndex];
        const duplicated: PageComponent = {
          ...JSON.parse(JSON.stringify(component)),
          id: generateId(),
        };
        
        const components = [...s.components];
        components.splice(compIndex + 1, 0, duplicated);
        return { ...s, components };
      });
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Move component
  const moveComponent = useCallback((
    fromSectionId: string,
    toSectionId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    setSections(prev => {
      let movedComponent: PageComponent | null = null;
      
      const newSections = prev.map(s => {
        if (s.id === fromSectionId) {
          const components = [...s.components];
          [movedComponent] = components.splice(fromIndex, 1);
          return { ...s, components };
        }
        return s;
      });

      if (!movedComponent) return prev;

      const finalSections = newSections.map(s => {
        if (s.id === toSectionId) {
          const components = [...s.components];
          components.splice(toIndex, 0, movedComponent!);
          return { ...s, components };
        }
        return s;
      });

      addToHistory(finalSections);
      return finalSections;
    });
  }, [addToHistory]);

  // Update component
  const updateComponent = useCallback((
    sectionId: string, 
    componentId: string, 
    updates: Partial<PageComponent>
  ) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.map(c => 
            c.id === componentId ? { ...c, ...updates } : c
          ),
        };
      });
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Update component style
  const updateComponentStyle = useCallback((
    sectionId: string,
    componentId: string,
    styles: Partial<ComponentStyle>
  ) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.map(c => 
            c.id === componentId 
              ? { ...c, styles: { ...c.styles, ...styles } } 
              : c
          ),
        };
      });
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Find component (including nested)
  const findComponent = useCallback((componentId: string): { section: PageSection, component: PageComponent, parentComponent?: PageComponent } | null => {
    for (const section of sections) {
      for (const component of section.components) {
        if (component.id === componentId) {
          return { section, component };
        }
        // Check nested children
        if (component.children) {
          const child = component.children.find(c => c.id === componentId);
          if (child) {
            return { section, component: child, parentComponent: component };
          }
        }
      }
    }
    return null;
  }, [sections]);

  // Add child component to a nested parent (like columns or container)
  const addChildComponent = useCallback((
    sectionId: string,
    parentId: string,
    componentType: ComponentType,
    index?: number
  ) => {
    const defaults = COMPONENT_DEFAULTS[componentType];
    const newChild: PageComponent = {
      id: generateId(),
      type: componentType,
      content: defaults.content,
      styles: defaults.styles || {},
      children: defaults.children,
    };

    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id !== parentId) return c;
            const children = [...(c.children || [])];
            if (index !== undefined) {
              // For columns, replace at specific index
              if (c.type === 'columns') {
                children[index] = newChild;
              } else {
                children.splice(index, 0, newChild);
              }
            } else {
              children.push(newChild);
            }
            return { ...c, children };
          }),
        };
      });
      addToHistory(newSections);
      return newSections;
    });

    setSelectedId(newChild.id);
    setSelectedType('component');
    return newChild.id;
  }, [addToHistory]);

  // Update child component
  const updateChildComponent = useCallback((
    sectionId: string,
    parentId: string,
    childId: string,
    updates: Partial<PageComponent>
  ) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id !== parentId || !c.children) return c;
            return {
              ...c,
              children: c.children.map(child =>
                child.id === childId ? { ...child, ...updates } : child
              ),
            };
          }),
        };
      });
      addToHistory(newSections);
      return newSections;
    });
  }, [addToHistory]);

  // Remove child component
  const removeChildComponent = useCallback((
    sectionId: string,
    parentId: string,
    childId: string
  ) => {
    setSections(prev => {
      const newSections = prev.map(s => {
        if (s.id !== sectionId) return s;
        return {
          ...s,
          components: s.components.map(c => {
            if (c.id !== parentId || !c.children) return c;
            // For columns, set to undefined instead of removing
            if (c.type === 'columns') {
              return {
                ...c,
                children: c.children.map(child =>
                  child.id === childId ? undefined : child
                ).filter(Boolean) as PageComponent[],
              };
            }
            return {
              ...c,
              children: c.children.filter(child => child.id !== childId),
            };
          }),
        };
      });
      addToHistory(newSections);
      return newSections;
    });

    if (selectedId === childId) {
      setSelectedId(null);
      setSelectedType(null);
    }
  }, [selectedId, addToHistory]);

  // Select item
  const selectItem = useCallback((id: string | null, type: 'section' | 'component' | null) => {
    setSelectedId(id);
    setSelectedType(type);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedId(null);
    setSelectedType(null);
  }, []);

  // Load sections
  const loadSections = useCallback((newSections: PageSection[]) => {
    setSections(newSections);
    setHistory([newSections]);
    setHistoryIndex(0);
    clearSelection();
  }, [clearSelection]);

  // Get state
  const getState = useCallback((): PageBuilderState => ({
    sections,
    selectedId,
    selectedType,
    history,
    historyIndex,
    viewMode,
    showGrid,
    zoom,
  }), [sections, selectedId, selectedType, history, historyIndex, viewMode, showGrid, zoom]);

  return {
    // State
    sections,
    selectedId,
    selectedType,
    viewMode,
    showGrid,
    zoom,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    
    // Setters
    setViewMode,
    setShowGrid,
    setZoom,
    
    // Actions
    addSection,
    removeSection,
    duplicateSection,
    moveSection,
    updateSection,
    addComponent,
    removeComponent,
    duplicateComponent,
    moveComponent,
    updateComponent,
    updateComponentStyle,
    addChildComponent,
    updateChildComponent,
    removeChildComponent,
    findComponent,
    selectItem,
    clearSelection,
    undo,
    redo,
    loadSections,
    getState,
  };
}
