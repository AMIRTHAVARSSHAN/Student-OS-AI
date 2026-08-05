import Dexie, { type Table } from 'dexie';

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  updatedAt: string;
  isSynced: boolean;
}

export interface LocalAttendance {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent' | 'cancelled' | 'holiday';
  period: number;
  isSynced: boolean;
}

export interface LocalStudyBlock {
  id: string;
  planId: string;
  subjectId: string;
  date: string;
  topic: string;
  isCompleted: boolean;
}

export class ScholarOSOfflineDB extends Dexie {
  notes!: Table<LocalNote>;
  attendance!: Table<LocalAttendance>;
  studyBlocks!: Table<LocalStudyBlock>;

  constructor() {
    super('ScholarOS');
    this.version(1).stores({
      notes: 'id, subjectId, updatedAt, isSynced',
      attendance: 'id, subjectId, date, isSynced',
      studyBlocks: 'id, planId, date, isCompleted'
    });
  }
}

export const offlineDb = new ScholarOSOfflineDB();
