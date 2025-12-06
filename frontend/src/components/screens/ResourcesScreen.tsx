import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Monitor, Plus, Tag, Sparkles } from 'lucide-react';
import { CategoriesTab } from '../resources/tabs/CategoriesTab';
import { ResourcesTab } from '../resources/tabs/ResourcesTab';
import { FeaturesTab } from '../resources/tabs/FeaturesTab';
import { OverviewTab } from '../resources/tabs/OverviewTab';

export function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="w-full p-6 space-y-6">
      <div className="rounded-xl border bg-card/50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 p-3">
            <Monitor className="h-7 w-7 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-[28px] font-semibold leading-tight">Recursos Computacionais</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie categorias, recursos e suas características em um só lugar.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setActiveTab('resources')}>
            <Plus className="mr-2 h-4 w-4" />
            Novo recurso
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('categories')}>
            <Tag className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('features')}>
            <Sparkles className="mr-2 h-4 w-4" />
            Nova feature
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="flex w-full min-w-max gap-2 rounded-lg border bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="w-full">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="categories" className="w-full">
          <CategoriesTab />
        </TabsContent>

        <TabsContent value="resources" className="w-full">
          <ResourcesTab />
        </TabsContent>

        <TabsContent value="features" className="w-full">
          <FeaturesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
