
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { adminOperations } from '@/utils/adminOperations';
import { useAuth } from '@/hooks/useAuth';

export function AdminAccessDebugger() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAdmin } = useAuth();

  const runAccessTest = async () => {
    setIsLoading(true);
    try {
      const result = await adminOperations.testAccess();
      setTestResult(result);
      console.log('Admin access test completed:', result);
    } catch (error) {
      console.error('Error running admin access test:', error);
      setTestResult({ success: false, error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Admin Access Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <span>Current User ID:</span>
          <Badge variant="outline">{user?.id || 'Not logged in'}</Badge>
        </div>
        
        <div className="flex items-center gap-4">
          <span>Is Admin (Frontend):</span>
          <Badge variant={isAdmin ? 'default' : 'destructive'}>
            {isAdmin ? 'Yes' : 'No'}
          </Badge>
        </div>

        <Button 
          onClick={runAccessTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Admin Access'}
        </Button>

        {testResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
