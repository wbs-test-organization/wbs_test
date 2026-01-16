import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input, Button, Progress, Table, Form, Select, DatePicker, Popconfirm } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { ProjectService } from '../../service/projectService';
import type { ProjectMemberResponse } from '../../api/projectMemberAPI';
import { ProjectMemberService } from '../../service/projectMemberService';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/Store';

interface ProjectDetailProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId: number;
}

interface ProjectDetail {
  projectId: number;
  projectName: string;
  expectedStartDate: string;
  expectedEndDate: string;
  projectStatusId: number;
  // priority: string;
  // skill: string;
  projectLeadName: string;
  workProgress: number;
  members: ProjectMemberResponse[];
}

const viewData: ProjectDetail = {
  projectId: 0,
  projectName: '',
  expectedStartDate: '',
  expectedEndDate: '',
  projectStatusId: 1,
  // priority: '',
  // skill: '',
  projectLeadName: '',
  workProgress: 0,
  members: [],
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({ isOpen, onClose, currentProjectId }) => {

  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [projectMemberData, setProjectMemberData] = useState<ProjectMemberResponse[]>([]);
  const [projectData, setProjectData] = useState<ProjectDetail>(viewData);
  // const { selectedProject } = useSelector((state: RootState) => state.project);
  const { projects } = useSelector((state: RootState) => state.project);
  const { Option } = Select;

  const loadProjectDetail = async (projectId: number) => {
    try {
      const result = await ProjectService.getProjectById(projectId);
      const projectMemberResult = await ProjectMemberService.getAllMembersByProjectId(projectId);
      if (result.success && result.data) {
        const newData: ProjectDetail = {
          projectId: result.data?.projectId || 0,
          projectName: result.data?.projectName || '',
          expectedStartDate: result.data?.expectedStartDate || '',
          expectedEndDate: result.data?.expectedEndDate || '',
          projectStatusId: result.data?.projectStatusId || 0,
          // priority: result.data?.priority || '-',
          // skill: result.data?.skill || '-',
          projectLeadName: result.data?.projectLeadName || '',
          workProgress: result.data?.workProgress || 0,
          members: projectMemberResult.data || [],
        };
        setProjectData(newData);
        // Populate projectMemberData with order numbers
        const editMember = (projectMemberResult.data || []).map((member) => ({
          ...member,
        }));
        setProjectMemberData(editMember);
        console.log('Project details loaded:', result.data, projectMemberResult);
      }
    } catch (error) {
      console.error('Error loading project detail:', error);
    }
  };

  React.useEffect(() => {
    if (isOpen && currentProjectId) {
      loadProjectDetail(currentProjectId);
    }
  }, [isOpen, currentProjectId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      <button
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Project Details
          </h2>
          <Button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </Button>
        </div>
        <Form className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Project Name{' '}
              <Input
                type="text"
                name="projectName"
                value={projectData.projectName}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Time{' '}
              <Input
                type="text"
                name="time"
                value={`${projectData.expectedStartDate ? projectData.expectedStartDate.split('T')[0] : ''}    -->   ${projectData.expectedEndDate ? projectData.expectedEndDate.split('T')[0] : ''}`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Status{' '}
              <Input
                type="text"
                name="status"
                // value={selectedProject.projectStatusName || 'N/A'}
                value={projects.find(project => project.projectStatusId === projectData.projectStatusId)?.projectStatusName || '-'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Priority{' '}
              <Input
                type="text"
                name="priority"
                value={'None'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>
            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Skill{' '}
              <Input
                type="text"
                name="skill"
                value={'None'}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Project Lead{' '}
              <Input
                type="text"
                name="projectLeadName"
                value={projectData.projectLeadName}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Progress{' '}
              <Progress
                percent={projectData.workProgress}
                status="active"           // hiệu ứng sóng nhẹ
                //status="success"          // nếu đạt 100%
                strokeColor="#52c41a"
                strokeLinecap="round"
                showInfo={true}               // bắt buộc để hiển thị %
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
              />
            </Form.Item>

            <Form.Item className={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left ${isEditMemberOpen ? 'hidden' : ''}`}>
              Member{' '}
              <div className="flex items-center gap-2">
                <Select
                  value={projectData.members.map(member => member.memberId)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                >
                  {projectData.members.map(member => (
                    <Select.Option key = {member.memberId} value = {member.memberId} >
                      {member.memberFullName}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  onClick={() => setIsEditMemberOpen(true)}
                  className="!bg-green-500 hover:!bg-green-600 text-white rounded-xl px-4 py-5 transition hover:!text-white" >
                  Edit Member
                </Button>
              </div>
            </Form.Item>
          </div>
          <div className="flex items-center justify-center gap-4 pt-10">
            <Button
              onClick={onClose}
              className="px-8 py-5 !border !border-gray-600 rounded-xl !text-gray-700 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-700 transition"
            >
              Cancel
            </Button>

            <Button
              className="px-6 py-5 !bg-green-500 hover:!bg-green-600 !text-white rounded-xl transition hover:!text-white"
            >
              Export PDF
            </Button>
          </div>
        </Form>
      </div>

      {isEditMemberOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center overflow-auto">
          <button
            className="absolute inset-0 bg-black bg-opacity-10 transition-opacity"
            onClick={() => setIsEditMemberOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[80%] mx-4 p-6 animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Project Members</h3>
                <button
                  onClick={() => setIsEditMemberOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Nội dung table editable */}
              {(() => {
                // const handleChange = (value: string | null, key: number, dataIndex: keyof ProjectMemberResponse) => {
                //   setProjectMemberData(prev =>
                //     prev.map(item =>
                //       item.mediateProjectMemberId === key ? { ...item, [dataIndex]: value } : item
                //     )
                //   );
                // };

                // const handleDateChange = (_date: dayjs.Dayjs | null, dateString: string, key: number, field: 'startDate' | 'endDate') => {
                //   handleChange(dateString, key, field);
                // };

                // const handleAdd = () => {
                //   const newMember: CreateMemberRequest = {
                //     memberId: 0,
                //     roleId: 0,
                //     startDate: '',
                //     endDate: '',
                //     isCurrent: false,
                //   };
                //   setProjectMemberData([...projectMemberData, newMember]);
                // };

                // const handleDelete = (key: string) => {
                //   setDataSource(prev => prev.filter(item => item.key !== key));
                // };

                const columns: ColumnsType<ProjectMemberResponse> = [
                  {
                    title: 'Order',
                    dataIndex: 'order',
                    width: 60,
                    align: 'center',
                    render: (_, __, index) => index + 1,
                  },
                  {
                    title: 'Member Name',
                    dataIndex: 'memberName',
                    width: 180,
                    align: 'center',
                    render: (_, record) => (
                      <Select
                        value={record.memberFullName || undefined}
                        // onChange={val => handleChange(val, record.mediateProjectMemberId, 'memberName')}
                        placeholder="Choose member name"
                        style={{ width: '100%' }}
                        allowClear
                      >
                        <Option value="Super Admin">Super Admin</Option>
                        <Option value="PhanVanHung">Phan Van Hung</Option>
                        {/* Thêm các member khác từ API */}
                      </Select>
                    ),
                  },
                  {
                    title: 'Project Role',
                    dataIndex: 'projectRole',
                    width: 160,
                    align: 'center',
                    render: (_, record) => (
                      <Select
                        value={record.roleName || undefined}
                        // onChange={val => handleChange(val, record.key, 'projectRole')}
                        placeholder="Choose project role"
                        style={{ width: '100%' }}
                      >
                        <Option value="Project Manager">Project Manager</Option>
                        <Option value="Chief Accountant">Chief Accountant</Option>
                        {/* Thêm role khác */}
                      </Select>
                    ),
                  },
                  {
                    title: 'Start Date',
                    dataIndex: 'startDate',
                    width: 140,
                    align: 'center',
                    render: (_, record) => (
                      <DatePicker
                        value={record.startDate ? dayjs(record.startDate) : null}
                        // onChange={(date, dateString) => handleDateChange(date, dateString as string, record.key, 'startDate')}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'End Date',
                    dataIndex: 'endDate',
                    width: 140,
                    align: 'center',
                    render: (_, record) => (
                      <DatePicker
                        value={record.endDate ? dayjs(record.endDate) : null}
                        // onChange={(date, dateString) => handleDateChange(date, dateString as string, record.key, 'endDate')}
                        format="YYYY-MM-DD"
                        style={{ width: '100%' }}
                      />
                    ),
                  },
                  {
                    title: 'Is current member',
                    dataIndex: 'isCurrent',
                    width: 140,
                    align: 'center',
                    render: (isCurrent: boolean) => (
                      <Select
                        value={isCurrent? "Is A Member": "Not A Member"}
                        // onChange={val => handleChange(val, record.key, 'isCurrent')}
                        style={{ width: '100%' }}
                      >
                        {isCurrent? "Is A Member": "Not A Member"}
                        <Option value="1">Is A Member</Option>
                        <Option value="0">Not A Member</Option>
                      </Select>
                    ),
                  },
                  {
                    title: '',
                    key: 'delete',
                    width: 60,
                    align: 'center',
                    render: () => (
                      <Popconfirm
                        title="Delete this member?"
                        // onConfirm={() => handleDelete(record.key)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button danger icon={<DeleteOutlined />} size="small" />
                      </Popconfirm>
                    ),
                  },
                ];

                return (
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4">

                    </div>

                    <Table
                      columns={columns}
                      dataSource ={ projectMemberData}
                      pagination={false}
                      bordered
                      size="middle"
                      rowKey="key"
                    />

                    <Button
                      icon={<PlusOutlined />}
                      // onClick={handleAdd}
                      className=" w-[150px] h-10 ml-auto text-white hover:!text-white mt-2 items-center justify-center bg-green-500 hover:!bg-green-600"
                    >
                      Add Member
                    </Button>

                    <div className="flex items-center justify-center gap-4 mt-auto">
                      <Button
                        onClick={() => setIsEditMemberOpen(false)}
                        className="px-6 py-5 !border !border-gray-600 rounded-xl !text-gray-700 dark:!text-gray-300 hover:!bg-gray-100 dark:hover:!bg-gray-700 transition"
                      >
                        Cancel
                      </Button>

                      <Button
                        className="px-8 py-5 !bg-green-500 hover:!bg-green-600 !text-white rounded-xl transition hover:!text-white"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectDetail;