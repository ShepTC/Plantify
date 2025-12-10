import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ShieldAlert, Bug, Droplets, Leaf, ShieldQuestion, BrainCircuit, Activity } from 'lucide-react';

const issueIcons = {
  healthy: <CheckCircle className="h-6 w-6 text-green-500" />,
  disease: <ShieldAlert className="h-6 w-6 text-red-500" />,
  pest: <Bug className="h-6 w-6 text-orange-500" />,
  nutrient_deficiency: <Droplets className="h-6 w-6 text-blue-500" />,
  default: <Leaf className="h-6 w-6 text-gray-500" />,
};

const confidenceColors = {
    High: "bg-green-100 text-green-800 border-green-300",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Low: "bg-orange-100 text-orange-800 border-orange-300",
};

export default function DiagnosisResult({ diagnosis, onReset, imagePreview }) {
  const { is_healthy, issue_name, issue_type, confidence, symptoms, treatment_steps, prevention_tips } = diagnosis;

  return (
    <div className="space-y-4">
      {/* Scanned Image */}
      {imagePreview && (
        <Card className="overflow-hidden border-border">
          <img 
            src={imagePreview} 
            alt="Scanned plant" 
            className="w-full h-48 object-cover"
          />
        </Card>
      )}

      {/* Main Result Card */}
      <Card className={`${is_healthy ? 'bg-gradient-to-br from-green-50/50 to-emerald-50/30 border-green-200/50 dark:from-green-900/20 dark:to-emerald-900/10 dark:border-green-800/50' : 'bg-gradient-to-br from-red-50/50 to-orange-50/30 border-red-200/50 dark:from-red-900/20 dark:to-orange-900/10 dark:border-red-800/50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              is_healthy 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-red-500 to-orange-600'
            }`}>
              {issueIcons[issue_type] || issueIcons.default}
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl text-foreground mb-1 leading-tight">{issue_name}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={`capitalize text-xs ${is_healthy ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                  {issue_type?.replace(/_/g, ' ')}
                </Badge>
                {confidence && (
                  <Badge className={`${confidenceColors[confidence]} text-xs`}>
                    <BrainCircuit className="mr-1 h-3 w-3" />
                    {confidence}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Symptoms */}
      {symptoms && symptoms.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Activity className="w-4 h-4 text-primary" /> What We Found
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {symptoms.slice(0, 4).map((symptom, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded-lg">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{symptom}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Treatment Steps */}
      {treatment_steps && treatment_steps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <Leaf className="w-4 h-4 text-primary" /> Treatment Plan
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {treatment_steps.slice(0, 4).map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-3 border border-primary/10">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm mb-1">{item.step}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Prevention Tips */}
      {prevention_tips && prevention_tips.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-base">
              <ShieldQuestion className="w-4 h-4 text-primary" /> Prevention Tips
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {prevention_tips.slice(0, 3).map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-blue-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="pt-2">
        <Button 
          onClick={onReset} 
          size="lg" 
          className="w-full h-12 font-semibold shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 focus:shadow-primary/50 transition-all duration-300 animate-pulse"
        >
          Scan Another Plant
        </Button>
      </div>
    </div>
  );
}