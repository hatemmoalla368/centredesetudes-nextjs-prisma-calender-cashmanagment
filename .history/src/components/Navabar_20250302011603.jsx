'use client'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Link from "next/link";

function Navabar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} href="/">centre des etudes</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">dashboard</Nav.Link>
            
            <NavDropdown title="calender" id="basic-nav-dropdown">
              <NavDropdown.Item as={Link} href="/classrooms/classroom1">classroom 1</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/classrooms/classroom2">classroom 2</NavDropdown.Item>
              <NavDropdown.Item as={Link} href="/classrooms/classroom3">classroom 3</NavDropdown.Item>

              
              
            </NavDropdown>
            <Nav.Link as={Link} href="/">dashboard</Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navabar;