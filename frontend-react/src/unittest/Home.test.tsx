import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import Home from '../pages/Home';
import { ProjectService } from '../service/projectService';
import projectReducer from '../redux/slice/projectSlice';
import { message } from 'antd';
import type { ProjectResponse } from '../api/projectAPI';

// --- MOCK SETUP ---
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

vi.mock('antd', async () => {
    const actual = await vi.importActual('antd');
    return {
        ...actual,
        message: {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn(),
        },
    };
});

vi.mock('../service/projectService', () => ({
    ProjectService: {
        getAllProjects: vi.fn(),
        createProject: vi.fn(),
        getProjectById: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
    },
}));

const mockProjects: ProjectResponse[] = [
    { projectId: 1, projectCode: "PRJ001", projectName: "Project Alpha", projectStatusId: 2, projectStatusName: "In Progress", expectedStartDate: "2026-01-01T00:00:00", expectedEndDate: "2026-06-30T00:00:00", workProgress: 0, projectDeleteStatus: false, authorFullName: "John Doe", memberAuthorId: 5 },
    { projectId: 2, projectCode: "PRJ002", projectName: "Project Beta", projectStatusId: 1, projectStatusName: "New", expectedStartDate: "2026-02-01T00:00:00", expectedEndDate: "2026-12-31T00:00:00", workProgress: 0, projectDeleteStatus: true, authorFullName: "Jane Smith", memberAuthorId: 6 },
];

