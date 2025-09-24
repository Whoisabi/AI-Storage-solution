import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cloud, Upload, Share, Shield, Users, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  const handleSignup = () => {
    window.location.href = "/signup";
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: 'cadetblue',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Header */}
    <header
      className="border-b border-gray-200 sticky top-0 z-50"
      style={{ backgroundColor: 'darkturquoise' }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Storage</h1>
                <p className="text-xs text-gray-500">Cloud Solution</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleLogin} variant="outline">
                Sign In
              </Button>
              <Button onClick={handleSignup} className="bg-primary hover:bg-blue-700">
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 flex-1 flex items-center justify-center">
        <div className="max-w-4xl w-full mx-auto text-center glass-card p-10 modern-shadow">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg">Intelligent Cloud  Storage
            <span className="text-primary block animate-pulse">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Securely store, manage, and share your files with advanced AI-powered organization. 
            Experience the future of cloud storage with seamless AWS S3 integration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSignup}
              className="modern-btn text-lg px-8 py-3"
            >
              Get Started Free
            </button>
            <button 
              className="modern-btn modern-3d text-lg px-8 py-3"
              style={{ background: 'linear-gradient(90deg, #fff 0%, #e0e7ff 100%)', color: '#6366f1', border: '2px solid #6366f1' }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
  <section className="py-20" style={{ backgroundColor: 'darkturquoise' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need for modern file management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built with cutting-edge technology to provide you with the most secure and efficient storage solution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drag & Drop Upload</h3>
                <p className="text-gray-600">
                  Simply drag and drop your files or folders for instant upload to secure cloud storage.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Sharing</h3>
                <p className="text-gray-600">
                  Generate secure, time-limited links to share files with anyone, anywhere.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                <p className="text-gray-600">
                  Military-grade encryption and AWS S3 infrastructure ensure your data is always protected.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                <p className="text-gray-600">
                  Work together with real-time file sharing and permission management.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Optimized for speed with global CDN delivery and instant file access.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card text-center p-6 hover:shadow-2xl transition-shadow modern-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
                <p className="text-gray-600">
                  Intelligent file organization and search powered by advanced AI algorithms.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'darkturquoise' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center glass-card modern-shadow">
          <h2 className="text-3xl font-bold mb-4 drop-shadow-lg" style={{ color: 'navy' }}>
            Ready to revolutionize your file storage?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'red' }}>
            Join thousands of users who trust AI Storage for their most important files.
          </p>
          <div style={{ padding: '1.5rem 0' }}>
            <button
              onClick={handleSignup}
              className="modern-btn text-lg"
              style={{ padding: '1rem 2.5rem' }}
            >
              Start Your Free Trial
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
    <footer
      className="text-white py-12 modern-shadow"
      style={{ backgroundColor: 'navy' }}
    >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AI Storage</span>
          </div>
          <p className="text-gray-400">
            © 2025 AI Storage Solution. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
