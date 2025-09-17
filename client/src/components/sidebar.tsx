import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Cloud, 
  Home, 
  Folder, 
  Share, 
  BarChart3, 
  Settings, 
  LogOut 
} from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <aside className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Storage</h1>
            <p className="text-xs text-gray-500">Cloud Solution</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        {/* User Profile Section */}
        <div className="px-6 mb-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/10">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profileImageUrl || ""} alt="User avatar" />
              <AvatarFallback className="bg-primary text-white">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || "User"
                }
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Navigation Links */}
        <ul className="space-y-2 px-6">
          <li>
            <Link href="/" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location === "/" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}>
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/files" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location === "/files" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}>
              <Folder className="h-5 w-5" />
              <span>My Files</span>
            </Link>
          </li>
          <li>
            <Link href="/shared" className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
              location === "/shared" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
            }`}>
              <Share className="h-5 w-5" />
              <span>Shared</span>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </a>
          </li>
        </ul>
        
        {/* Logout Button */}
        <div className="mt-8 px-6">
          <Button 
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 p-3"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </nav>
    </aside>
  );
}
