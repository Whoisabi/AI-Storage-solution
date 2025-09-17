import { ChevronRight, Home, Folder, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/hooks/useNavigation";

export default function Breadcrumb() {
  const { currentLocation, navigateTo, navigateToRoot } = useNavigation();

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      navigateToRoot();
      return;
    }

    const targetPath = currentLocation.path.slice(0, index + 1);
    const target = targetPath[targetPath.length - 1];
    
    navigateTo({
      type: target.type as 'root' | 'folder' | 's3-bucket' | 's3-prefix',
      id: target.id,
      name: target.name,
      bucketName: target.bucketName,
      prefix: target.prefix,
      path: targetPath
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'root':
        return <Home className="h-4 w-4" />;
      case 'folder':
        return <Folder className="h-4 w-4" />;
      case 's3-bucket':
        return <Database className="h-4 w-4" />;
      case 's3-prefix':
        return <Folder className="h-4 w-4" />;
      default:
        return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4" data-testid="breadcrumb-nav">
      {currentLocation.path.map((item, index) => (
        <div key={`${item.type}-${item.id || 'root'}`} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBreadcrumbClick(index)}
            className={`flex items-center space-x-2 hover:text-gray-900 ${
              index === currentLocation.path.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600'
            }`}
            data-testid={`breadcrumb-item-${index}`}
          >
            {getIcon(item.type)}
            <span>{item.name}</span>
          </Button>
        </div>
      ))}
    </nav>
  );
}