import { http, HttpResponse } from 'msw';
import { API_BASE_URL } from '../utils/constant';

// Dữ liệu mock giống như trong test của bạn
const mockProjects = [
  {
    projectId: 1,
    projectCode: "PRJ001",
    projectName: "Project Alpha",
    projectStatusId: 2,
    projectStatusName: "In Progress",
    expectedStartDate: "2026-01-01T00:00:00",
    expectedEndDate: "2026-06-30T00:00:00",
    workProgress: 0,
    projectDeleteStatus: false,
    authorFullName: "John Doe",
    memberAuthorId: 5,
    projectLeadId: 5,
  },
  {
    projectId: 2,
    projectCode: "PRJ002",
    projectName: "Project Beta",
    projectStatusId: 1,
    projectStatusName: "New",
    expectedStartDate: "2026-02-01T00:00:00",
    expectedEndDate: "2026-12-31T00:00:00",
    workProgress: 0,
    projectDeleteStatus: true,
    authorFullName: "Jane Smith",
    memberAuthorId: 6,
    projectLeadId: 6,
  },
];

const mockProjectStatuses = [
  { projectStatusId: 1, statusName: "New" },
  { projectStatusId: 2, statusName: "In Progress" },
  { projectStatusId: 3, statusName: "Completed" },
];

const mockMembers = [
  { memberId: 1, memberFullName: "Admin User" },
  { memberId: 5, memberFullName: "John Doe" },
  { memberId: 6, memberFullName: "Jane Smith" },
  { memberId: 7, memberFullName: "Current User" },
];

export const projectHandlers = [
  // GET /member - All members
  http.get(`${API_BASE_URL}/member`, () => {
    return HttpResponse.json(mockMembers, { status: 200 });
  }),

  // GET /projectstatus - All project statuses
  http.get(`${API_BASE_URL}/projectstatus`, () => {
    return HttpResponse.json(mockProjectStatuses, { status: 200 });
  }),

  // GET /projectstatus/:statusId - Project status by ID
  http.get(`${API_BASE_URL}/projectstatus/:statusId`, ({ params }) => {
    const statusId = Number(params.statusId);
    const status = mockProjectStatuses.find(s => s.projectStatusId === statusId);
    if (status) {
      return HttpResponse.json(status, { status: 200 });
    }
    return HttpResponse.json({ error: 'Status not found' }, { status: 404 });
  }),

  // GET /project - All projects
  http.get(`${API_BASE_URL}/project`, () => {
    // Filter out deleted projects
    const activeProjects = mockProjects.filter(p => !p.projectDeleteStatus);
    return HttpResponse.json(activeProjects, { status: 200 });
  }),

  // GET /project/member/:memberId - Projects by member
  http.get(`${API_BASE_URL}/project/member/:memberId`, ({ params }) => {
    const memberId = Number(params.memberId);
    // Giả lập chỉ trả về project của member (ví dụ memberId=1 chỉ thấy project 1)
    const filtered = mockProjects.filter(p => (p.memberAuthorId === memberId || p.projectLeadId === memberId) && !p.projectDeleteStatus);
    return HttpResponse.json(filtered, { status: 200 });
  }),

  // GET /project/:projectId - Get single project by ID
  http.get(`${API_BASE_URL}/project/:projectId`, ({ params }) => {
    const projectId = Number(params.projectId);
    const project = mockProjects.find(p => p.projectId === projectId);
    
    if (project) {
      return HttpResponse.json(project, { status: 200 });
    }
    return HttpResponse.json({ success: false, error: "Project not found" }, { status: 404 });
  }),

  // POST /project/create - Create new project
  http.post(`${API_BASE_URL}/project/create`, async ({ request }) => {
    const body = await request.json() as any;
    
    const newProject = {
      projectId: Math.max(...mockProjects.map(p => p.projectId), 0) + 1,
      ...body,
      projectStatusName: mockProjectStatuses.find(s => s.projectStatusId === body.projectStatusId)?.statusName || "Unknown",
      workProgress: body.workProgress || 0,
      projectDeleteStatus: false,
      authorFullName: "Current User",
      memberAuthorId: 7, // Giả lập current user
    };
    
    // Thêm vào mock data (cho test tiếp theo)
    mockProjects.push(newProject);
    
    return HttpResponse.json(newProject, { status: 201 });
  }),

  // PATCH /project/update/:projectId - Update project
  http.patch(`${API_BASE_URL}/project/update/:projectId`, async ({ params, request }) => {
    const projectId = Number(params.projectId);
    const body = await request.json() as any;
    
    const index = mockProjects.findIndex(p => p.projectId === projectId);
    if (index === -1) {
      return HttpResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    
    mockProjects[index] = {
      ...mockProjects[index],
      ...body,
      projectStatusName: mockProjectStatuses.find(s => s.projectStatusId === body.projectStatusId)?.statusName || mockProjects[index].projectStatusName,
    };
    
    return HttpResponse.json(mockProjects[index], { status: 200 });
  }),

  // DELETE /project/delete/:projectId - Delete (soft delete)
  http.delete(`${API_BASE_URL}/project/delete/:projectId`, ({ params }) => {
    const projectId = Number(params.projectId);
    const index = mockProjects.findIndex(p => p.projectId === projectId);
    
    if (index === -1) {
      return HttpResponse.json({ success: false, error: "Project not found" }, { status: 404 });
    }
    
    // Soft delete
    mockProjects[index].projectDeleteStatus = true;
    
    return HttpResponse.json(true, { status: 200 });
  }),
];