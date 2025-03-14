import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ScrumDetails from '../Scrum Details/ScrumDetails';
import { UserContext } from '../../context/UserContext';

const Dashboard = () => {
    const [scrums, setScrums] = useState([]);
    const [selectedScrum, setSelectedScrum] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [users, setUsers] = useState([]);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchScrums = async () => {
            try {
                const response = await axios.get('http://localhost:4000/scrums');
                setScrums(response.data);
            } catch (error) {
                console.error('Error fetching scrums:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                const employeeUsers = response.data.filter(user => user.role === 'employee');
                setUsers(employeeUsers);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchScrums();
        fetchUsers();
    }, []);

    const handleGetDetails = async (scrumId) => {
        try {
            const response = await axios.get(`http://localhost:4000/scrums/${scrumId}`);
            setSelectedScrum(response.data);
        } catch (error) {
            console.error('Error fetching scrum details:', error);
        }
    };

    const formik = useFormik({
        initialValues: {
            scrumName: '',
            taskTitle: '',
            taskDescription: '',
            taskStatus: 'To Do',
            taskAssignedTo: ''
        },
        validationSchema: Yup.object({
            scrumName: Yup.string().required('Scrum Name is required'),
            taskTitle: Yup.string().required('Task Title is required'),
            taskDescription: Yup.string().required('Task Description is required'),
            taskAssignedTo: Yup.string().required('Assigning to a user is required')
        }),
        onSubmit: async (values, { resetForm }) => {
            try {
                const scrumsResponse = await axios.get('http://localhost:4000/scrums');
                const scrums = scrumsResponse.data;
        
                const newId = scrums.length > 0 
                    ? (Math.max(...scrums.map(scrum => parseInt(scrum.id, 10))) + 1).toString() 
                    : "1"; 
        
                const newScrumResponse = await axios.post('http://localhost:4000/scrums', {
                    id: newId,  
                    name: values.scrumName
                });
        
                await axios.post('http://localhost:4000/tasks', {
                    id: newId,  
                    title: values.taskTitle,
                    description: values.taskDescription,
                    status: values.taskStatus,
                    scrumId: newScrumResponse.data.id, 
                    assignedTo: values.taskAssignedTo,
                    history: [
                        {
                            status: values.taskStatus,
                            date: new Date().toISOString().split('T')[0],
                        },
                    ],
                });
        
                setScrums([...scrums, newScrumResponse.data]); 
                setShowForm(false);
                resetForm();
            } catch (error) {
                console.error('Error adding scrum:', error);
            }
        }
        
    });

    return (
        <div>
            <style>
                {`.error { color: red;}`}
            </style>
            <h2>Scrum Teams</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New Scrum'}
                    </button>
                    {showForm && (
                        <form onSubmit={formik.handleSubmit}>
                            <div>
                                <label>Scrum Name:</label>
                                <input
                                    type="text"
                                    name="scrumName"
                                    value={formik.values.scrumName}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.scrumName && <div className="error">{formik.errors.scrumName}</div>}
                            </div>
                            <div>
                                <label>Task Title:</label>
                                <input
                                    type="text"
                                    name="taskTitle"
                                    value={formik.values.taskTitle}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.taskTitle && <div className="error">{formik.errors.taskTitle}</div>}
                            </div>
                            <div>
                                <label>Task Description:</label>
                                <input
                                    type="text"
                                    name="taskDescription"
                                    value={formik.values.taskDescription}
                                    onChange={formik.handleChange}
                                />
                                {formik.errors.taskDescription && <div className="error">{formik.errors.taskDescription}</div>}
                            </div>
                            <div>
                                <label>Task Status:</label>
                                <select
                                    name="taskStatus"
                                    value={formik.values.taskStatus}
                                    onChange={formik.handleChange}
                                >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Done</option>
                                </select>
                            </div>
                            <div>
                                <label>Assign To:</label>
                                <select
                                    name="taskAssignedTo"
                                    value={formik.values.taskAssignedTo}
                                    onChange={formik.handleChange}
                                >
                                    <option value="">Select a user</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                {formik.errors.taskAssignedTo && <div className="error">{formik.errors.taskAssignedTo}</div>}
                            </div>
                            <button type="submit">Create Scrum</button>
                        </form>
                    )}
                </div>
            )}
            <ul>
                {scrums.map((scrum) => (
                    <li key={scrum.id}>
                        {scrum.name}
                        <button onClick={() => handleGetDetails(scrum.id)}>Get Details</button>
                    </li>
                ))}
            </ul>
            {selectedScrum && <ScrumDetails scrum={selectedScrum} />}
        </div>
    );
};

export default Dashboard;