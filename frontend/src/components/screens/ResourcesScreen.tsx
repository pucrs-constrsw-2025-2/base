import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Monitor } from 'lucide-react';
import { CategoriesTab } from '../resources/tabs/CategoriesTab';
import { ResourcesTab } from '../resources/tabs/ResourcesTab';
import { FeaturesTab } from '../resources/tabs/FeaturesTab';
import { OverviewTab } from '../resources/tabs/OverviewTab';

export function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Monitor className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold">Recursos Computacionais</h1>
          <p className="text-muted-foreground">
            Gerencie categorias, recursos e suas características
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="resources">Recursos</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <ResourcesTab />
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}