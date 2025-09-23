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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-8">
          {/* Back button */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/80 transition-colors" 
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
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center gap-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <SettingsIcon className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Manage your account settings and preferences with ease. Keep your profile secure and up-to-date.
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Settings - Takes 2 columns on large screens */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Change Email Card */}
                <Card className="group hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:-translate-y-1">
                  <Link href="/settings/change-email" className="block" data-testid="link-change-email">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300 shadow-lg">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Change Email</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Update your email address for account notifications and login
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* Change Password Card */}
                <Card className="group hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:-translate-y-1">
                  <Link href="/settings/change-password" className="block" data-testid="link-change-password">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700 transition-all duration-300 shadow-lg">
                            <Lock className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Change Password</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* Help Card */}
                <Card className="group hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 cursor-pointer border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:-translate-y-1">
                  <Link href="/settings/help" className="block" data-testid="link-help">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700 transition-all duration-300 shadow-lg">
                            <HelpCircle className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">Help & Support</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Get help and support for your account
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>

                {/* About Us Card */}
                <Card className="group hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm hover:-translate-y-1">
                  <Link href="/settings/about" className="block" data-testid="link-about">
                    <CardHeader className="space-y-3 pb-4">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-lg">
                            <Info className="h-5 w-5 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">About Us</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all duration-300" />
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400">
                        Learn more about AI Storage Solution and our mission
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Quick Actions Sidebar - Takes 1 column on large screens */}
            <div className="space-y-6">
              <Card className="border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Common settings and account actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors" 
                    asChild 
                    data-testid="button-edit-profile"
                  >
                    <Link href="/settings/edit-profile" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors" 
                    asChild 
                    data-testid="button-help"
                  >
                    <Link href="/settings/help" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                        <HelpCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span>Get Help</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors" 
                    asChild 
                    data-testid="button-about"
                  >
                    <Link href="/settings/about" className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
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