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
  Lock
} from "lucide-react";

export default function Settings() {
  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change Email Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/settings/change-email" className="block">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Change Email
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Update your email address for account notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Change your login email address
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">⚠️</span>
                    Includes email confirmation
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Change Password Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/settings/change-password" className="block">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Change Password
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    Change your account password
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-4 h-4 flex items-center justify-center text-xs">🔐</span>
                    Secure password verification
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Help Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group">
            <Link href="/settings/help" className="block">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    Help
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Get help and support for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    Contact support team
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HelpCircle className="h-4 w-4" />
                    View FAQ and guides
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* About Us Card */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer group md:col-span-2">
            <Link href="/settings/about" className="block">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    About Us
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardTitle>
                <CardDescription>
                  Learn more about AI Storage Solution and our mission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Discover our story, technology stack, key features, and the team behind 
                  this modern cloud storage platform.
                </p>
              </CardContent>
            </Link>
          </Card>
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