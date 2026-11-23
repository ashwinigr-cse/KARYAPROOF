import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useKaryaProofStore } from '../../hooks/useKaryaProofStore';
import { Modal } from '../ui/Modal';

interface CreateAssessmentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (assessmentId: string) => void;
}

interface DraftCriterion {
  title: string;
  description: string;
  required: boolean;
}

const DEFAULT_CRITERIA: DraftCriterion[] = [
  {
    title: 'Safety & Pre-Task Inspection',
    description: 'Verifies PPE, tools, and workspace hazards before commencing practical work.',
    required: true,
  },
  {
    title: 'Core Technique Execution',
    description: 'Demonstrates accurate sequence, handling, and control during task execution.',
    required: true,
  },
  {
    title: 'Post-Task Verification & Shutdown',
    description: 'Inspects completed output quality and leaves equipment in safe state.',
    required: true,
  },
];

export function CreateAssessmentModal({
  open,
  onClose,
  onCreated,
}: CreateAssessmentModalProps) {
  const { competencies, createAssessment } = useKaryaProofStore();

  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [useNewCompetency, setUseNewCompetency] = useState(false);
  const [selectedCompetency, setSelectedCompetency] = useState(competencies[0] || 'Welding Fundamentals');
  const [customCompetency, setCustomCompetency] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [criteria, setCriteria] = useState<DraftCriterion[]>(DEFAULT_CRITERIA);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCandidateName('');
    setCandidateEmail('');
    setUseNewCompetency(false);
    setSelectedCompetency(competencies[0] || 'Welding Fundamentals');
    setCustomCompetency('');
    setTaskTitle('');
    setTaskDescription('');
    setCriteria(DEFAULT_CRITERIA);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addCriterion = () => {
    setCriteria((prev) => [...prev, { title: '', description: '', required: true }]);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length <= 1) return;
    setCriteria((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, patch: Partial<DraftCriterion>) => {
    setCriteria((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!candidateName.trim()) {
      nextErrors.candidateName = 'Candidate name is required.';
    }
    if (!candidateEmail.trim()) {
      nextErrors.candidateEmail = 'Candidate email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail.trim())) {
      nextErrors.candidateEmail = 'Enter a valid email address.';
    }

    const activeCompetency = useNewCompetency ? customCompetency.trim() : selectedCompetency;
    if (!activeCompetency) {
      nextErrors.competency = 'Select or enter a competency.';
    }

    if (!taskDescription.trim()) {
      nextErrors.taskDescription = 'Task description is required.';
    }

    const validCriteria = criteria.filter((c) => c.title.trim().length > 0);
    if (validCriteria.length === 0) {
      nextErrors.criteria = 'Add at least one rubric criterion with a title.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const created = createAssessment({
      candidateName,
      candidateEmail,
      competency: activeCompetency,
      taskTitle: taskTitle.trim() || `${activeCompetency} Practical Demonstration`,
      taskDescription,
      rubricCriteria: validCriteria,
      isNewCompetency: useNewCompetency,
    });

    resetForm();
    onClose();
    if (onCreated) onCreated(created.id);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create practical assessment"
      subtitle="Define candidate details, task brief, and rubric criteria. Saved locally in browser storage."
      maxWidthClass="max-w-2xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="candidate-name" className="block text-xs font-medium text-zinc-700">
              Candidate full name <span className="text-red-600">*</span>
            </label>
            <input
              id="candidate-name"
              type="text"
              value={candidateName}
              onChange={(e) => {
                setCandidateName(e.target.value);
                setErrors((prev) => ({ ...prev, candidateName: '' }));
              }}
              placeholder="e.g., Rohan Kulkarni"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
            />
            {errors.candidateName && (
              <p className="mt-1 text-xs text-red-600">{errors.candidateName}</p>
            )}
          </div>

          <div>
            <label htmlFor="candidate-email" className="block text-xs font-medium text-zinc-700">
              Candidate email <span className="text-red-600">*</span>
            </label>
            <input
              id="candidate-email"
              type="email"
              value={candidateEmail}
              onChange={(e) => {
                setCandidateEmail(e.target.value);
                setErrors((prev) => ({ ...prev, candidateEmail: '' }));
              }}
              placeholder="rohan.kulkarni@example.edu"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
            />
            {errors.candidateEmail && (
              <p className="mt-1 text-xs text-red-600">{errors.candidateEmail}</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="competency-select" className="block text-xs font-medium text-zinc-700">
              Competency standard <span className="text-red-600">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setUseNewCompetency((v) => !v);
                setErrors((prev) => ({ ...prev, competency: '' }));
              }}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
            >
              {useNewCompetency ? 'Choose from presets' : '+ Create new competency'}
            </button>
          </div>

          {useNewCompetency ? (
            <input
              id="competency-select"
              type="text"
              value={customCompetency}
              onChange={(e) => {
                setCustomCompetency(e.target.value);
                setErrors((prev) => ({ ...prev, competency: '' }));
              }}
              placeholder="e.g., HVAC Refrigerant Recovery"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
            />
          ) : (
            <select
              id="competency-select"
              value={selectedCompetency}
              onChange={(e) => setSelectedCompetency(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none"
            >
              {competencies.map((comp) => (
                <option key={comp} value={comp}>
                  {comp}
                </option>
              ))}
            </select>
          )}
          {errors.competency && <p className="mt-1 text-xs text-red-600">{errors.competency}</p>}
        </div>

        <div>
          <label htmlFor="task-title" className="block text-xs font-medium text-zinc-700">
            Practical task title
          </label>
          <input
            id="task-title"
            type="text"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            placeholder="e.g., 3-Phase Motor Starter Wiring & Continuity Verification"
            className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="task-description" className="block text-xs font-medium text-zinc-700">
            Task description & required evidence <span className="text-red-600">*</span>
          </label>
          <textarea
            id="task-description"
            rows={3}
            value={taskDescription}
            onChange={(e) => {
              setTaskDescription(e.target.value);
              setErrors((prev) => ({ ...prev, taskDescription: '' }));
            }}
            placeholder="Describe the practical actions, safety procedures, and camera angles the learner must record..."
            className="mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none"
          />
          {errors.taskDescription && (
            <p className="mt-1 text-xs text-red-600">{errors.taskDescription}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-medium text-zinc-700">
                Assessment rubric criteria <span className="text-red-600">*</span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Each observation and final human judgment maps to these criteria.
              </p>
            </div>
            <button
              type="button"
              onClick={addCriterion}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add criterion</span>
            </button>
          </div>

          {errors.criteria && <p className="mt-1 text-xs text-red-600">{errors.criteria}</p>}

          <div className="mt-2.5 space-y-2.5">
            {criteria.map((crit, index) => (
              <div
                key={index}
                className="rounded-lg border border-zinc-200 bg-[#F8F8F6] p-3"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-2 font-mono text-[11px] font-medium text-zinc-400 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={crit.title}
                      onChange={(e) => updateCriterion(index, { title: e.target.value })}
                      placeholder="Criterion title"
                      aria-label={`Criterion ${index + 1} title`}
                      className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-900 focus:border-indigo-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={crit.description}
                      onChange={(e) => updateCriterion(index, { description: e.target.value })}
                      placeholder="Observable verification standard..."
                      aria-label={`Criterion ${index + 1} description`}
                      className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCriterion(index)}
                    disabled={criteria.length <= 1}
                    aria-label={`Remove criterion ${index + 1}`}
                    className="mt-1 rounded p-1.5 text-zinc-400 hover:bg-zinc-200/70 hover:text-zinc-700 disabled:opacity-35"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-zinc-200 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-xs transition-colors hover:bg-indigo-700"
          >
            Create assessment
          </button>
        </div>
      </form>
    </Modal>
  );
}
