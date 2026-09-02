import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function ProgressPage() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          My Progress
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your cognitive activity and performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Progress tracking coming soon in Phase 6.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}