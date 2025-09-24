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
    <div className="min-h-screen bg-gradient-to-br from-cyan-300 via-cyan-400 to-cyan-500" style={{ backgroundColor: 'aqua' }}>
      <div className="container max-w-6xl mx-auto py-10">
        <div className="space-y-12">
          {/* Back button */}
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="default"
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-300 border-white/40 text-gray-700 hover:text-gray-900 min-w-[160px] h-11 font-medium" 
              asChild 
              data-testid="button-back"
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Enhanced Hero Section */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight" style={{ color: 'navy' }}>
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
        <div className="space-y-8 p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: 'beige' }}>
          <h2 className="text-3xl font-bold text-center text-gray-800 drop-shadow-lg mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Easy File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Drag-and-drop interface with support for multiple file types. 
                  Upload progress tracking and automatic organization.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Share2 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Secure Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Generate secure sharing links for files and folders. 
                  Control access permissions and track sharing activity.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Comprehensive insights into your storage usage, file types, 
                  and sharing patterns with interactive charts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Enterprise Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  End-to-end encryption, secure authentication, and 
                  compliance with industry security standards.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">High Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Lightning-fast uploads and downloads powered by 
                  AWS S3 infrastructure and global CDN distribution.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 rounded-2xl">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-800">Global Access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 leading-relaxed">
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
          <div className="text-center p-6 rounded-2xl shadow-lg" style={{ backgroundColor: 'cornflowerblue' }}>
            <div className="text-3xl font-bold text-white mb-2">1TB</div>
            <p className="text-white/90 font-medium">Free Storage Space</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl shadow-lg" style={{ backgroundColor: 'cornflowerblue' }}>
            <div className="text-3xl font-bold text-white mb-2">99.9%</div>
            <p className="text-white/90 font-medium">Uptime Guarantee</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl shadow-lg" style={{ backgroundColor: 'cornflowerblue' }}>
            <div className="text-3xl font-bold text-white mb-2">256-bit</div>
            <p className="text-white/90 font-medium">AES Encryption</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl shadow-lg" style={{ backgroundColor: 'cornflowerblue' }}>
            <div className="text-3xl font-bold text-white mb-2">24/7</div>
            <p className="text-white/90 font-medium">Customer Support</p>
          </div>
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
        <div className="p-8 rounded-3xl shadow-2xl" style={{ backgroundColor: 'navy' }}>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">AI Storage Solution</h3>
            </div>
            <p className="text-cyan-200 text-lg font-medium">
              © 2024 AI Storage Solution. Built with ❤️ for the modern web.
            </p>
            <p className="text-cyan-300 text-sm">
              Powered by React, Node.js, and AWS infrastructure.
            </p>
            <div className="flex justify-center space-x-4 mt-6">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}