'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr'; // Import French locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Container, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

// Setup the localizer with French locale
moment.locale('fr');
const localizer = momentLocalizer(moment);

const ClassroomCalendar = ({ classroomId }) => {
  
  const router = useRouter();
  const calendarRef = useRef(null);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState({
    id: null,
    teacherId: '',
    startTime: '',
    endTime: '',
    description: '',
    recurringWeekly: false,
  });

  // Fetch schedules and teachers
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/schedules/classroom/${classroomId}`);
        if (!response.ok) {
          throw new Error('Échec de la récupération des horaires');
        }
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des horaires:', error);
        setError('Échec de la récupération des horaires');
      } finally {
        setLoading(false);
      }
    };

    const fetchTeachers = async () => {
      try {
        const response = await fetch('/api/teachers');
        if (!response.ok) throw new Error('Échec de la récupération des enseignants');
        const data = await response.json();
        setTeachers(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des enseignants:', error);
      }
    };

    if (classroomId) {
      fetchSchedules();
      fetchTeachers();
    }
  }, [classroomId]);

  // Format schedules for calendar
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: `${schedule.teacher.name} - ${schedule.description || 'Sans description'}`,
    start: new Date(schedule.startTime),
    end: new Date(schedule.endTime),
    allDay: false,
    description: schedule.description,
    teacherId: schedule.teacherId,
    recurringWeekly: schedule.recurringWeekly,
  }));

  // Customize event styles
  const eventPropGetter = (event) => ({
    style: {
      backgroundColor: event.recurringWeekly ? '#1a73e8' : '#3174ad',
      color: '#fff',
      borderRadius: '5px',
      border: 'none',
      fontSize: '14px',
      padding: '2px 5px',
    },
  });

  // Custom event component
  const EventComponent = ({ event }) => (
    <div>
      <strong>{event.title}</strong>
      <br />
      <small>{event.description || 'Aucune description'}</small>
    </div>
  );

  // Handle date click to switch to day view
  const handleNavigate = (date) => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      calendarApi.changeView('day', date);
    }
  };

  // Handle event click for editing
  const handleSelectEvent = (event) => {
    const dateToLocalInput = (date) =>
      moment(date).format('YYYY-MM-DDTHH:mm');

    setEditingSchedule({
      id: event.id,
      teacherId: event.teacherId,
      startTime: dateToLocalInput(event.start),
      endTime: dateToLocalInput(event.end),
      description: event.description || '',
      recurringWeekly: event.recurringWeekly,
    });
    setShowModal(true);
  };

  // Handle slot selection for creating new event
  const handleSelectSlot = ({ start, end }) => {
    const dateToLocalInput = (date) =>
      moment(date).format('YYYY-MM-DDTHH:mm');

    setEditingSchedule({
      id: null,
      teacherId: '',
      startTime: dateToLocalInput(start),
      endTime: dateToLocalInput(end),
      description: '',
      recurringWeekly: false,
    });
    setShowModal(true);
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingSchedule((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission for create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { id, teacherId, startTime, endTime, description, recurringWeekly } = editingSchedule;

      if (!teacherId || !startTime || !endTime) {
        throw new Error('Veuillez remplir tous les champs requis');
      }

      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error('L’heure de fin doit être postérieure à l’heure de début');
      }

      const payload = {
        classroomId: parseInt(classroomId, 10),
        teacherId: parseInt(teacherId, 10),
        startTime,
        endTime,
        description,
        recurringWeekly,
      };

      // Check for conflicts
      const conflictResponse = await fetch('/api/schedules/check-conflict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classroomId,
          startTime,
          endTime,
          excludeScheduleId: id,
        }),
      });

      if (!conflictResponse.ok) {
        const conflictData = await conflictResponse.json();
        throw new Error(conflictData.error || 'Conflit d’horaire détecté');
      }

      const url = id ? `/api/schedules/${id}` : '/api/schedules';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(id ? 'Échec de la mise à jour' : 'Échec de la création');
      }

      setShowModal(false);
      setEditingSchedule({
        id: null,
        teacherId: '',
        startTime: '',
        endTime: '',
        description: '',
        recurringWeekly: false,
      });
      toast.success(id ? 'Horaire mis à jour avec succès' : 'Horaire créé avec succès');
      const updatedSchedules = await fetch(`/api/schedules/classroom/${classroomId}`).then((res) => res.json());
      setSchedules(updatedSchedules);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle schedule deletion
  const handleDelete = async () => {
    if (!editingSchedule.id) return;

    try {
      const response = await fetch(`/api/schedules/${editingSchedule.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Échec de la suppression de l’horaire');

      setShowModal(false);
      toast.success('Horaire supprimé avec succès');
      const updatedSchedules = await fetch(`/api/schedules/classroom/${classroomId}`).then((res) => res.json());
      setSchedules(updatedSchedules);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendrier de la Salle</h1>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Ajouter un Horaire
        </Button>
      </div>
      <div className="bg-white rounded-lg shadow-md p-4 h-[600px]">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={['month', 'week', 'day']}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onNavigate={handleNavigate}
          selectable
          eventPropGetter={eventPropGetter}
          components={{ event: EventComponent }}
          messages={{
            allDay: 'Toute la journée',
            previous: 'Précédent',
            next: 'Suivant',
            today: 'Aujourd’hui',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun événement dans cette période',
          }}
          ref={calendarRef}
          step={15} // 15-minute slots
          timeslots={4} // 4 slots per hour
          min={new Date(0, 0, 0, 8, 0)} // 8:00 AM
          max={new Date(0, 0, 0, 22, 0)} // 10:00 PM
        />
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingSchedule.id ? 'Modifier l’Horaire' : 'Créer un Horaire'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Enseignant</Form.Label>
              <Form.Select
                name="teacherId"
                value={editingSchedule.teacherId}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner un enseignant</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Heure de début</Form.Label>
              <Form.Control
                type="datetime-local"
                name="startTime"
                value={editingSchedule.startTime}
                onChange={handleChange}
                required
                step="900"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Heure de fin</Form.Label>
              <Form.Control
                type="datetime-local"
                name="endTime"
                value={editingSchedule.endTime}
                onChange={handleChange}
                required
                step="900"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={editingSchedule.description}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Récurrent hebdomadaire"
                name="recurringWeekly"
                checked={editingSchedule.recurringWeekly}
                onChange={handleChange}
              />
            </Form.Group>
            <div className="flex justify-between">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {editingSchedule.id ? 'Mettre à jour' : 'Créer'}
              </Button>
              {editingSchedule.id && (
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<DeleteForeverIcon />}
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </Button>
              )}
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ProtectedRoute(ClassroomCalendar);