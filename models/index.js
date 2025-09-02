// Export all Mongoose models from a single file for easier imports
import User from './User.js';
import Inquiry from './Inquiry.js';
import Lead from './Lead.js';
import Proposal from './Proposal.js';
import Event from './Event.js';
import Session from './Session.js';

export {
  User,
  Inquiry,
  Lead,
  Proposal,
  Event,
  Session
};

// Collection names (for reference if needed)
export const COLLECTIONS = {
  USERS: 'users',
  INQUIRIES: 'inquiries',
  LEADS: 'leads',
  PROPOSALS: 'proposals',
  SESSIONS: 'sessions',
  EVENTS: 'events',
};