import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UserProfile = () => {
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const { user } = useContext(UserContext);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                if (user?.role === 'admin') {
                    setUsers(response.data.filter(u => u?.role !== 'admin'));
                } else {
                    setSelectedUser(user);
                    fetchTasks(user?.id);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [user]);

    const fetchTasks = async (userId) => {
        try {
            const response = await axios.get(`http://localhost:4000/tasks?assignedTo=${userId}`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleGetHistory = (userId) => {
        setSelectedUser(users.find(u => u?.id === userId));
        fetchTasks(userId);
    };

    return (
        <div>
            <style>{`
                .error { color: red; font-size: 14px; }
            `}</style>
            <h2>User Profiles</h2>
            {user?.role === 'admin' && (
                <div>
                    <button onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                    {showForm && (
                        <Formik
                            initialValues={{ name: '', email: '', password: '', role: 'employee' }}
                            validationSchema={Yup.object({
                                name: Yup.string().required('Name is required'),
                                email: Yup.string()
                                    .matches(/@/, 'Email must contain @ Symbol')
                                    .required('Email is required')
                                    .email('Invalid email format (user@example.in)'),
                                password: Yup.string().required('Password is required'),
                                role: Yup.string().oneOf(['employee', 'admin']).required('Role is required')
                            })}
                            onSubmit={async (values, { setSubmitting, resetForm }) => {
                                try {
                                    const response = await axios.get('http://localhost:4000/users');
                                    const users = response.data;

                                    const maxId = users.length > 0
                                        ? Math.max(...users.map(user => parseInt(user.id, 10)))
                                        : 0;
                                    const newId = (maxId + 1).toString(); 

                                    await axios.post('http://localhost:4000/users', {
                                        id: newId, 
                                        name: values.name,
                                        email: values.email,
                                        password: values.password,
                                        role: values.role
                                    }, {
                                        headers: { 'Content-Type': 'application/json' }
                                    });

                                    const updatedUsers = await axios.get('http://localhost:4000/users');
                                    setUsers(updatedUsers.data.filter(u => u?.role !== 'admin'));

                                    setShowForm(false);
                                    resetForm();
                                } catch (error) {
                                    console.error('Error adding user:', error);
                                }
                                setSubmitting(false);
                            }}
                        >
                            <Form>
                                <div>
                                    <label>Name:</label>
                                    <Field type="text" name="name" />
                                    <ErrorMessage name="name" component="div" className="error" />
                                </div>
                                <div>
                                    <label>Email:</label>
                                    <Field type="email" name="email" />
                                    <ErrorMessage name="email" component="div" className="error" />
                                </div>
                                <div>
                                    <label>Password:</label>
                                    <Field type="password" name="password" />
                                    <ErrorMessage name="password" component="div" className="error" />
                                </div>
                                <div>
                                    <label>Role:</label>
                                    <Field as="select" name="role">
                                        <option value="employee">Employee</option>
                                        <option value="admin">Admin</option>
                                    </Field>
                                    <ErrorMessage name="role" component="div" className="error" />
                                </div>
                                <button type="submit">Create User</button>
                            </Form>
                        </Formik>
                    )}
                    <ul>
                        {users.map(u => (
                            <li key={u?.id}>
                                <strong>Name:</strong> {u?.name} <br />
                                <strong>Email:</strong> {u?.email} <br />
                                <button onClick={() => handleGetHistory(u?.id)}>Get History</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {user?.role !== 'admin' && (
                <div>
                    <h3>Tasks Worked By {user?.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {selectedUser && user?.role === 'admin' && (
                <div>
                    <h3>Tasks Worked By {selectedUser.name}</h3>
                    <ul>
                        {tasks.map(task => (
                            <li key={task.id}>
                                <strong>Title:</strong> {task.title} <br />
                                <strong>Description:</strong> {task.description} <br />
                                <strong>Status:</strong> {task.status}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default UserProfile;