/* ==================================================================
   Who may do what.

   These rules are checked inside the data store, not just in the UI.
   Hiding a button is not security: a trainer who opens the console or
   edits the URL still cannot add a student, touch payments or see
   somebody else's records, because every store function asks here first.

   Roles are fixed for this prototype. A real system would load them
   from the server with the signed-in user.
   ================================================================== */

export const ROLES = {
  admin: {
    label: 'Admin Portal',
    /* the admin runs the school and may do everything */
    can: () => true,
  },
  trainer: {
    label: 'Trainer Portal',
    allow: new Set([
      'students.read.assigned',   // only their own students
      'lessons.read.assigned',    // only their own classes
      'lesson.start',
      'lesson.complete',
      'attendance.mark',
      'evaluation.add',
      'schedule.request',         // ask the admin, never edit directly
      'profile.read.self',
    ]),
    can(action){ return this.allow.has(action); },
  },
};

export class PermissionError extends Error {
  constructor(action){
    super('You do not have permission to do that.');
    this.name = 'PermissionError';
    this.action = action;
  }
}

/** The person using the app right now. Set once at sign-in. */
let actor = { role: 'admin', instructorId: null, name: '' };

export function setActor(next){
  actor = next && ROLES[next.role] ? { ...next } : { role:'admin', instructorId:null, name:'' };
}
export const getActor = () => ({ ...actor });
export const isTrainer = () => actor.role === 'trainer';
export const isAdmin = () => actor.role === 'admin';
export const roleLabel = () => ROLES[actor.role]?.label || '';

export function can(action){
  const role = ROLES[actor.role];
  return role ? role.can(action) : false;
}
/** Throws unless the current role is allowed. Used by the store. */
export function require(action){
  if (!can(action)) throw new PermissionError(action);
}
/** A trainer may only touch records that belong to them. */
export function requireOwnInstructor(instructorId, action){
  if (!isTrainer()) return;
  if (instructorId !== actor.instructorId) throw new PermissionError(action);
}