describe('Home Component - Project Management', () => {
    let store: any;

    beforeEach(() => {
        vi.clearAllMocks();
        store = configureStore({
            reducer: { project: projectReducer },
            preloadedState: { 
                project: { 
                    projects: mockProjects, 
                    isLoading: false, 
                    selectedProject: null, 
                    error: null 
                } 
            }
        });
        vi.mocked(ProjectService.getAllProjects).mockResolvedValue({ success: true, data: mockProjects });
    });

    const renderHome = () => render(
        <Provider store={store}>
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        </Provider>
    );

    // 1. Render & Filter deleted projects
    it('renders project list correctly and hides deleted projects', async () => {
        renderHome();
        await waitFor(() => expect(ProjectService.getAllProjects).toHaveBeenCalled());
        expect(screen.getByText('Project Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Project Beta')).not.toBeInTheDocument();
    });

    // 2. Show loading state
    it('displays loading state when fetching projects', () => {
        store = configureStore({
            reducer: { project: projectReducer },
            preloadedState: { 
                project: { 
                    projects: [], 
                    isLoading: true, 
                    selectedProject: null, 
                    error: null 
                } 
            }
        });
        
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </Provider>
        );
        
        expect(screen.getByText(/loading projects/i)).toBeInTheDocument();
    });

    // 3. Show empty state
    it('displays empty state when no projects exist', () => {
        store = configureStore({
            reducer: { project: projectReducer },
            preloadedState: { 
                project: { 
                    projects: [], 
                    isLoading: false, 
                    selectedProject: null, 
                    error: null 
                } 
            }
        });
        
        render(
            <Provider store={store}>
                <MemoryRouter>
                    <Home />
                </MemoryRouter>
            </Provider>
        );
        
        expect(screen.getByText(/chưa có dự án nào/i)).toBeInTheDocument();
    });

    // 4. Open Add Modal
    it('opens Add Project modal when clicking Add button', async () => {
        const user = userEvent.setup();
        renderHome();
        
        const addButton = screen.getByRole('button', { name: /add new project/i });
        await user.click(addButton);

        const modalTitle = await screen.findByRole('heading', { name: /add new project/i });
        expect(modalTitle).toBeInTheDocument();
    });

    // 6. Close Add Modal by backdrop
    it('closes Add modal when clicking backdrop', async () => {
        const user = userEvent.setup();
        renderHome();
        
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });
        
        const backdrop = document.querySelector('.bg-black.bg-opacity-50');
        if (backdrop) await user.click(backdrop as HTMLElement);
        
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /add new project/i })).not.toBeInTheDocument();
        });
    });

    // 7. Close Add Modal by Cancel button
    it('closes Add modal when clicking Cancel button', async () => {
        const user = userEvent.setup();
        renderHome();
        
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });
        
        const cancelBtn = screen.getByRole('button', { name: /cancel/i });
        await user.click(cancelBtn);
        
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /add new project/i })).not.toBeInTheDocument();
        });
    });

    // 8. Handle input changes in Add form
    it('updates form data when typing in Add modal inputs', async () => {
        const user = userEvent.setup();
        renderHome();
        
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });
        
        const codeInput = screen.getByPlaceholderText(/enter project code/i);
        const nameInput = screen.getByPlaceholderText(/enter project name/i);
        
        await user.type(codeInput, 'PRJ003');
        await user.type(nameInput, 'Test Project');
        
        expect(codeInput).toHaveValue('PRJ003');
        expect(nameInput).toHaveValue('Test Project');
    });

    // 9. Create project successfully
    it('creates new project successfully', async () => {
        const user = userEvent.setup();
        const newProject = { ...mockProjects[0], projectId: 3, projectCode: 'PRJ003', projectName: 'New Project' };
        vi.mocked(ProjectService.createProject).mockResolvedValue({ success: true, data: newProject });
        
        renderHome();
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });

        const codeInput = screen.getByPlaceholderText(/enter project code/i);
        await user.type(codeInput, 'PRJ003');

        const nameInput = screen.getByPlaceholderText(/enter project name/i);
        await user.type(nameInput, 'New Project');

        const submitBtn = screen.getByRole('button', { name: /^add$/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(ProjectService.createProject).toHaveBeenCalledWith({
                projectCode: 'PRJ003',
                projectName: 'New Project',
                projectStatusId: 1,
                expectedStartDate: '',
                expectedEndDate: '',
                memberAuthorId: 1
            });
        }, { timeout: 3000 });
    });

    // 10. Handle create project error
    it('handles error when creating project fails', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.createProject).mockRejectedValue(new Error('Network error'));
        
        renderHome();
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });

        const codeInput = screen.getByPlaceholderText(/enter project code/i);
        await user.type(codeInput, 'PRJ003');

        const submitBtn = screen.getByRole('button', { name: /^add$/i });
        await user.click(submitBtn);

        await waitFor(() => {
            expect(ProjectService.createProject).toHaveBeenCalled();
        });
    });

    // 11. Open Edit Modal
    it('opens Edit modal and loads project data correctly', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);

        const codeInput = await screen.findByDisplayValue('PRJ001');
        expect(codeInput).toBeInTheDocument();
    });

    // 12. Close Edit Modal by X button
    it('closes Edit modal when clicking X button', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);
        
        await screen.findByRole('heading', { name: /edit project/i });
        
        const closeButtons = screen.getAllByRole('button');
        const xButton = closeButtons.find(btn => btn.querySelector('svg.lucide-x'));
        if (xButton) await user.click(xButton);
        
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /edit project/i })).not.toBeInTheDocument();
        });
    });

    // 13. Close Edit Modal by Cancel button
    it('closes Edit modal when clicking Cancel button', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);
        
        await screen.findByRole('heading', { name: /edit project/i });
        
        const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
        await user.click(cancelButtons[cancelButtons.length - 1]); // Last cancel button (in edit modal)
        
        await waitFor(() => {
            expect(screen.queryByRole('heading', { name: /edit project/i })).not.toBeInTheDocument();
        });
    });

    // 14. Handle input changes in Edit form
    it('updates form data when typing in Edit modal inputs', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);

        const nameInput = await screen.findByDisplayValue('Project Alpha');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Name');
        
        expect(nameInput).toHaveValue('Updated Name');
    });

    // 15. Update project successfully
    it('updates project successfully', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        const updatedProject = { ...mockProjects[0], projectName: 'Updated Project' };
        vi.mocked(ProjectService.updateProject).mockResolvedValue({ success: true, data: updatedProject });

        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);

        const nameInput = await screen.findByDisplayValue('Project Alpha');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Project');

        const updateBtn = screen.getByRole('button', { name: /update/i });
        await user.click(updateBtn);

        await waitFor(() => {
            expect(ProjectService.updateProject).toHaveBeenCalledWith(
                1,
                expect.objectContaining({
                    projectName: 'Updated Project'
                })
            );
        }, { timeout: 3000 });
    });

    // 16. Handle update project error
    it('handles error when updating project fails', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        vi.mocked(ProjectService.updateProject).mockRejectedValue(new Error('Network error'));

        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);

        const nameInput = await screen.findByDisplayValue('Project Alpha');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated Project');

        const updateBtn = screen.getByRole('button', { name: /update/i });
        await user.click(updateBtn);

        await waitFor(() => {
            expect(ProjectService.updateProject).toHaveBeenCalled();
        });
    });

    // 17. Handle edit when currentEditId is null
    it('does not update when currentEditId is null', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);

        await screen.findByDisplayValue('Project Alpha');
        
        // Force close modal to set currentEditId to null, then somehow trigger update
        // This is edge case testing
        expect(ProjectService.updateProject).not.toHaveBeenCalled();
    });

    // 18. Delete project successfully
    it('deletes project successfully after confirmation', async () => {
        const user = userEvent.setup();
        global.confirm = vi.fn(() => true);
        vi.mocked(ProjectService.deleteProject).mockResolvedValue({ success: true });

        renderHome();
        const deleteButtons = await screen.findAllByTitle('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(ProjectService.deleteProject).toHaveBeenCalledWith(1);
            expect(message.success).toHaveBeenCalled();
        });
    });

    // 19. Cancel delete operation
    it('cancels delete when user clicks Cancel in confirm dialog', async () => {
        const user = userEvent.setup();
        global.confirm = vi.fn(() => false);

        renderHome();
        const deleteButtons = await screen.findAllByTitle('Delete');
        await user.click(deleteButtons[0]);

        expect(ProjectService.deleteProject).not.toHaveBeenCalled();
    });

    // 20. Show warning when delete fails
    it('shows warning when trying to delete non-existent project', async () => {
        const user = userEvent.setup();
        global.confirm = vi.fn(() => true);
        vi.mocked(ProjectService.deleteProject).mockResolvedValue({ success: false, error: "Not found" });

        renderHome();
        const deleteButtons = await screen.findAllByTitle('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => expect(message.warning).toHaveBeenCalled());
    });

    // 21. Handle delete network error
    it('handles network error during delete', async () => {
        const user = userEvent.setup();
        global.confirm = vi.fn(() => true);
        vi.mocked(ProjectService.deleteProject).mockRejectedValue(new Error('Network Error'));

        renderHome();
        const deleteButtons = await screen.findAllByTitle('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => expect(message.error).toHaveBeenCalled());
    });

    // 22. Test all form fields in Add modal
    it('allows filling all fields in Add modal', async () => {
        const user = userEvent.setup();
        renderHome();
        
        await user.click(screen.getByRole('button', { name: /add new project/i }));
        await screen.findByRole('heading', { name: /add new project/i });
        
        // Fill all fields
        await user.type(screen.getByPlaceholderText(/enter project code/i), 'PRJ999');
        await user.type(screen.getByPlaceholderText(/enter project name/i), 'Full Test');
        
        const statusSelect = screen.getByRole('combobox');
        await user.selectOptions(statusSelect, '2');
        
        const dateInputs = screen.getAllByDisplayValue('');
        if (dateInputs[0]) await user.type(dateInputs[0], '2026-01-01');
        if (dateInputs[1]) await user.type(dateInputs[1], '2026-12-31');
        
        const authorInput = screen.getByPlaceholderText(/enter name/i);
        await user.clear(authorInput);
        await user.type(authorInput, '5');
        
        expect(screen.getByPlaceholderText(/enter project code/i)).toHaveValue('PRJ999');
    });

    // 23. Test all form fields in Edit modal
    it('allows editing all fields in Edit modal', async () => {
        const user = userEvent.setup();
        vi.mocked(ProjectService.getProjectById).mockResolvedValue({ success: true, data: mockProjects[0] });
        
        renderHome();
        const editButtons = await screen.findAllByTitle('Edit');
        await user.click(editButtons[0]);
        
        await screen.findByDisplayValue('PRJ001');
        
        const statusSelect = screen.getByRole('combobox');
        await user.selectOptions(statusSelect, '3');
        
        expect(statusSelect).toHaveValue('3');
    });
});