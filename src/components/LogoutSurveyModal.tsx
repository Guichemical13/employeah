"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Smile, Meh, Frown, ThumbsUp, ThumbsDown } from "lucide-react";

interface SurveyModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip?: () => void;
}

export default function LogoutSurveyModal({ open, onClose, onComplete, onSkip }: SurveyModalProps) {
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchRandomSurvey();
    }
  }, [open]);

  const fetchRandomSurvey = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch("/api/surveys/random", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (data.survey) {
        setSurvey(data.survey);
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("Erro ao buscar pesquisa:", error);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!response || !survey) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const res = await fetch("/api/surveys/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          surveyId: survey.id,
          response,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Erro ao enviar resposta:', data);
      }

      onComplete();
    } catch (error) {
      console.error("Erro ao enviar resposta:", error);
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  const renderSurveyContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03BBAF]"></div>
        </div>
      );
    }

    if (!survey) {
      return null;
    }

    if (survey.type === "QUANTITATIVE") {
      return (
        <div className="space-y-4">
          <Label className="text-base">{survey.question}</Label>
          <div className="flex justify-between gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                onClick={() => setResponse({ score: num })}
                className={`w-10 h-10 rounded-lg border-2 font-bold transition-all ${
                  response?.score === num
                    ? "bg-[#03BBAF] text-white border-[#03BBAF] scale-110"
                    : "bg-white border-gray-300 hover:border-[#03BBAF] hover:scale-105"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Muito insatisfeito</span>
            <span>Muito satisfeito</span>
          </div>
        </div>
      );
    }

    if (survey.type === "SATISFACTION") {
      const satisfactionOptions = [
        { value: "very_dissatisfied", icon: Frown, label: "Muito insatisfeito", color: "#EF4444" },
        { value: "dissatisfied", icon: ThumbsDown, label: "Insatisfeito", color: "#F59E0B" },
        { value: "neutral", icon: Meh, label: "Neutro", color: "#6B7280" },
        { value: "satisfied", icon: ThumbsUp, label: "Satisfeito", color: "#10B981" },
        { value: "very_satisfied", icon: Smile, label: "Muito satisfeito", color: "#03BBAF" },
      ];

      return (
        <div className="space-y-6">
          <Label className="text-base">{survey.question}</Label>
          <div className="flex justify-around gap-4">
            {satisfactionOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = response?.satisfaction === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setResponse({ satisfaction: option.value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-[#03BBAF] bg-[#03BBAF]/10 scale-110"
                      : "border-gray-200 hover:border-[#03BBAF]/50 hover:scale-105"
                  }`}
                  style={isSelected ? { borderColor: option.color } : {}}
                >
                  <Icon size={32} color={isSelected ? option.color : "#9CA3AF"} />
                  <span className="text-xs font-medium text-center">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (survey.type === "HEATMAP") {
      const heatmapAreas = [
        { value: "navigation", label: "Navegação" },
        { value: "rewards", label: "Recompensas" },
        { value: "compliments", label: "Elogios" },
        { value: "notifications", label: "Notificações" },
        { value: "profile", label: "Perfil" },
        { value: "other", label: "Outro" },
      ];

      return (
        <div className="space-y-4">
          <Label className="text-base">{survey.question}</Label>
          <div className="grid grid-cols-2 gap-3">
            {heatmapAreas.map((area) => {
              const isSelected = response?.areas?.includes(area.value);
              return (
                <button
                  key={area.value}
                  onClick={() => {
                    const currentAreas = response?.areas || [];
                    const newAreas = isSelected
                      ? currentAreas.filter((a: string) => a !== area.value)
                      : [...currentAreas, area.value];
                    setResponse({ areas: newAreas });
                  }}
                  className={`p-4 rounded-xl border-2 font-medium transition-all ${
                    isSelected
                      ? "bg-[#03BBAF] text-white border-[#03BBAF]"
                      : "bg-white border-gray-300 hover:border-[#03BBAF] hover:bg-[#03BBAF]/5"
                  }`}
                >
                  {area.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Selecione as áreas que você mais utiliza (pode selecionar múltiplas)
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#026876]">
            Antes de sair... 🎯
          </DialogTitle>
          <DialogDescription className="text-base">
            Ajude-nos a melhorar! Sua opinião é muito importante para nós.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {renderSurveyContent()}
        </div>

        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip || onComplete}
            className="flex-1 border-gray-300 hover:border-[#026876]"
          >
            Pular
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!response || submitting}
            className="flex-1 bg-gradient-to-r from-[#026876] to-[#03BBAF] hover:from-[#026876]/90 hover:to-[#03BBAF]/90 text-white disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
