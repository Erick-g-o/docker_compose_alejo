CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  client_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  service_id INTEGER REFERENCES services(id),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DONE', 'CANCELLED'))
);

-- Seed Services
INSERT INTO services (name, description, duration) VALUES
('Corte de cabello', 'Corte de estilo moderno y lavado.', 30),
('Asesoría académica', 'Orientación sobre proyectos y estudios.', 60),
('Consulta técnica', 'Resolución de problemas de hardware/software.', 45),
('Tutoría', 'Clases personalizadas de diversas materias.', 60)
ON CONFLICT DO NOTHING;
