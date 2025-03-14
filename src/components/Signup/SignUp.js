import React, { useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const SignUp = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string()
                .matches(/@/, 'Email ID must contain @ Symbol')
                .required('Email is required')
                .email('Invalid email format (user@example.in)'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.get('http://localhost:4000/users');
                const users = response.data;
                const maxId = users.length > 0 
                    ? Math.max(...users.map(user => parseInt(user.id, 10))) 
                    : 0;
                const newId = (maxId + 1).toString(); 

                const newUser = {
                    id: newId,
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: 'employee' 
                };

                await axios.post('http://localhost:4000/users', newUser, {
                    headers: { 'Content-Type': 'application/json' }
                });

                login(newUser);

                navigate(newUser.role === 'admin' ? '/' : '/profiles');
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
                    {formik.errors.name && <span style={{ color: 'red' }}>{formik.errors.name}</span>}

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                        />
                    </label>
                    {formik.errors.email && <span style={{ color: 'red' }}>{formik.errors.email}</span>}

                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                        />
                    </label>
                    {formik.errors.password && <span style={{ color: 'red' }}>{formik.errors.password}</span>}

                    <button type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;