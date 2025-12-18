import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { CategoriesTab } from '../resources/tabs/CategoriesTab';
import { ResourcesTab } from '../resources/tabs/ResourcesTab';
import { FeaturesTab } from '../resources/tabs/FeaturesTab';
import { OverviewTab } from '../resources/tabs/OverviewTab';

export function ResourcesScreen() {
  const [activeTab, setActiveTab] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [tabResetKey, setTabResetKey] = useState(0);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCategoryFilter(undefined);
    setTabResetKey(prev => prev + 1); // Força re-render da tab
  };

  useEffect(() => {
    const handleNavigateToResources = (e: CustomEvent) => {
      if (e.detail && e.detail.categoryId) {
        setCategoryFilter(e.detail.categoryId);
      } else {
        setCategoryFilter(undefined);
      }
      setActiveTab('resources');
    };

    const handleNavigateToFeatures = (e: CustomEvent) => {
      if (e.detail && e.detail.categoryId) {
        setCategoryFilter(e.detail.categoryId);
      } else {
        setCategoryFilter(undefined);
      }
      setActiveTab('features');
    };

    const handleNavigateFromOverview = (e: CustomEvent) => {
      if (e.detail && e.detail.tab) {
        setCategoryFilter(undefined);
        setActiveTab(e.detail.tab);
      }
    };

    window.addEventListener('navigateToResources', handleNavigateToResources as EventListener);
    window.addEventListener('navigateToFeatures', handleNavigateToFeatures as EventListener);
    window.addEventListener('navigateFromOverview', handleNavigateFromOverview as EventListener);

    return () => {
      window.removeEventListener('navigateToResources', handleNavigateToResources as EventListener);
      window.removeEventListener('navigateToFeatures', handleNavigateToFeatures as EventListener);
      window.removeEventListener('navigateFromOverview', handleNavigateFromOverview as EventListener);
    };
  }, []);

  return (
    <div className="w-full p-6 space-y-6">

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="flex w-full min-w-max gap-2 rounded-lg border bg-muted/50 p-1">
            <TabsTrigger value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="categories">
              Categorias
            </TabsTrigger>
            <TabsTrigger value="resources">
              Recursos
            </TabsTrigger>
            <TabsTrigger value="features">
              Features
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="w-full">
          <OverviewTab key={`overview-${tabResetKey}`} />
        </TabsContent>

        <TabsContent value="categories" className="w-full">
          <CategoriesTab key={`categories-${tabResetKey}`} />
        </TabsContent>

        <TabsContent value="resources" className="w-full">
          <ResourcesTab key={`resources-${tabResetKey}`} initialCategoryFilter={categoryFilter} />
        </TabsContent>

        <TabsContent value="features" className="w-full">
          <FeaturesTab key={`features-${tabResetKey}`} initialCategoryFilter={categoryFilter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}