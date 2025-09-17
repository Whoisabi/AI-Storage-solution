import { createContext, useContext, useState, ReactNode } from 'react';

export interface NavigationLocation {
  type: 'root' | 'folder' | 's3-bucket';
  id?: number;
  name?: string;
  path: { type: string; id?: number; name: string }[];
}

interface NavigationContextType {
  currentLocation: NavigationLocation;
  navigateTo: (location: NavigationLocation) => void;
  navigateBack: () => void;
  navigateToRoot: () => void;
  isAtRoot: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState<NavigationLocation>({
    type: 'root',
    path: [{ type: 'root', name: 'My Files' }]
  });

  const navigateTo = (location: NavigationLocation) => {
    setCurrentLocation(location);
  };

  const navigateBack = () => {
    if (currentLocation.path.length > 1) {
      const newPath = [...currentLocation.path];
      newPath.pop();
      const parentLocation = newPath[newPath.length - 1];
      
      setCurrentLocation({
        type: parentLocation.type as 'root' | 'folder' | 's3-bucket',
        id: parentLocation.id,
        name: parentLocation.name,
        path: newPath
      });
    }
  };

  const navigateToRoot = () => {
    setCurrentLocation({
      type: 'root',
      path: [{ type: 'root', name: 'My Files' }]
    });
  };

  const isAtRoot = currentLocation.type === 'root';

  return (
    <NavigationContext.Provider value={{
      currentLocation,
      navigateTo,
      navigateBack,
      navigateToRoot,
      isAtRoot
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}