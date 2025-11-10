"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Download,
  Calendar,
  Building2,
  RefreshCw
} from "lucide-react";

interface Survey {
  id: number;
  type: string;
  question: string;
  isActive: boolean;
  _count: {
    responses: number;
  };
}

interface SurveyResponse {
  id: number;
  response: any;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  company: {
    name: string;
  };
  survey: {
    question: string;
    type: string;
    options: any;
  };
}

export default function SurveyAnalytics() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // Buscar todas as surveys
      const surveysRes = await fetch("/api/surveys/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        // API retorna { surveys: [...] }
        setSurveys(Array.isArray(surveysData.surveys) ? surveysData.surveys : []);
      } else {
        console.error("Erro ao buscar surveys:", surveysRes.status);
        setSurveys([]);
      }

      // Buscar todas as respostas
      const responsesRes = await fetch("/api/surveys/responses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        // API retorna { responses: [...] }
        setResponses(Array.isArray(responsesData.responses) ? responsesData.responses : []);
      } else {
        console.error("Erro ao buscar respostas:", responsesRes.status);
        setResponses([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setSurveys([]);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const getTotalResponses = () => Array.isArray(responses) ? responses.length : 0;
  const getUniqueUsers = () => Array.isArray(responses) ? new Set(responses.map(r => r.user.email)).size : 0;
  const getUniqueCompanies = () => Array.isArray(responses) ? new Set(responses.map(r => r.company.name)).size : 0;

  const getSurveyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      QUANTITATIVE: "Quantitativa",
      SATISFACTION: "Satisfação",
      HEATMAP: "Mapa de Calor",
    };
    return labels[type] || type;
  };

  const getSurveyTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      QUANTITATIVE: "bg-blue-100 text-blue-700",
      SATISFACTION: "bg-green-100 text-green-700",
      HEATMAP: "bg-purple-100 text-purple-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const calculateSatisfactionStats = (surveyId: number) => {
    if (!Array.isArray(responses)) return null;
    
    const surveyResponses = responses.filter(r => r.survey.question === surveys.find(s => s.id === surveyId)?.question);
    
    if (surveyResponses.length === 0) return null;

    const satisfactionCounts: { [key: string]: number } = {
      "very-unsatisfied": 0,
      "unsatisfied": 0,
      "neutral": 0,
      "satisfied": 0,
      "very-satisfied": 0,
    };

    surveyResponses.forEach(r => {
      const value = r.response.satisfaction;
      if (satisfactionCounts[value] !== undefined) {
        satisfactionCounts[value]++;
      }
    });

    return satisfactionCounts;
  };

  const calculateQuantitativeStats = (surveyId: number) => {
    if (!Array.isArray(responses)) return { average: 0, distribution: {} };
    
    const surveyResponses = responses.filter(r => r.survey.question === surveys.find(s => s.id === surveyId)?.question);
    
    if (surveyResponses.length === 0) return { average: 0, distribution: {} };

    const scores = surveyResponses.map(r => r.response.score);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const distribution: { [key: number]: number } = {};
    scores.forEach(score => {
      distribution[score] = (distribution[score] || 0) + 1;
    });

    return { average: average.toFixed(1), distribution };
  };

  const calculateHeatmapStats = (surveyId: number) => {
    if (!Array.isArray(responses)) return {};
    
    const surveyResponses = responses.filter(r => r.survey.question === surveys.find(s => s.id === surveyId)?.question);
    
    if (surveyResponses.length === 0) return {};

    const areaCounts: { [key: string]: number } = {};
    
    surveyResponses.forEach(r => {
      const areas = r.response.areas || [];
      areas.forEach((area: string) => {
        areaCounts[area] = (areaCounts[area] || 0) + 1;
      });
    });

    return areaCounts;
  };

  const exportToCSV = () => {
    if (!Array.isArray(responses) || responses.length === 0) {
      alert("Nenhuma resposta disponível para exportar");
      return;
    }
    
    const csvRows = [
      ["Data", "Empresa", "Usuário", "Email", "Pergunta", "Tipo", "Resposta"],
      ...responses.map(r => [
        new Date(r.createdAt).toLocaleDateString("pt-BR"),
        r.company.name,
        r.user.name,
        r.user.email,
        r.survey.question,
        getSurveyTypeLabel(r.survey.type),
        JSON.stringify(r.response),
      ]),
    ];

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `survey-responses-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03BBAF]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#026876]">Analytics de Surveys</h1>
          <p className="text-gray-600 mt-2">
            Análise completa das respostas coletadas dos usuários
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchData}
            className="border-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={exportToCSV}
            className="bg-gradient-to-r from-[#026876] to-[#03BBAF] text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-[#026876]">{getTotalResponses()}</p>
              <MessageSquare className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-[#03BBAF]">{getUniqueUsers()}</p>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-[#03A0A]">{getUniqueCompanies()}</p>
              <Building2 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Surveys Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-orange-600">{surveys.filter(s => s.isActive).length}</p>
              <TrendingUp className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys List */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#03BBAF]" />
            Análise por Survey
          </CardTitle>
          <CardDescription>
            Clique em uma survey para ver detalhes das respostas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.isArray(surveys) && surveys.length > 0 ? (
            surveys.map((survey) => {
              const isSelected = selectedSurvey === survey.id;
            
            return (
              <div key={survey.id} className="space-y-4">
                <button
                  onClick={() => setSelectedSurvey(isSelected ? null : survey.id)}
                  className="w-full text-left p-4 border-2 rounded-lg hover:border-[#03BBAF] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getSurveyTypeColor(survey.type)}>
                          {getSurveyTypeLabel(survey.type)}
                        </Badge>
                        {survey.isActive && (
                          <Badge className="bg-green-100 text-green-700">Ativa</Badge>
                        )}
                      </div>
                      <p className="font-medium text-gray-900">{survey.question}</p>
                      <p className="text-sm text-gray-500">
                        {survey._count.responses} resposta{survey._count.responses !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-[#026876]">
                      {survey._count.responses}
                    </div>
                  </div>
                </button>

                {/* Details Section */}
                {isSelected && survey._count.responses > 0 && (
                  <div className="pl-4 border-l-4 border-[#03BBAF] space-y-4">
                    {survey.type === "SATISFACTION" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Distribuição de Satisfação</h4>
                        {(() => {
                          const stats = calculateSatisfactionStats(survey.id);
                          if (!stats) return null;
                          
                          const labels: { [key: string]: string } = {
                            "very-unsatisfied": "😢 Muito Insatisfeito",
                            "unsatisfied": "👎 Insatisfeito",
                            "neutral": "😐 Neutro",
                            "satisfied": "👍 Satisfeito",
                            "very-satisfied": "😄 Muito Satisfeito",
                          };

                          return (
                            <div className="space-y-2">
                              {Object.entries(stats).map(([key, count]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="text-sm w-40">{labels[key]}</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-6">
                                    <div
                                      className="bg-gradient-to-r from-[#026876] to-[#03BBAF] h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                      style={{ width: `${(count / survey._count.responses) * 100}%` }}
                                    >
                                      {count > 0 && count}
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-600 w-12 text-right">
                                    {((count / survey._count.responses) * 100).toFixed(0)}%
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {survey.type === "QUANTITATIVE" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Análise Quantitativa</h4>
                        {(() => {
                          const stats = calculateQuantitativeStats(survey.id);
                          
                          return (
                            <div className="space-y-4">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-4xl font-bold text-[#026876]">{stats.average}</p>
                                  <p className="text-sm text-gray-600">Média</p>
                                </div>
                                  <div className="flex-1">
                                  <div className="grid grid-cols-10 gap-1">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => {
                                      const distribution = stats.distribution as { [key: number]: number };
                                      const count = distribution[score] || 0;
                                      return (
                                        <div key={score} className="text-center">
                                          <div
                                            className="bg-gradient-to-t from-[#026876] to-[#03BBAF] rounded-t"
                                            style={{
                                              height: `${(count / survey._count.responses) * 100}px`,
                                              minHeight: count ? "20px" : "4px",
                                            }}
                                          ></div>
                                          <p className="text-xs text-gray-600 mt-1">{score}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {survey.type === "HEATMAP" && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Áreas Mais Clicadas</h4>
                        {(() => {
                          const stats = calculateHeatmapStats(survey.id);
                          const maxCount = Math.max(...Object.values(stats));
                          
                          return (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {Object.entries(stats)
                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                .map(([area, count]) => (
                                  <div
                                    key={area}
                                    className="p-3 rounded-lg border-2"
                                    style={{
                                      backgroundColor: `rgba(3, 187, 175, ${(count as number) / maxCount * 0.3})`,
                                      borderColor: `rgba(3, 187, 175, ${(count as number) / maxCount})`,
                                    }}
                                  >
                                    <p className="font-medium capitalize">{area}</p>
                                    <p className="text-2xl font-bold text-[#026876]">{count as number}</p>
                                    <p className="text-xs text-gray-600">
                                      {(((count as number) / survey._count.responses) * 100).toFixed(0)}% dos usuários
                                    </p>
                                  </div>
                                ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
          ) : (
            <p className="text-center text-gray-500 py-8">Nenhuma survey cadastrada</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Responses */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#03BBAF]" />
            Respostas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(responses) && responses.length > 0 ? (
              responses.slice(0, 10).map((response) => (
                <div key={response.id} className="p-3 border rounded-lg hover:border-[#03BBAF] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{response.user.name}</p>
                      <p className="text-sm text-gray-600">{response.company.name}</p>
                      <p className="text-sm text-gray-500">{response.survey.question}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getSurveyTypeColor(response.survey.type)}>
                        {getSurveyTypeLabel(response.survey.type)}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(response.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhuma resposta encontrada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
