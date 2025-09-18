import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  User, 
  HelpCircle, 
  Info, 
  Settings as SettingsIcon,
  ChevronRight,
  Mail,
  Lock,
  ArrowLeft
} from "lucide-react";

export default function Settings() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20">
      <div className="container max-w-4xl mx-auto py-10">
        <div className="space-y-8">
          {/* Back button */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="hover:bg-white/80 dark:hover:bg-gray-800/80" asChild data-testid="button-back">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Header section with enhanced styling */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <SettingsIcon className="h-10 w-10 text-blue-600" />
              Settings
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your account settings and preferences with ease. Keep your profile secure and up-to-date.
            </p>
          </div>

          {/* Settings Cards Grid with enhanced styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Change Email Card */}
            <Card className="hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Link href="/settings/change-email" className="block">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-lg font-semibold">Change Email</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Update your email address for account notifications and login
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-blue-500" />
                    Change your login email address
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">⚠️</span>
                    Includes email confirmation dialog
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Change Password Card */}
            <Card className="hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Link href="/settings/change-password" className="block">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
                        <Lock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className="text-lg font-semibold">Change Password</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 text-purple-500" />
                    Change your account password
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">🔐</span>
                    Secure password verification
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          {/* Secondary Features Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Help Card */}
            <Card className="hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer group border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Link href="/settings/help" className="block">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-800/40 transition-colors">
                        <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-lg font-semibold">Help & Support</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Get help and support for your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 text-green-500" />
                    Contact support team
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HelpCircle className="h-4 w-4 text-green-500" />
                    View FAQ and guides
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* About Us Card */}
            <Card className="hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <Link href="/settings/about" className="block">
                <CardHeader className="space-y-3">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-800/40 transition-colors">
                        <Info className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span className="text-lg font-semibold">About Us</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Learn more about AI Storage Solution and our mission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 text-orange-500" />
                    Company information & mission
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">🚀</span>
                    Technology and innovation
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common settings and account actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" asChild data-testid="button-edit-profile">
                <Link href="/settings/edit-profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              
              <Button variant="outline" asChild data-testid="button-help">
                <Link href="/settings/help" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Get Help
                </Link>
              </Button>
              
              <Button variant="outline" asChild data-testid="button-about">
                <Link href="/settings/about" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  About Us
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}