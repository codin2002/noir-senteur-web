
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, User } from 'lucide-react';

interface ProfileTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  children, 
  defaultValue = "history" 
}) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
        <TabsTrigger value="history" className="data-[state=active]:bg-gold data-[state=active]:text-darker">
          <History className="h-4 w-4 mr-2" />
          Purchase History
        </TabsTrigger>
        <TabsTrigger value="account" className="data-[state=active]:bg-gold data-[state=active]:text-darker">
          <User className="h-4 w-4 mr-2" />
          Account Details
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default ProfileTabs;
