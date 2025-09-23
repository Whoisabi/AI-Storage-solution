import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Cloud, 
  Shield, 
  Zap, 
  Users, 
  Globe, 
  Database,
  Upload,
  Share2,
  BarChart3,
  Github,
  Mail,
  ExternalLink,
  ArrowLeft
} from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'cadetblue' }}>
      <div className="container max-w-6xl mx-auto py-10">
        <div className="space-y-12">
          {/* Back button */}
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="hover:bg-white/80 dark:hover:bg-gray-800/80" asChild data-testid="button-back">
              <Link href="/settings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Settings
              </Link>
            </Button>
          </div>

          {/* Enhanced Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight" style={{ backgroundColor: 'darkturquoise', borderRadius: '1rem', color: 'navy', padding: '1.5rem 0' }}>
              About AI Storage Solution
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              A modern, secure, and intelligent cloud storage platform built to simplify file management 
              and collaboration for individuals and teams. Experience the future of cloud storage today.
            </p>
          </div>

        {/* Mission Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              We believe that file storage and sharing should be simple, secure, and accessible from anywhere. 
              Our AI-powered storage solution combines cutting-edge technology with intuitive design to create 
              the ultimate cloud storage experience.
            </p>
            <p className="text-muted-foreground">
              Whether you're a creative professional managing large media files, a business team collaborating 
              on documents, or an individual looking to backup precious memories, AI Storage Solution provides 
              the tools and infrastructure you need to stay organized and productive.
            </p>
          </CardContent>
        </Card>

        {/* Key Features */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Upload className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Easy File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Drag-and-drop interface with support for multiple file types. 
                  Upload progress tracking and automatic organization.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Share2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Secure Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generate secure sharing links for files and folders. 
                  Control access permissions and track sharing activity.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comprehensive insights into your storage usage, file types, 
                  and sharing patterns with interactive charts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  End-to-end encryption, secure authentication, and 
                  compliance with industry security standards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Lightning-fast uploads and downloads powered by 
                  AWS S3 infrastructure and global CDN distribution.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Global Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Access your files from anywhere in the world with 
                  our responsive web interface and mobile-optimized design.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="h-6 w-6" />
              Technology Stack
            </CardTitle>
            <CardDescription>
              Built with modern, reliable technologies for optimal performance and scalability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Frontend</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">React 18</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Vite</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                  <Badge variant="secondary">shadcn/ui</Badge>
                  <Badge variant="secondary">TanStack Query</Badge>
                  <Badge variant="secondary">React Hook Form</Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Backend</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Express.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Passport.js</Badge>
                  <Badge variant="secondary">Drizzle ORM</Badge>
                  <Badge variant="secondary">Zod Validation</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Infrastructure</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">AWS S3</Badge>
                  <Badge variant="secondary">Replit Hosting</Badge>
                  <Badge variant="secondary">Docker Support</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">1TB</div>
              <p className="text-sm text-muted-foreground">Free Storage Space</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime Guarantee</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">256-bit</div>
              <p className="text-sm text-muted-foreground">AES Encryption</p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <p className="text-sm text-muted-foreground">Customer Support</p>
            </CardContent>
          </Card>
        </div>

        {/* Team and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Our Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                AI Storage Solution is developed by a dedicated team of engineers, designers, 
                and cloud infrastructure specialists who are passionate about creating 
                innovative storage solutions.
              </p>
              <p className="text-muted-foreground">
                We continuously work to improve our platform based on user feedback and 
                emerging technologies in the cloud storage space.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Have questions, suggestions, or want to collaborate? We'd love to hear from you.
              </p>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="/help" data-testid="link-help">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="https://github.com/replit" target="_blank" rel="noopener noreferrer" data-testid="link-github">
                    <Github className="h-4 w-4 mr-2" />
                    View on GitHub
                    <ExternalLink className="h-4 w-4 ml-auto" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              © 2024 AI Storage Solution. Built with ❤️ for the modern web.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Powered by React, Node.js, and AWS infrastructure.
            </p>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}