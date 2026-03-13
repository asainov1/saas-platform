"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Megaphone,
  Users,
  Globe,
  Phone,
  BarChart3,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useOrganization } from "@/lib/providers/OrganizationProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coreApi } from "@/lib/api";
import { demoStore } from "@/lib/api/demo-store";
import { LLM_MODELS } from "@/lib/constants/models";

const agentTypes = [
  { id: "chatbot", name: "Чат-бот", description: "Автоматизация общения с клиентами", icon: MessageSquare },
  { id: "marketer", name: "Маркетолог", description: "Генерация контента и анализ рынка", icon: Megaphone },
  { id: "hr", name: "HR", description: "Подбор и оценка кандидатов", icon: Users },
  { id: "browser", name: "Браузерный", description: "Автоматизация веб-действий", icon: Globe },
  { id: "voice", name: "Голосовой", description: "Голосовое взаимодействие с клиентами", icon: Phone },
  { id: "analytics", name: "Аналитика", description: "Анализ данных и отчётность", icon: BarChart3 },
];

const steps = ["Тип агента", "Настройка"];

export default function NewAgentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentOrg } = useOrganization();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [model, setModel] = useState("gpt-4o");
  const [instructions, setInstructions] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!currentOrg) throw new Error("No organization");

      const input = { name: name || "Новый агент", type: selectedType, description };

      if (demoStore.isDemoMode()) {
        const agent = demoStore.createAgent(currentOrg.id, input);
        if (instructions) demoStore.createPrompt(agent.id, { type: "system", content: instructions });
        demoStore.createLLM(agent.id, { model });
        return agent;
      }

      const agent = await coreApi.createAgent(currentOrg.id, input);
      if (instructions) {
        await coreApi.createPrompt(agent.id, { type: "system", content: instructions });
      }
      await coreApi.createLLM(agent.id, { model });
      return agent;
    },
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      router.push(`/agents/${agent.id}`);
    },
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => (step > 0 ? setStep(step - 1) : router.push("/agents"))}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-zinc-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Создать агента</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Шаг {step + 1} из {steps.length}: {steps[step]}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-violet-600" : "bg-white/5"
              }`}
            />
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {agentTypes.map((type) => {
            const Icon = type.icon;
            const active = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`glass rounded-xl p-5 text-left transition-all ${
                  active
                    ? "ring-2 ring-violet-600 bg-violet-600/5"
                    : "hover:bg-white/[0.03]"
                }`}
              >
                <div
                  className={`p-2.5 rounded-lg w-fit mb-3 ${
                    active
                      ? "bg-violet-600/20 text-violet-400"
                      : "bg-white/5 text-zinc-400"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-medium text-white">{type.name}</p>
                <p className="text-sm text-zinc-500 mt-1">{type.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {step === 1 && (
        <Card>
          <div className="space-y-5">
            <Input
              label="Имя агента"
              placeholder="Мой AI-помощник"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Описание"
              placeholder="Краткое описание назначения агента"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-400">Модель</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-600/50"
              >
                {LLM_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-zinc-400">Инструкции</label>
              <textarea
                rows={5}
                placeholder="Опишите, как агент должен себя вести..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-600/50 resize-none"
              />
            </div>
            {createMutation.isError && (
              <p className="text-sm text-red-400">
                {createMutation.error instanceof Error ? createMutation.error.message : "Ошибка создания агента"}
              </p>
            )}
          </div>
        </Card>
      )}

      {step < 2 && (
        <div className="flex justify-end gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Назад
            </Button>
          )}
          <Button
            disabled={step === 0 && !selectedType}
            loading={createMutation.isPending}
            onClick={() => {
              if (step === 0) {
                setStep(1);
              } else {
                createMutation.mutate();
              }
            }}
          >
            {step === 1 ? "Создать" : "Далее"}
            {step === 0 && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
