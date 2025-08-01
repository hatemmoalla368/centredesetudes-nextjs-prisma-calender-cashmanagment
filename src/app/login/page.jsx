'use client';

import { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('LoginPage: isAuthenticated:', isAuthenticated, 'isAuthLoading:', isAuthLoading, 'Path:', pathname);
    if (!isAuthLoading && isAuthenticated && pathname === '/login') {
      console.log('LoginPage: Redirecting to /');
      router.push('/');
      router.refresh();
    }
  }, [isAuthenticated, isAuthLoading, pathname, router]);

  if (isAuthLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Container className="my-5">
      <Card className="mx-auto" style={{ maxWidth: '400px' }}>
        <Card.Body>
          <Card.Title className="text-center">Connexion</Card.Title>
          <Form onSubmit={(e) => {
            e.preventDefault();
            login(username, password);
          }}>
            <Form.Group className="mb-3">
              <Form.Label>Nom d’utilisateur</Form.Label>
              <Form.Control
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez le nom d’utilisateur"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Se connecter
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}