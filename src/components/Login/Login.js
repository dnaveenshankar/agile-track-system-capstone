import React, { useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },
        validationSchema: Yup.object({
            email: Yup.string()
                .matches(/@/, 'Email must contain @ Symbol')
                .required('Email is required')
                .email('Invalid email format (Eg: user@example.in)'),
            password: Yup.string().required('Password is required')
        }),
        onSubmit: async (values) => {
            try {
                const response = await axios.get(`http://localhost:4000/users?email=${values.email}&password=${values.password}`);
                if (response.data.length > 0) {
                    const user = response.data[0];
                    login(user);
                    navigate('/');
                } else {
                    alert('Invalid email or password');
                }
            } catch (error) {
                console.error('Error logging in:', error);
            }
        }
    });

    return (
        <div>
            <h2>Login</h2>
            <div>
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

                <button onClick={formik.handleSubmit}>Login</button>
            </div>

            <div style={{ marginTop: '10px' }}>
                <button onClick={() => navigate('/signup')}>Sign Up</button>
            </div>
        </div>
    );
};

export default Login;