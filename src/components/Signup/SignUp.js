import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SignUp = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string()
                .matches(/@/, 'Email must contain @')
                .required('Email is required')
                .email('Invalid email format'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values) => {
            try {
                // Fetch existing users
                const response = await axios.get('http://localhost:4000/users');
                const users = response.data;

                // Find the max ID and increment it (ensuring ID remains a string)
                const maxId = users.length > 0 
                    ? Math.max(...users.map(user => parseInt(user.id, 10))) 
                    : 0;
                const newId = (maxId + 1).toString(); // Convert new ID to string

                // Create new user with string ID
                await axios.post('http://localhost:4000/users', {
                    id: newId, // Store ID as a string
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: 'employee'
                }, {
                    headers: { 'Content-Type': 'application/json' }
                });

                navigate('/login');
            } catch (error) {
                console.error('Error signing up:', error);
            }
        }
    });

    return (
        <div>
            <h2>Sign Up</h2>
            <form onSubmit={formik.handleSubmit}>
                <div>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                        />
                    </label>
                    {formik.errors.name && (
                        <span style={{ color: 'red' }}>{formik.errors.name}</span>
                    )}

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                        />
                    </label>
                    {formik.errors.email && (
                        <span style={{ color: 'red' }}>{formik.errors.email}</span>
                    )}

                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                        />
                    </label>
                    {formik.errors.password && (
                        <span style={{ color: 'red' }}>{formik.errors.password}</span>
                    )}

                    <button type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
