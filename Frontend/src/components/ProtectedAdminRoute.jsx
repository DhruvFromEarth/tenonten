import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from '../providers/axios';

const ProtectedAdminRoute = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                const selectedOrg = localStorage.getItem('selectedOrganisation');
                if (!selectedOrg) {
                    setIsAdmin(false);
                    setLoading(false);
                    return;
                }

                const response = await axios.post('/org/check-admin', {
                    organisationName: selectedOrg
                });
                setIsAdmin(response.data.isAdmin);
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedAdminRoute; 