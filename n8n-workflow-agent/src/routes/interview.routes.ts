import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { planNextQuestion } from '../agent/planner';
import {
  checkpoint,
  fillSlotsFromMessage,
  isReadyForApproval,
} from '../agent/fsm';
import {
  buildGovernance,
  buildMarkdown,
  generateN8NWorkflow,
} from '../agent/generator';
import type { SlotsPartial } from '../agent/schema';

interface SessionState {
  id: string;
  slots: SlotsPartial;
  approved: boolean;
  lastInteraction: number;
}

const SESSION_TTL_MS =
  (parseInt(process.env.SESSION_TTL_MINUTES ?? '60', 10) || 60) * 60 * 1000;

const sessions = new Map<string, SessionState>();

const getSession = (sessionId: string): SessionState | null => {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }
  if (Date.now() - session.lastInteraction > SESSION_TTL_MS) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
};

const saveSession = (session: SessionState) => {
  sessions.set(session.id, { ...session, lastInteraction: Date.now() });
};

const router = Router();

router.post('/interview/start', (_req, res) => {
  const sessionId = randomUUID();
  const question = planNextQuestion({});
  const session: SessionState = {
    id: sessionId,
    slots: {},
    approved: false,
    lastInteraction: Date.now(),
  };
  sessions.set(sessionId, session);
  res.status(201).json({ sessionId, question });
});

router.post('/interview/reply', (req, res) => {
  const { sessionId, message } = req.body as {
    sessionId?: string;
    message?: string;
  };
  if (!sessionId || typeof message !== 'string') {
    return res
      .status(400)
      .json({ error: 'sessionId e message são obrigatórios' });
  }
  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Sessão não encontrada ou expirada' });
  }

  const trimmed = message.trim();
  if (trimmed.toUpperCase() === 'APROVO') {
    if (!isReadyForApproval(session.slots)) {
      return res
        .status(400)
        .json({ error: 'Ainda faltam informações antes da aprovação' });
    }
    session.approved = true;
    saveSession(session);
    return res.json({
      message:
        'Aprovação registrada. Chame /interview/approve para gerar os artefatos.',
    });
  }

  const updatedSlots = fillSlotsFromMessage(session.slots, message);
  session.slots = updatedSlots;
  session.approved = false;
  saveSession(session);

  if (isReadyForApproval(updatedSlots)) {
    const resume = checkpoint(updatedSlots);
    return res.json({
      resumo: resume.resumo,
      lacunas: resume.lacunas,
      perguntas: ['Responda APROVO para gerar os artefatos.'],
    });
  }

  const next = planNextQuestion(updatedSlots);
  return res.json({ sessionId, question: next });
});

router.post('/interview/approve', (req, res) => {
  const { sessionId } = req.body as { sessionId?: string };
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId é obrigatório' });
  }
  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Sessão não encontrada ou expirada' });
  }
  const snapshot = session.slots;
  if (!isReadyForApproval(snapshot)) {
    const resume = checkpoint(snapshot);
    return res
      .status(400)
      .json({ error: 'Slots incompletos', pendencias: resume.lacunas });
  }
  if (!session.approved) {
    return res
      .status(400)
      .json({ error: 'Envie APROVO antes de gerar os artefatos' });
  }

  const filledSlots = snapshot;
  const documentationMd = buildMarkdown(filledSlots);
  const governanceMd = buildGovernance(filledSlots);
  const n8nJson = generateN8NWorkflow(filledSlots);

  sessions.delete(sessionId);

  return res.json({ documentationMd, governanceMd, n8nJson });
});

export default router;
