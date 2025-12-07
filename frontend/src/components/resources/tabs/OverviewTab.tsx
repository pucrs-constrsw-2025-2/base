import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Folder,
  Monitor,
  Settings,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Wrench,
} from 'lucide-react';
import { Category, Resource, Feature } from '../../../types/resources';
import { toast } from 'sonner';
import resourcesApiService from '../../../services/api/resources-api.service';

export function OverviewTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, resourcesData, featuresData] = await Promise.all([
        resourcesApiService.categories.list(),
        resourcesApiService.resources.list(),
        resourcesApiService.features.list(),
      ]);
      
      setCategories(categoriesData);
      setResources(resourcesData);
      setFeatures(featuresData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (tab: string) => {
    const event = new CustomEvent('navigateFromOverview', { detail: { tab } });
    window.dispatchEvent(event);
  };

  // Calcular estatísticas reais a partir dos dados da API
  const stats = useMemo(() => {
    const totalCategories = categories.length;
    const totalResources = resources.length;
    const totalFeatures = features.length;
    
    // Calcular taxa de utilização (recursos ativos / total)
    const activeResources = resources.filter(r => r.status === true).length;
    const utilizationRate = totalResources > 0 
      ? Math.round((activeResources / totalResources) * 100) 
      : 0;

    return [
      {
        label: 'Total de Categorias',
        value: String(totalCategories),
        icon: Folder,
        color: 'bg-blue-500',
        trend: `${totalCategories} categorizadas`,
        tab: 'categories',
      },
      {
        label: 'Total de Recursos',
        value: String(totalResources),
        icon: Monitor,
        color: 'bg-green-500',
        trend: `${totalResources} cadastrados`,
        tab: 'resources',
      },
      {
        label: 'Features Cadastradas',
        value: String(totalFeatures),
        icon: Settings,
        color: 'bg-purple-500',
        trend: `${totalFeatures} disponíveis`,
        tab: 'features',
      },
      {
        label: 'Taxa de Utilização',
        value: `${utilizationRate}%`,
        icon: TrendingUp,
        color: 'bg-orange-500',
        trend: `${activeResources} em uso`,
        tab: 'resources',
      },
    ];
  }, [categories, resources, features]);

  const statusData = useMemo(() => {
    const active = resources.filter(r => r.status === true).length;
    const inactive = resources.filter(r => r.status === false).length;

    return [
      {
        status: 'Disponível',
        count: active,
        icon: CheckCircle,
        color: 'bg-green-600 text-white',
      },
      {
        status: 'Em Uso',
        count: 0,
        icon: AlertCircle,
        color: 'bg-blue-600 text-white',
      },
      {
        status: 'Manutenção',
        count: 0,
        icon: Wrench,
        color: 'bg-orange-600 text-white',
      },
      {
        status: 'Indisponível',
        count: inactive,
        icon: XCircle,
        color: 'bg-red-600 text-white',
      },
    ];
  }, [resources]);

  const recentResources = useMemo(() => {
    // Pegar os últimos 4 recursos ordenados por data de criação
    return resources
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 4)
      .map(resource => {
        const category = categories.find(c => c.id === resource.categoryId);
        return {
          name: resource.name,
          category: category?.name || 'Sem categoria',
          status: resource.status ? 'Ativo' : 'Inativo',
          statusBool: resource.status,
          addedAt: resource.createdAt 
            ? new Date(resource.createdAt).toLocaleDateString('pt-BR')
            : 'Data não disponível',
        };
      });
  }, [resources, categories]);

  const statusColors: Record<string, string> = {
    Ativo: 'bg-green-600 text-white',
    Inativo: 'bg-red-600 text-white',
  };

  const statusLabels: Record<string, string> = {
    available: 'Disponível',
    'in-use': 'Em Uso',
    maintenance: 'Manutenção',
    unavailable: 'Indisponível',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando visão geral...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Overview</h2>
        <p className="text-muted-foreground">
          Visão geral dos recursos computacionais do sistema
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index}
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            onClick={() => handleNavigate(stat.tab)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`p-2 rounded-md ${stat.color}`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                {stat.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Status</CardTitle>
          <CardDescription>Status atual dos recursos cadastrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusData.map((item, index) => {
              const totalResources = resources.length;
              const percentage = totalResources > 0 
                ? ((item.count / totalResources) * 100).toFixed(0) 
                : '0';
              
              return (
                <div key={index} className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <item.icon className={`w-8 h-8 ${item.color.split(' ')[1]}`} />
                  </div>
                  <h3 className="font-medium">{item.status}</h3>
                  <p className="text-3xl font-bold text-primary">{item.count}</p>
                  <Badge className={item.color}>
                    {percentage}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Recentes</CardTitle>
          <CardDescription>Últimos recursos adicionados ao sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentResources.map((resource, index) => (
              <div key={index} className="flex items-start space-x-3 pb-4 border-b last:border-0">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{resource.name}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {resource.category}
                    </Badge>
                    <Badge className={`text-xs ${statusColors[resource.status]}`}>
                      {statusLabels[resource.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{resource.addedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
