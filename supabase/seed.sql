-- Seed: trayecto 2026 con 10 materias y 47 tareas por defecto
-- Nota: Investigación de Operaciones no tiene tareas por ahora
-- Ejecutar como admin en el editor SQL de Supabase

insert into public.trayectos (year, active)
values (2026, true)
on conflict (year) do update set active = true;

with t as (select id from public.trayectos where year = 2026)

insert into public.subjects (trayecto_id, name)
select t.id, s.name
from t, (values
  ('Acreditables - Deportes, Artes y Recreación'),
  ('Actividades Acreditables III'),
  ('Electiva III'),
  ('Formación Crítica III'),
  ('Ingeniería del Software II'),
  ('Matemática Aplicada'),
  ('Modelado de Base de Datos'),
  ('Proyecto Sociotecnológico III'),
  ('Sistemas Operativos'),
  ('Investigación de Operaciones')
) as s(name);

insert into public.tasks (subject_id, text, trimestre)
select su.id, x.text, x.trimestre
from (values
  ('Acreditables - Deportes, Artes y Recreación', 'Trabajo - Importancia de la Actividad Física y su Aplicación en el Mejoramiento de la Salud Bloques', 1),
  ('Acreditables - Deportes, Artes y Recreación', 'Trabajo - Acondicionamiento Neuromuscular', 1),
  ('Acreditables - Deportes, Artes y Recreación', 'Trabajo - Plan de Entrenamiento', 1),

  ('Actividades Acreditables III', 'Video Ilustrativo', 2),
  ('Actividades Acreditables III', 'Pelicula', 2),
  ('Actividades Acreditables III', 'Juego', 2),
  ('Actividades Acreditables III', 'Exposición', 2),
  ('Actividades Acreditables III', 'Devocional', 2),

  ('Electiva III', 'Conocimientos Previos (Tarea)', 1),
  ('Electiva III', 'Git y GitLab', 1),
  ('Electiva III', 'Instalación Laravel', 1),
  ('Electiva III', 'FrameWork', 2),
  ('Electiva III', 'Informe de Selección de Arquitectura y Factibilidad Tecnológica', 2),

  ('Formación Crítica III', 'Articulo', 1),
  ('Formación Crítica III', 'Revista Digital', 1),
  ('Formación Crítica III', 'Programa de Capacitación', 2),
  ('Formación Crítica III', 'Problemas frente al Cambio', 2),
  ('Formación Crítica III', 'Infografía. Redes Sociales', 2),

  ('Ingeniería del Software II', 'Modelado de Negocio', 1),
  ('Ingeniería del Software II', 'Tarea sobre ingenieria de requisitos', 1),
  ('Ingeniería del Software II', 'Examen', 1),
  ('Ingeniería del Software II', 'Tarea Analisis de requisito', 2),
  ('Ingeniería del Software II', 'Actividad de Diseño de interfaz', 2),
  ('Ingeniería del Software II', 'Tarea', 2),

  ('Matemática Aplicada', 'Examen I', 1),
  ('Matemática Aplicada', 'Soporte Examen I', 1),
  ('Matemática Aplicada', 'Sustento Bíblico', 1),
  ('Matemática Aplicada', 'Selección de grupo', 1),
  ('Matemática Aplicada', 'Guía de ejercicios colaborativos', 1),
  ('Matemática Aplicada', 'Taller Individual', 2),
  ('Matemática Aplicada', 'Guía de ejercicios', 2),
  ('Matemática Aplicada', 'Practica en R', 2),
  ('Matemática Aplicada', 'Proyecto Final', 2),
  ('Matemática Aplicada', 'Defensa del proyecto', 2),

  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 1 (10%)', 2),
  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 2(10%)', 2),
  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 3 (10%)', 2),
  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 4 (15%)', 2),
  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 5(15%)', 2),
  ('Modelado de Base de Datos', 'Aquí subir la Tarea Número 6(40%)', 2),

  ('Proyecto Sociotecnológico III', 'Propuesta para el Proyecto Sociotecnológico.', 1),
  ('Proyecto Sociotecnológico III', 'Formulación del Capítulo I para tu Proyecto Sociotecnológico', 2),

  ('Sistemas Operativos', 'Definición de Términos', 1),
  ('Sistemas Operativos', 'INVESTIGACIÓN MODELO GAVILAN', 1),
  ('Sistemas Operativos', 'Foro Exposición de la Investigación (20 pts)', 1),
  ('Sistemas Operativos', 'GLOSARIO DE TERMINOS', 1),
  ('Sistemas Operativos', '¿Qué son los Bloqueos, Monitores en los Sistemas Operativos?', 1)
) as x(subject_name, text, trimestre)
join public.subjects su on su.name = x.subject_name;