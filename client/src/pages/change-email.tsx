import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { ArrowLeft, Mail, AlertTriangle } from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  confirmEmail: z.string().email("Please enter a valid email address"),
}).refine((data) => data.email === data.confirmEmail, {
  message: "Email addresses don't match",
  path: ["confirmEmail"],
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function ChangeEmail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingEmailData, setPendingEmailData] = useState<EmailFormData | null>(null);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
      confirmEmail: "",
    },
  });

  const updateEmailMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      return apiRequest('POST', '/api/auth/update-email', data);
    },
    onSuccess: () => {
      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      emailForm.reset();
      // Redirect back to settings page after successful update
      setTimeout(() => setLocation("/settings"), 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    },
  });

  const onEmailSubmit = (data: EmailFormData) => {
    setPendingEmailData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = () => {
    if (pendingEmailData) {
      updateEmailMutation.mutate({ email: pendingEmailData.email });
    }
    setShowConfirmDialog(false);
    setPendingEmailData(null);
  };

  const handleCancelChange = () => {
    setShowConfirmDialog(false);
    setPendingEmailData(null);
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="space-y-6">
        {/* Back button and header */}
        <div className="flex items-center space-x-4">
          <Link href="/settings">
            <Button variant="ghost" size="sm" data-testid="button-back">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
          </Link>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Change Email Address
          </h1>
          <p className="text-muted-foreground">
            Update your email address for account notifications and login.
          </p>
        </div>

        {/* Current Email Display */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Current Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm" data-testid="text-current-email">
                {user?.email || "No email set"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> After changing your email address, you'll need to use the new email to log in. 
            Make sure you have access to the new email address before proceeding.
          </AlertDescription>
        </Alert>

        {/* Email Update Card */}
        <Card>
          <CardHeader>
            <CardTitle>New Email Address</CardTitle>
            <CardDescription>
              Enter your new email address below. You'll need to confirm this change.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Enter your new email address"
                          data-testid="input-new-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={emailForm.control}
                  name="confirmEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Confirm your new email address"
                          data-testid="input-confirm-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  disabled={updateEmailMutation.isPending}
                  data-testid="button-update-email"
                >
                  {updateEmailMutation.isPending ? "Updating..." : "Update Email Address"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent data-testid="dialog-confirm-email-change">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Email Change</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You are about to change your email address from:</p>
              <div className="bg-muted p-2 rounded text-sm">
                <strong>Current:</strong> {user?.email}
              </div>
              <div className="bg-muted p-2 rounded text-sm">
                <strong>New:</strong> {pendingEmailData?.email}
              </div>
              <p className="text-sm text-amber-600 mt-2">
                <strong>Warning:</strong> You will need to use the new email address to log in after this change.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelChange}
              data-testid="button-cancel-email-change"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmChange}
              data-testid="button-confirm-email-change"
            >
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}