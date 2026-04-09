import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Calendar, 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Filter, 
  Trash2, 
  LayoutDashboard,
  Scissors,
  GraduationCap,
  Users,
  Settings
} from 'lucide-react';

const API_URL = `http://${window.location.hostname}:3001`;

function App() {
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const [formData, setFormData] = useState({
    client_name: '',
    email: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchData(true);
  }, []);

  const fetchData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const appointmentsRes = await axios.get(`${API_URL}/appointments`);
      setAppointments(appointmentsRes.data);
      
      if (isInitial) {
        const servicesRes = await axios.get(`${API_URL}/services`);
        setServices(servicesRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (isInitial) {
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: 'No se pudo conectar con el servidor.',
          background: '#111',
          color: '#fff',
          confirmButtonColor: '#7046f2'
        });
      }
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!formData.client_name || !formData.email || !formData.date || !formData.time || !selectedService) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor rellena todos los datos.',
        background: '#111',
        color: '#fff',
        confirmButtonColor: '#7046f2'
      });
    }

    try {
      await axios.post(`${API_URL}/appointments`, {
        ...formData,
        service_id: selectedService.id
      });
      Swal.fire({
        icon: 'success',
        title: '¡Cita Reservada!',
        text: 'Tu cita ha sido creada exitosamente.',
        background: '#111',
        color: '#fff',
        timer: 2000,
        showConfirmButton: false
      });
      setShowForm(false);
      setFormData({ client_name: '', email: '', date: '', time: '' });
      setSelectedService(null);
      fetchData();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.error || 'No se pudo crear la cita.',
        background: '#111',
        color: '#fff'
      });
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/appointments/${id}/status`, { status });
      fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Estado actualizado',
        background: '#111',
        color: '#fff',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Operación no válida',
        text: error.response?.data?.error,
        background: '#111',
        color: '#fff'
      });
    }
  };

  const deleteAppointment = async (id) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#333',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#111',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/appointments/${id}`);
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
      }
    }
  };

  const filteredAppointments = appointments.filter(app => 
    filter === 'ALL' ? true : app.status === filter
  );

  const getServiceIcon = (name) => {
    if (name.includes('Corte')) return <Scissors className="text-primary" />;
    if (name.includes('Asesoría')) return <GraduationCap className="text-primary" />;
    if (name.includes('Tutoría')) return <Users className="text-primary" />;
    return <Settings className="text-primary" />;
  };

  return (
    <div className="min-h-screen">
      <nav className="navbar">
        <div className="logo">
          <Calendar size={28} />
          <span>BookIt</span>
        </div>
        <div className="user-info">
          <div className="badge badge-done">Online</div>
        </div>
      </nav>

      <main className="container fade-in">
        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--primary)' }}>Reservas</span> Inteligentes
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
            Gestiona tus citas de forma sencilla y profesional.
          </p>
        </header>

        {/* Services Section */}
        <section>
          <div className="section-title">Servicios Disponibles</div>
          <div className="grid-services">
            {services.map(service => (
              <div key={service.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  {getServiceIcon(service.name)}
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>{service.duration} min</span>
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>{service.name}</h3>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {service.description}
                </p>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%' }}
                  onClick={() => {
                    setSelectedService(service);
                    setShowForm(true);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                >
                  <Plus size={18} /> Reservar Ahora
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Dashboard Section */}
        <div className="grid-dashboard" style={{ marginTop: '4rem' }}>
          {/* Reservation Form */}
          <section>
            <div className="section-title">
              {selectedService ? `Nueva Cita: ${selectedService.name}` : 'Selecciona un servicio'}
            </div>
            <div className="card">
              <form onSubmit={handleCreateAppointment}>
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Ej. Juan Pérez"
                    value={formData.client_name}
                    onChange={e => setFormData({...formData, client_name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="juan@ejemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Fecha</label>
                    <input 
                      type="date" 
                      className="form-control"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Hora</label>
                    <input 
                      type="time" 
                      className="form-control"
                      value={formData.time}
                      onChange={e => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={!selectedService}
                >
                  Confirmar Reserva
                </button>
              </form>
            </div>
          </section>

          {/* List Section */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Mis Reservas</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-control" 
                  style={{ padding: '0.4rem 0.8rem', width: 'auto' }}
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                >
                  <option value="ALL">Todos</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="DONE">Completadas</option>
                  <option value="CANCELLED">Canceladas</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="empty-state">Cargando citas...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="card empty-state">
                <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <p>No hay citas encontradas.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {filteredAppointments.map(app => (
                  <div key={app.id} className="card fade-in" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span className={`badge badge-${app.status.toLowerCase()}`}>
                            {app.status === 'PENDING' ? 'Pendiente' : app.status === 'DONE' ? 'Completada' : 'Cancelada'}
                          </span>
                          <span style={{ fontWeight: '600' }}>{app.service_name}</span>
                        </div>
                        <h4 style={{ fontSize: '1.1rem' }}>{app.client_name}</h4>
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Calendar size={14} /> {new Date(app.date).toLocaleDateString()}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Clock size={14} /> {app.time.substring(0, 5)}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {app.status === 'PENDING' && (
                          <>
                            <button 
                              className="btn btn-success" 
                              style={{ padding: '0.5rem' }}
                              onClick={() => updateStatus(app.id, 'DONE')}
                              title="Marcar como terminada"
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.5rem' }}
                              onClick={() => updateStatus(app.id, 'CANCELLED')}
                              title="Cancelar cita"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem', borderColor: 'transparent' }}
                          onClick={() => deleteAppointment(app.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      
      <footer style={{ marginTop: '5rem', padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-dim)' }}>
        <p>&copy; 2026 BookIt — Sistema de Reservas Inteligente. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;
