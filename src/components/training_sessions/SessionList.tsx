import React from 'react';
import { TrainingSession } from '@/types/training_session';
import SessionCard from './SessionCard';
import EmptyState from './EmptyState';

interface SessionListProps {
  sessions: TrainingSession[];
  isFiltered: boolean;
  onViewSession: (session: TrainingSession) => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, isFiltered, onViewSession }) => {
  if (sessions.length === 0) {
    return (
      <EmptyState 
        message={isFiltered ? "No sessions match your filters" : "No training sessions found"} 
        ctaText={isFiltered ? "Clear filters" : "Start Training"}
        onCtaClick={isFiltered ? () => window.location.reload() : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} onViewSession={onViewSession} />
      ))}
    </div>
  );
};

export default SessionList;