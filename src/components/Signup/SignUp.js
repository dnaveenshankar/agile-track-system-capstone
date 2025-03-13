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
                await axios.post('http://localhost:4000/users', {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: 'employee'
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label>
                        Name:
                        <input
                            type="text"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </label>
                    {formik.touched.name && formik.errors.name && (
                        <span style={{ color: 'red' }}>{formik.errors.name}</span>
                    )}

                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </label>
                    {formik.touched.email && formik.errors.email && (
                        <span style={{ color: 'red' }}>{formik.errors.email}</span>
                    )}

                    <label>
                        Password:
                        <input
                            type="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </label>
                    {formik.touched.password && formik.errors.password && (
                        <span style={{ color: 'red' }}>{formik.errors.password}</span>
                    )}

                    <button type="submit">Sign Up</button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;
