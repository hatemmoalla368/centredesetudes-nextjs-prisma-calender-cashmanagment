'use client'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Link from "next/link";
import { useAuth } from '@/contexts/AuthContext';
import { Button } from 'react-bootstrap';

function Navabar() {
    const { isAuthenticated, logout } = useAuth();

  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
<Navbar.Brand as={Link} href={isAuthenticated ? '/' : '/login'}>
          EduSpace Coworking
        </Navbar.Brand>        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
             {isAuthenticated && (
              <>
            <Nav.Link as={Link} href="/">dashboard</Nav.Link>
            
            <NavDropdown title="calender" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} href="/classrooms/classroom1">classroom 1</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/classrooms/classroom2">classroom 2</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/classrooms/classroom3">classroom 3</NavDropdown.Item>

              
              
            </NavDropdown>
            <Nav.Link as={Link} href="/cash">cash managment</Nav.Link>
            <NavDropdown title="teachers" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} href="/insertteacher">add a teacher</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/teacher">teachers list</NavDropdown.Item>
              

              
              
            </NavDropdown>
            <NavDropdown title="factures" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} href="/factures">factures list</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/factures/new">new facture</NavDropdown.Item>
              

              
              
            </NavDropdown>
             <NavDropdown title="recu de paiement" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} href="/recus">recu de paiement list</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/recus/new">new recu</NavDropdown.Item>
              

              
              
            </NavDropdown>
            </>
             )}
              {isAuthenticated && (
            <Button variant="outline-danger" onClick={logout}>
              Déconnexion
            </Button>
          )}
          </Nav>
        </Navbar.Collapse>
         
       
      </Container>
    </Navbar>
  )
}


export default Navabar;