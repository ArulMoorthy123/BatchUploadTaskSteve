export const PLAN_TABS = [
  { id: 'plans', title: 'My Plans', uri: 'todoList' },
  { id: 'watch', title: 'Watch List', uri: 'watchlistTab' },
  { id: 'completed', title: 'Completed', uri: 'completedTab' },
];

export const PLAN_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
};

export const PLAN_FILTER = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export const PLAN_MESSAGES = {
  ADD_SUCCESS: 'Plan successfully created!',
  UPDATE_SUCCESS: 'Plan successfully updated!',
  DELETE_SUCCESS: 'Plan successfully deleted!',
  REQUIRED_ERROR: 'Some required field(s) is empty or invalid!',
  COMMON_ERROR: 'Sorry! There is a problem. Please try again later.',
  PLANS_EMPTY: 'You have no pending plans under this list!',
};
