import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/Store';
import { ProjectService } from "../service/projectService";

const Home: React.FC = () => {
    const { projects, isLoading } = useSelector((state: RootState) => state.project);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const  [formData, setFormData] = useState({
        projectCode: "",
        projectName: "",
        projectStatusName: "Open",
        expectedStartDate: "",
        expectedEndDate: "",
        authorFullName: ""
    })

    const [formEditData, setFormEditData] = useState({
        projectCode: "",
        projectName: "",
        projectStatusName: "Open",
        expectedStartDate: "",
        expectedEndDate: "",
        authorFullName: ""
    })
    useEffect(() => {
        ProjectService.getAllProjects();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormEditData(prev => ({ ...prev, [name]: value}));
    };

    const handleSubmit = async () => {
        console.log("New project data", formData);
        setIsModalOpen(false);
        setFormData({
            projectCode: "",
            projectName: "",
            projectStatusName: "Open",
            expectedStartDate: "",
            expectedEndDate: "",
            authorFullName: ""
        })
    };

    useEffect(() => {
        const fetchProject = async () => {
            
        };
        fetchProject();
    })

    const handleEditProject = async () => {
        console.log("New project data", formData);
        setIsModalOpen(false);
    }
    

    return (
        <div className="bg-gray-100 dark:bg-gray-900 w-[123%] ml-[-132px]">
            <main className="pt-20 px-6 pb-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow">
                            <Plus className="h-5 w-5" />
                            Add New Project
                        </button>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <button className="px-6 py-2.5 text-sm font-semibold text-white bg-green-200 rounded-lg">
                                    All
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="pl-10 pr-4 py-2.5 w-full sm:w-80 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>

                            <button className="p-2.5 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-shadow shadow-sm">
                                <Filter className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-500">Loading projects...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Action
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Project Name
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Expected Start Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Expected End Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Project Lead
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Check list status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Check date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {projects.map((project) => (
                                        <tr
                                            key={project.projectId}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 flex gap-2">
                                                {/* Các button action giữ nguyên */}
                                                <button className="p-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors" title="Copy">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className='h-3 w-3'>
                                                        <path d="M128 96C92.7 96 64 124.7 64 160L64 416C64 451.3 92.7 480 128 480L272 480L256 528L184 528C170.7 528 160 538.7 160 552C160 565.3 170.7 576 184 576L456 576C469.3 576 480 565.3 480 552C480 538.7 469.3 528 456 528L384 528L368 480L512 480C547.3 480 576 451.3 576 416L576 160C576 124.7 547.3 96 512 96L128 96zM160 160L480 160C497.7 160 512 174.3 512 192L512 352C512 369.7 497.7 384 480 384L160 384C142.3 384 128 369.7 128 352L128 192C128 174.3 142.3 160 160 160z" fill="currentColor" />
                                                    </svg>
                                                </button>

                                                <button className="p-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors" title="View">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className='h-3 w-3'>
                                                        <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" fill="currentColor" />
                                                    </svg>
                                                </button>

                                                <button 
                                                    onClick={() => setIsEditModalOpen(true)}
                                                    className="p-1 rounded-md bg-green-500 hover:bg-green-600 text-white transition-colors" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className='h-3 w-3'>
                                                        <path d="M505 122.9L517.1 135C526.5 144.4 526.5 159.6 517.1 168.9L488 198.1L441.9 152L471 122.9C480.4 113.5 495.6 113.5 504.9 122.9zM273.8 320.2L408 185.9L454.1 232L319.8 366.2C316.9 369.1 313.3 371.2 309.4 372.3L250.9 389L267.6 330.5C268.7 326.6 270.8 323 273.7 320.1zM437.1 89L239.8 286.2C231.1 294.9 224.8 305.6 221.5 317.3L192.9 417.3C190.5 425.7 192.8 434.7 199 440.9C205.2 447.1 214.2 449.4 222.6 447L322.6 418.4C334.4 415 345.1 408.7 353.7 400.1L551 202.9C579.1 174.8 579.1 129.2 551 101.1L538.9 89C510.8 60.9 465.2 60.9 437.1 89zM152 128C103.4 128 64 167.4 64 216L64 488C64 536.6 103.4 576 152 576L424 576C472.6 576 512 536.6 512 488L512 376C512 362.7 501.3 352 488 352C474.7 352 464 362.7 464 376L464 488C464 510.1 446.1 528 424 528L152 528C129.9 528 112 510.1 112 488L112 216C112 193.9 129.9 176 152 176L264 176C277.3 176 288 165.3 288 152C288 138.7 277.3 128 264 128L152 128z" fill="currentColor" />
                                                    </svg>
                                                </button>

                                                <button className="p-1 rounded-md bg-red-500 hover:bg-red-600 text-white transition-colors" title="Delete">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className='h-3 w-3'>
                                                        <path d="M232.7 69.9L224 96L128 96C110.3 96 96 110.3 96 128C96 145.7 110.3 160 128 160L512 160C529.7 160 544 145.7 544 128C544 110.3 529.7 96 512 96L416 96L407.3 69.9C402.9 56.8 390.7 48 376.9 48L263.1 48C249.3 48 237.1 56.8 232.7 69.9zM512 208L128 208L149.1 531.1C150.7 556.4 171.7 576 197 576L443 576C468.3 576 489.3 556.4 490.9 531.1L512 208z" fill="currentColor" />
                                                    </svg>
                                                </button>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {project.projectName}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                                    {project.projectStatusName || 'N/A'}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                                                    N/A
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                                {project.expectedStartDate
                                                    ? new Date(project.expectedStartDate).toLocaleDateString('vi-VN')
                                                    : '-'}
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                                {project.expectedEndDate
                                                    ? new Date(project.expectedEndDate).toLocaleDateString('vi-VN')
                                                    : '-'}
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                                -
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                                {project.authorFullName || project.memberAuthorId || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                                                    N/A
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-gray-600 dark:text-gray-300">
                                                -
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {projects.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            Chưa có dự án nào.
                        </div>
                    )}
                </div>
            </main>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setIsModalOpen(false)}>
                    </div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Add New Project
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div className="grid grid-col-1 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="projectCode"
                                        value={formData.projectCode}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter project code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="projectStatusName"
                                        value={formData.projectStatusName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Expected Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expectedStartDate"
                                        value={formData.expectedStartDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Expected End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expectedEndDate"
                                        value={formData.expectedEndDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Leader
                                    </label>
                                    <input
                                        type="text"
                                        name="authorFullName"
                                        value={formData.authorFullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter name"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-400 hover:bg-green-500 text-white font-medium rounded-xl transition shadow-md"
                                >
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
                        onClick={() => setIsEditModalOpen(false)}>
                    </div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-8 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit Project
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleEditProject} className="space-y-2">
                            <div className="grid grid-col-1 gap-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="projectCode"
                                        value={formEditData.projectCode}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter project code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Name
                                    </label>
                                    <input
                                        type="text"
                                        name="projectName"
                                        value={formEditData.projectName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="projectStatusName"
                                        value={formEditData.projectStatusName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                        <option value="Closed">Closed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Expected Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expectedStartDate"
                                        value={formEditData.expectedStartDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Expected End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="expectedEndDate"
                                        value={formEditData.expectedEndDate}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Project Leader
                                    </label>
                                    <input
                                        type="text"
                                        name="authorFullName"
                                        value={formEditData.authorFullName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter name"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-green-400 hover:bg-green-500 text-white font-medium rounded-xl transition shadow-md"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;