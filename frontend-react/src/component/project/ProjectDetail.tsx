import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Input, Button, Progress, Table, Form, Select, DatePicker, Popconfirm } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface ProjectDetailProps {
  isOpen: boolean;
  onClose: () => void;
}
interface Member {
  key: string;
  order: number;
  memberName: string;
  projectRole: string;
  startDate: string | null;
  endDate: string | null;
  isCurrent: 'IsA' | 'NotA';
}

const mockMembers: Member[] = [
  { key: '1', order: 1, memberName: 'Super Admin', projectRole: 'Project Manager', startDate: '2024-09-03', endDate: '2025-11-01', isCurrent: 'IsA' },
  { key: '2', order: 2, memberName: 'PhanVanHung', projectRole: 'Chief Accountant', startDate: '2024-11-01', endDate: '2024-11-21', isCurrent: 'IsA' },
  { key: '3', order: 3, memberName: '', projectRole: '', startDate: null, endDate: null, isCurrent: 'NotA' },
];

const ProjectDetail: React.FC<ProjectDetailProps> = ({ isOpen, onClose }) => {

  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false);
  const [dataSource, setDataSource] = useState<Member[]>(mockMembers);
  const { Option } = Select;

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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Time{' '}
              <Input
                type="text"
                name="time"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Status{' '}
              <Input
                type="text"
                name="status"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Priority{' '}
              <Input
                type="text"
                name="priority"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Skill{' '}
              <Input
                type="text"
                name="skill"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Project Lead{' '}
              <Input
                type="text"
                name="projectLeadName"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                disabled
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Progress{' '}
              <Progress
                percent={80.56}
                status="active"           // hiệu ứng sóng nhẹ
                //status="success"          // nếu đạt 100%
                strokeColor="#52c41a"
                strokeLinecap="round"
                showInfo={true}               // bắt buộc để hiển thị %
                // format={(percent) => `${percent.toFixed(2)}%`}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
              />
            </Form.Item>

            <Form.Item className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-left">
              Member{' '}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  name="member"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 mt-1"
                  disabled
                />
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
                const handleChange = (value: any, key: string, dataIndex: keyof Member) => {
                  setDataSource(prev =>
                    prev.map(item =>
                      item.key === key ? { ...item, [dataIndex]: value } : item
                    )
                  );
                };

                const handleDateChange = (date: any, dateString: string, key: string, field: 'startDate' | 'endDate') => {
                  handleChange(dateString, key, field);
                };

                const handleAdd = () => {
                  const newMember: Member = {
                    key: Date.now().toString(),
                    order: dataSource.length + 1,
                    memberName: '',
                    projectRole: '',
                    startDate: null,
                    endDate: null,
                    isCurrent: 'NotA',
                  };
                  setDataSource([...dataSource, newMember]);
                };

                const handleDelete = (key: string) => {
                  setDataSource(prev => prev.filter(item => item.key !== key));
                };

                const columns: ColumnsType<Member> = [
                  {
                    title: 'Order',
                    dataIndex: 'order',
                    width: 60,
                    align: 'center',
                    render: (_, record) => record.order,
                  },
                  {
                    title: 'Member Name',
                    dataIndex: 'memberName',
                    width: 180,
                    align: 'center',
                    render: (_, record) => (
                      <Select
                        value={record.memberName || undefined}
                        onChange={val => handleChange(val, record.key, 'memberName')}
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
                        value={record.projectRole || undefined}
                        onChange={val => handleChange(val, record.key, 'projectRole')}
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
                        onChange={(date, dateString) => handleDateChange(date, dateString as string, record.key, 'startDate')}
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
                        onChange={(date, dateString) => handleDateChange(date, dateString as string, record.key, 'endDate')}
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
                    render: (_, record) => (
                      <Select
                        value={record.isCurrent}
                        onChange={val => handleChange(val, record.key, 'isCurrent')}
                        style={{ width: '100%' }}
                      >
                        <Option value="IsA">Is Member</Option>
                        <Option value="NotA">Not A Member</Option>
                      </Select>
                    ),
                  },
                  {
                    title: '',
                    key: 'delete',
                    width: 60,
                    align: 'center',
                    render: (_, record) => (
                      <Popconfirm
                        title="Delete this member?"
                        onConfirm={() => handleDelete(record.key)}
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
                      dataSource={dataSource}
                      pagination={false}
                      bordered
                      size="middle"
                      rowKey="key"
                    />

                    <Button
                      icon={<PlusOutlined />}
                      onClick={handleAdd}
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