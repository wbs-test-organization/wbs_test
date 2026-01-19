import { setupServer } from 'msw/node';
import { Handlers } from './handlers';
import { projectHandlers } from './projectHandler';

export const server = setupServer(...Handlers, ...projectHandlers);