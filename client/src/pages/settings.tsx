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
    <div className="min-h-screen" style={{ backgroundColor: 'aqua' }}>
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Back button */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900 hover:bg-white/80 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800/80 transition-colors" 
              asChild 
              data-testid="button-back"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Header section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-settings-title">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account settings and preferences with ease. Keep your profile secure and up-to-date.
              </p>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Settings - Takes 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Change Email Card */}
                <Card className="group hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <Link href="/settings/change-email" className="block" data-testid="link-change-email">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Change Email</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Update your email address for account notifications and login
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* Change Password Card */}
                <Card className="group hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <Link href="/settings/change-password" className="block" data-testid="link-change-password">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <Lock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* Help Card */}
                <Card className="group hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <Link href="/settings/help" className="block" data-testid="link-help">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Get help and support for your account
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* About Us Card */}
                <Card className="group hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                  <Link href="/settings/about" className="block" data-testid="link-about">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <Info className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-lg font-semibold text-gray-900 dark:text-white">About Us</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        Learn more about AI Storage Solution and our mission
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Quick Actions Sidebar - Takes 1 column on large screens */}
            <div className="space-y-6">
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Common settings and account actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors" 
                    asChild 
                    data-testid="button-edit-profile"
                  >
                    <Link href="/settings/edit-profile" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors" 
                    asChild 
                    data-testid="button-help"
                  >
                    <Link href="/settings/help" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Get Help</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors" 
                    asChild 
                    data-testid="button-about"
                  >
                    <Link href="/settings/about" className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                        <Info className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <span>About Us</span>
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}