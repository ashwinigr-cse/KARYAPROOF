import React, { useState } from 'react';
import { Award, ClipboardList, Lock, Send, Video } from 'lucide-react';
import { useKaryaProofStore } from '../hooks/useKaryaProofStore';

export function HelpSupportPage() {
  const { pushToast } = useKaryaProofStore();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSubmitted(true);
    setSubject('');
    setMessage('');
    pushToast(
      'Support inquiry recorded (demo)',
      'In production, this routes directly to the KARYAPROOF assessor support queue.',
      'success'
    );
  };

  const guides = [
    {
      icon: ClipboardList,
      title: 'How assessments work',
      body: 'Assessors or training councils define a practical task and observable rubric criteria for a trade competency. Learners complete the real-world task and submit recorded video evidence.',
    },
    {
      icon: Video,
      title: 'How evidence review works',
      body: 'Assistive AI indexes the video against rubric criteria and surfaces timestamped observations with confidence levels and uncertainty flags. Human assessors inspect the evidence, confirm or reject findings, and retain sole authority over the final decision.',
    },
    {
      icon: Award,
      title: 'How credentials are verified',
      body: 'When a human assessor marks a candidate Competent, a unique credential record (e.g., KP-2026-0001) and QR verification link are generated. Employers can open the public verification link to check authenticity.',
    },
    {
      icon: Lock,
      title: 'Privacy principles',
      body: 'Raw candidate video files, personal documents, and internal review deliberations are never exposed on public verification pages. Public routes expose only verified competency status and high-level assessment metadata.',
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-zinc-900">
          Help & Verification Guide
        </h2>
        <p className="text-xs text-zinc-500">
          Core principles and operational documentation for the KARYAPROOF platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {guides.map((g) => {
          const Icon = g.icon;
          return (
            <section
              key={g.title}
              className="rounded-xl border border-zinc-200 bg-white p-5 space-y-2"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-[#F8F8F6] text-indigo-600">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <h3 className="font-display text-sm font-semibold text-zinc-900">{g.title}</h3>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">{g.body}</p>
            </section>
          );
        })}
      </div>

      {/* Contact Support Placeholder */}
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h3 className="font-display text-sm font-semibold text-zinc-900">
          Contact Support (Demo Form)
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          Have questions about rubric calibration or verification standards? Send a test inquiry below.
        </p>

        {submitted && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            Your demo support message was logged locally. No external email was sent.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="help-subject" className="block text-xs font-medium text-zinc-700">
              Subject
            </label>
            <input
              id="help-subject"
              type="text"
              required
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setSubmitted(false);
              }}
              placeholder="e.g., Rubric criteria setup for CNC assessments"
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="help-message" className="block text-xs font-medium text-zinc-700">
              Details
            </label>
            <textarea
              id="help-message"
              rows={3}
              required
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setSubmitted(false);
              }}
              placeholder="Describe your question or issue..."
              className="mt-1.5 w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-800"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit inquiry</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
