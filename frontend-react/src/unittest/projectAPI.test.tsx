import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mocked } from 'vitest'; 
import axios from 'axios';
import {
    getAllProjectAPI,
    getProjectByIdAPI,
    createProjectAPI,
    updateProjectAPI,
    deleteProjectAPI,
} from '../api/projectAPI';
import type { ProjectResponse, CreateProjectRequest, UpdateProjectRequest } from '../api/projectAPI';

// 1. Mock axios hoàn toàn
vi.mock('axios');
const mockedAxios = axios as Mocked<typeof axios>;

describe('projectAPI', () => {
    const mockToken = 'fake-jwt-token';

    const mockProject: ProjectResponse = {
        projectId: 1,
        projectCode: 'PRJ001',
        projectName: 'Test Project',
        projectStatusId: 2,
        projectStatusName: 'In Progress',
        expectedStartDate: '2026-01-01T00:00:00',
        expectedEndDate: '2026-06-30T00:00:00',
        workProgress: 45,
        projectDeleteStatus: false,
        authorFullName: 'John Doe',
        memberAuthorId: 5,
    };

    const mockProjects: ProjectResponse[] = [mockProject];

    beforeEach(() => {
        vi.clearAllMocks();

        // 2. Mock localStorage.getItem trả về token
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
            if (key === 'token') return mockToken;
            return null;
        });

        // 3. QUAN TRỌNG: Spy console.error để sửa lỗi "is not a spy"
        // mockImplementation(() => {}) giúp ẩn các log lỗi đỏ chót khi chạy test
        vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    describe('getAllProjectAPI', () => {
        it('should fetch all projects successfully', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockProjects });

            const result = await getAllProjectAPI();

            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5075/api/project', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });
            expect(result).toEqual(mockProjects);
        });

        it('should throw error and log to console when API fails', async () => {
            const error = new Error('Network Error');
            mockedAxios.get.mockRejectedValue(error);

            // Kiểm tra xem hàm có ném ra lỗi không
            await expect(getAllProjectAPI()).rejects.toThrow('Network Error');
            
            // Kiểm tra xem console.error có được gọi với đúng nội dung không
            expect(console.error).toHaveBeenCalledWith('Error getting all project', error);
        });
    });

    describe('getProjectByIdAPI', () => {
        it('should fetch project by id successfully', async () => {
            mockedAxios.get.mockResolvedValue({ data: mockProject });

            const result = await getProjectByIdAPI(1);

            expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:5075/api/project/1', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });
            expect(result).toEqual(mockProject);
        });

        it('should throw error when API fails', async () => {
            const error = new Error('Not found');
            mockedAxios.get.mockRejectedValue(error);

            await expect(getProjectByIdAPI(999)).rejects.toThrow('Not found');
        });
    });

    describe('createProjectAPI', () => {
        const createRequest: CreateProjectRequest = {
            projectCode: 'PRJ003',
            projectName: 'New Project',
            projectStatusId: 1,
            expectedStartDate: '2026-03-01',
            expectedEndDate: '2026-12-31',
            memberAuthorId: 5,
        };

        it('should create project successfully', async () => {
            const createdProject = { ...mockProject, projectId: 3, projectName: 'New Project' };
            mockedAxios.post.mockResolvedValue({ data: createdProject });

            const result = await createProjectAPI(createRequest);

            expect(mockedAxios.post).toHaveBeenCalledWith(
                'http://localhost:5075/api/project/create',
                createRequest,
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
            expect(result).toEqual(createdProject);
        });

        it('should throw error when create fails', async () => {
            const error = new Error('Bad request');
            mockedAxios.post.mockRejectedValue(error);

            await expect(createProjectAPI(createRequest)).rejects.toThrow('Bad request');
        });
    });

    describe('updateProjectAPI', () => {
        const updateRequest: UpdateProjectRequest = {
            projectCode: 'PRJ001-UPDATED',
            projectName: 'Updated Project',
            projectStatusId: 3,
            workProgress: 60,
        };

        it('should update project successfully', async () => {
            const updatedProject = { ...mockProject, projectName: 'Updated Project', workProgress: 60 };
            mockedAxios.patch.mockResolvedValue({ data: updatedProject });

            const result = await updateProjectAPI(1, updateRequest);

            expect(mockedAxios.patch).toHaveBeenCalledWith(
                'http://localhost:5075/api/project/update/1',
                updateRequest,
                { headers: { Authorization: `Bearer ${mockToken}` } }
            );
            expect(result).toEqual(updatedProject);
        });

        it('should throw error when update fails', async () => {
            const error = new Error('Conflict');
            mockedAxios.patch.mockRejectedValue(error);

            await expect(updateProjectAPI(1, updateRequest)).rejects.toThrow('Conflict');
        });
    });

    describe('deleteProjectAPI', () => {
        it('should delete project successfully (return true)', async () => {
            mockedAxios.delete.mockResolvedValue({ data: true });

            const result = await deleteProjectAPI(1);

            expect(mockedAxios.delete).toHaveBeenCalledWith('http://localhost:5075/api/project/delete/1', {
                headers: { Authorization: `Bearer ${mockToken}` },
            });
            expect(result).toBe(true);
        });

        it('should return false if project not found (but no throw)', async () => {
            mockedAxios.delete.mockResolvedValue({ data: false });

            const result = await deleteProjectAPI(999);

            expect(result).toBe(false);
        });

        it('should throw error on network failure', async () => {
            const error = new Error('Network timeout');
            mockedAxios.delete.mockRejectedValue(error);

            await expect(deleteProjectAPI(1)).rejects.toThrow('Network timeout');
        });
    });

    describe('token handling', () => {
        it('should send null token if not in localStorage', async () => {
            // Ghi đè mock getItem cho trường hợp này
            vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);

            mockedAxios.get.mockResolvedValue({ data: mockProjects });

            await getAllProjectAPI();

            expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
                headers: { Authorization: 'Bearer null' },
            });
        });
    });
});