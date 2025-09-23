import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cloud, Mail, Lock, Loader2 } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Invalidate auth queries to refresh user data
        await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        navigate("/dashboard");
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 via-sky-200/30 to-cyan-200/30"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-sky-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-300/20 to-sky-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <Cloud className="h-8 w-8 text-white drop-shadow-sm" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur opacity-50 -z-10"></div>
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-black drop-shadow-sm">AI Storage</h1>
              <p className="text-sm text-white font-medium">Cloud Solution</p>
            </div>
          </div>
        </div>

        <Card className="w-full bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden">
          {/* Card Glass Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-3xl"></div>
          <CardHeader className="space-y-3 text-center relative z-10 pt-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">Welcome back</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 relative z-10 px-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200 z-10" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="relative h-14 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-lg focus:border-blue-400 dark:focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-lg"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 font-medium flex items-center mt-2">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors duration-200 z-10" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    className="relative h-14 pl-12 pr-4 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 rounded-xl shadow-sm focus:shadow-lg focus:border-purple-400 dark:focus:border-purple-500 transition-all duration-200 backdrop-blur-sm text-lg"
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 font-medium flex items-center mt-2">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-6 relative z-10 px-8 pb-8">
              <Button
                type="submit"
                className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold text-lg shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden"
                disabled={isLoading}
              >
                {/* 3D Button Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                <div className="flex items-center justify-center space-x-2 relative z-10">
                  {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
                  <span>{isLoading ? "Signing In..." : "Sign In"}</span>
                </div>
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">Don't have an account? </span>
                <Button
                  variant="link"
                  className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold hover:underline transition-colors duration-200"
                  onClick={() => navigate("/signup")}
                >
                  Sign up
                </Button>
              </div>
              
              <div className="text-center">
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                  onClick={() => navigate("/")}
                >
                  ← Back to home
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}