'use client';

import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';
import { Spinner, Container } from 'react-bootstrap';

const ProtectedRoute = (WrappedComponent) => {
  const ProtectedComponent = (props) => {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const pathname = usePathname();

    console.log('ProtectedRoute: isAuthenticated:', isAuthenticated, 'isAuthLoading:', isAuthLoading, 'Path:', pathname);

    if (isAuthLoading) {
      return (
        <Container className="my-4 text-center">
          <Spinner animation="border" />
        </Container>
      );
    }

    if (!isAuthenticated) {
      return null; // Middleware will redirect to /login
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `ProtectedRoute(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ProtectedComponent;
};

export default ProtectedRoute;