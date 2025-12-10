import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PlantCardSkeleton() {
  return (
    <Card className="h-full bg-card border-border flex flex-col">
      <CardHeader className="p-2 sm:p-4 pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-1 sm:gap-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="w-5 h-5 sm:w-8 sm:h-8 rounded-md flex-shrink-0" />
        </div>
        <Skeleton className="hidden sm:block h-3 w-1/2 mt-1" />
      </CardHeader>
      
      <CardContent className="flex-grow space-y-2 sm:space-y-3 p-2 sm:p-4 pt-0">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12 hidden sm:inline-flex" />
        </div>
        
        <div className="bg-muted/50 rounded-md sm:rounded-lg p-1.5 sm:p-3 space-y-2">
           <Skeleton className="h-4 w-20" />
           <Skeleton className="h-3 w-full" />
           <Skeleton className="h-3 w-full hidden sm:block" />
        </div>

        <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>

        <Skeleton className="h-3 w-24 pt-1" />
      </CardContent>
      
      <CardFooter className="p-2 sm:p-4 pt-0">
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  );
}