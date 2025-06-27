-- InfraCheck Database Seed Script
-- Populates all tables with realistic test data for Chilean context
-- Run this script after your database migrations

-- Clear existing data (in correct order to respect foreign keys)
TRUNCATE TABLE notification RESTART IDENTITY CASCADE;
TRUNCATE TABLE device_tokens RESTART IDENTITY CASCADE;
TRUNCATE TABLE vote RESTART IDENTITY CASCADE;
TRUNCATE TABLE comment RESTART IDENTITY CASCADE;
TRUNCATE TABLE report_image RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_reports_followed RESTART IDENTITY CASCADE;
TRUNCATE TABLE report_change RESTART IDENTITY CASCADE;
TRUNCATE TABLE report RESTART IDENTITY CASCADE;
TRUNCATE TABLE notification_preference RESTART IDENTITY CASCADE;
TRUNCATE TABLE refresh_token RESTART IDENTITY CASCADE;
TRUNCATE TABLE message RESTART IDENTITY CASCADE;
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Seed Notification Preferences
INSERT INTO notification_preference ("userId", "sseEnabled", "pushEnabled", "updatedAt") VALUES
(1, true, true, CURRENT_TIMESTAMP),
(2, true, false, CURRENT_TIMESTAMP),
(3, false, true, CURRENT_TIMESTAMP),
(4, true, true, CURRENT_TIMESTAMP),
(5, true, false, CURRENT_TIMESTAMP),
(6, false, false, CURRENT_TIMESTAMP),
(7, true, true, CURRENT_TIMESTAMP),
(8, true, false, CURRENT_TIMESTAMP),
(9, true, true, CURRENT_TIMESTAMP);

-- Seed Users (with bcrypt hashed passwords for 'password123' and 'admin123')
INSERT INTO users (id, phone_number, password, name, last_name, role, status, created_at, password_updated_at) VALUES
(1, '+56912345678', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María', 'González', 'ADMIN', 'ACTIVE', '2024-01-15 10:00:00', NULL),
(2, '+56987654321', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos', 'Rodríguez', 'NEIGHBOR', 'ACTIVE', '2024-02-01 15:30:00', NULL),
(3, '+56976543210', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana', 'Martínez', 'NEIGHBOR', 'ACTIVE', '2024-02-15 09:15:00', NULL),
(4, '+56965432109', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pedro', 'Silva', 'NEIGHBOR', 'ACTIVE', '2024-03-01 14:20:00', NULL),
(5, '+56954321098', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carmen', 'López', 'NEIGHBOR', 'ACTIVE', '2024-03-10 11:45:00', NULL),
(6, '+56943210987', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luis', 'Muñoz', 'NEIGHBOR', 'PENDING_VERIFICATION', '2024-03-20 16:30:00', NULL),
(7, '+56932109876', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sofia', 'Fernández', 'NEIGHBOR', 'ACTIVE', '2024-04-01 08:00:00', NULL),
(8, '+56921098765', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diego', 'Herrera', 'NEIGHBOR', 'ACTIVE', '2024-04-15 12:30:00', NULL),
(9, '+56910987654', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Valentina', 'Rojas', 'NEIGHBOR', 'ACTIVE', '2024-05-01 13:15:00', NULL);

-- Seed Reports (Chilean locations and realistic infrastructure problems)
INSERT INTO report (id, title, description, latitude, longitude, category, state, "is_visible", created_at, "creatorId") VALUES
(1, 'Semáforo dañado en Av. Providencia', 'El semáforo de la esquina de Av. Providencia con Manuel Montt no está funcionando correctamente. Las luces se quedan en amarillo intermitente, causando confusión en el tráfico. Es una intersección muy transitada y necesita reparación urgente.', -33.4569, -70.6483, 'TRANSIT', 'PENDING', true, '2024-06-20 10:30:00', 2),

(2, 'Basural clandestino en Cerro San Cristóbal', 'Se ha formado un basural clandestino en el sector norte del Cerro San Cristóbal. Hay bolsas de basura acumuladas, restos de construcción y desechos orgánicos. El mal olor afecta a los visitantes del parque.', -33.4489, -70.6693, 'GARBAGE', 'IN_PROGRESS', true, '2024-06-18 14:15:00', 3),

(3, 'Hoyo profundo en Av. Libertador Bernardo O''Higgins', 'Existe un hoyo muy profundo en la calzada de la Alameda, cerca de la estación Universidad de Chile. Es peligroso para los vehículos y ya han ocurrido algunos accidentes menores. Necesita reparación inmediata.', -33.4372, -70.6506, 'INFRASTRUCTURE', 'RESOLVED', true, '2024-06-15 09:00:00', 4),

(4, 'Poste de luz sin funcionar en Plaza de Armas', 'El poste de alumbrado público en el sector norte de la Plaza de Armas de Santiago no está funcionando. Durante la noche la zona queda muy oscura, lo que puede ser peligroso para los transeúntes.', -33.4372, -70.6506, 'SECURITY', 'PENDING', true, '2024-06-22 18:45:00', 5),

(5, 'Acumulación de basura en Terminal Pesquero', 'En el terminal pesquero de Valparaíso se ha acumulado mucha basura y restos de pescado. El olor es muy fuerte y atrae moscas. Los contenedores están desbordados y no han sido vaciados en varios días.', -33.0458, -71.6197, 'GARBAGE', 'IN_PROGRESS', true, '2024-06-19 16:20:00', 6),

(6, 'Paradero de micro destruido por temporal', 'El paradero de micros en Av. España en Valparaíso fue destruido por el temporal de la semana pasada. Los vidrios están rotos y la estructura metálica está doblada. Los usuarios esperan sin protección.', -33.0458, -71.6197, 'TRANSIT', 'PENDING', true, '2024-06-21 11:30:00', 7),

(7, 'Fuga de agua en vereda de Av. Collao', 'Hay una fuga de agua importante en la vereda de Av. Collao en Concepción. El agua está inundando la calzada y creando un charco muy grande. Además se está desperdiciando mucha agua potable.', -36.8270, -73.0498, 'INFRASTRUCTURE', 'RESOLVED', true, '2024-06-16 07:45:00', 8),

(8, 'Luminaria quemada en costanera de Viña del Mar', 'Varias luminarias de la costanera de Viña del Mar están quemadas, especialmente en el sector de Reñaca. Durante la noche es muy oscuro para caminar y puede ser peligroso.', -33.0153, -71.5500, 'SECURITY', 'IN_PROGRESS', true, '2024-06-17 20:00:00', 9),

(9, 'Contenedores de reciclaje desbordados en La Serena', 'Los contenedores de reciclaje en el centro de La Serena están completamente desbordados. Las botellas y cartones están esparcidos por el suelo alrededor de los contenedores.', -29.9027, -71.2519, 'GARBAGE', 'PENDING', true, '2024-06-23 15:00:00', 2),

(10, 'Señalética de tránsito vandalizada en Temuco', 'Varias señales de tránsito en el centro de Temuco han sido vandalizadas con grafitis. Algunas están tan cubiertas que no se puede leer la información, lo que es peligroso para conductores y peatones.', -38.7359, -72.5904, 'TRANSIT', 'REJECTED', true, '2024-06-14 13:30:00', 3),

(11, 'Vereda hundida en sector residencial Las Condes', 'Una sección de la vereda en una calle residencial de Las Condes se ha hundido, probablemente debido a una fuga de agua subterránea. Es peligroso para los peatones, especialmente adultos mayores.', -33.4208, -70.6069, 'INFRASTRUCTURE', 'PENDING', true, '2024-06-24 08:15:00', 4),

(12, 'Grafitis en estación de metro Universidad de Chile', 'Los muros exteriores de la estación de metro Universidad de Chile están completamente cubiertos de grafitis. Afecta la imagen del sector y algunos contenidos son inapropiados.', -33.4372, -70.6506, 'SECURITY', 'IN_PROGRESS', true, '2024-06-20 17:30:00', 5);

-- Seed Report Images (using the provided image URL)
INSERT INTO report_image (id, "imageUrl", "takenAt", latitude, longitude, created_at, "reportId") VALUES
(1, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-20 10:35:00', -33.4569, -70.6483, '2024-06-20 10:30:00', 1),
(2, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-20 10:40:00', -33.4570, -70.6484, '2024-06-20 10:30:00', 1),
(3, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-18 14:20:00', -33.4489, -70.6693, '2024-06-18 14:15:00', 2),
(4, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-15 09:10:00', -33.4372, -70.6506, '2024-06-15 09:00:00', 3),
(5, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-15 09:15:00', -33.4371, -70.6505, '2024-06-15 09:00:00', 3),
(6, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-22 18:50:00', -33.4372, -70.6506, '2024-06-22 18:45:00', 4),
(7, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-19 16:25:00', -33.0458, -71.6197, '2024-06-19 16:20:00', 5),
(8, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-19 16:30:00', -33.0459, -71.6198, '2024-06-19 16:20:00', 5),
(9, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-21 11:35:00', -33.0458, -71.6197, '2024-06-21 11:30:00', 6),
(10, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-16 07:50:00', -36.8270, -73.0498, '2024-06-16 07:45:00', 7),
(11, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-17 20:05:00', -33.0153, -71.5500, '2024-06-17 20:00:00', 8),
(12, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-23 15:05:00', -29.9027, -71.2519, '2024-06-23 15:00:00', 9),
(13, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-23 15:10:00', -29.9028, -71.2520, '2024-06-23 15:00:00', 9),
(14, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-14 13:35:00', -38.7359, -72.5904, '2024-06-14 13:30:00', 10),
(15, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-24 08:20:00', -33.4208, -70.6069, '2024-06-24 08:15:00', 11),
(16, 'https://infracheck-bucket.s3.us-east-1.amazonaws.com/1750864105159-1750863535790.jpg', '2024-06-20 17:35:00', -33.4372, -70.6506, '2024-06-20 17:30:00', 12);

-- Seed Comments
INSERT INTO comment (id, content, created_at, "creatorId", "reportId") VALUES
(1, 'Confirmo que este problema existe. Lo vi ayer cuando pasé por ahí.', '2024-06-21 08:00:00', 3, 1),
(2, 'Ya era hora que alguien reportara esto. Lleva meses así.', '2024-06-21 14:30:00', 7, 1),
(3, 'Muy buen reporte. Espero que lo arreglen pronto.', '2024-06-19 16:45:00', 2, 2),
(4, 'Yo también he visto esto. Es realmente peligroso.', '2024-06-19 20:15:00', 8, 2),
(5, 'Gracias por reportar. Afecta a toda la comunidad.', '2024-06-16 11:30:00', 5, 3),
(6, 'Este problema se repite constantemente en esta zona.', '2024-06-23 10:00:00', 9, 4),
(7, 'Ojalá las autoridades tomen cartas en el asunto.', '2024-06-23 15:30:00', 2, 4),
(8, 'He visto que están trabajando en esto, espero que terminen pronto.', '2024-06-20 12:00:00', 4, 5),
(9, 'Exactamente lo mismo pasó el año pasado en el mismo lugar.', '2024-06-22 09:15:00', 3, 6),
(10, 'Me parece exagerado. No es tan grave como lo pintan.', '2024-06-17 14:20:00', 6, 7),
(11, 'Muy importante que reportemos estos problemas.', '2024-06-18 16:00:00', 7, 8),
(12, 'La municipalidad debería prestar más atención a estos temas.', '2024-06-24 11:00:00', 8, 9),
(13, 'Excelente iniciativa reportar esto. Ojalá más gente lo haga.', '2024-06-15 18:30:00', 9, 10),
(14, 'Esto afecta especialmente a los adultos mayores del barrio.', '2024-06-25 07:45:00', 6, 11),
(15, 'Espero que no se olviden de este reporte como otros anteriores.', '2024-06-21 13:15:00', 5, 12);

-- Seed Votes
INSERT INTO vote (id, type, created_at, "userId", "reportId") VALUES
(1, 'upvote', '2024-06-20 12:00:00', 3, 1),
(2, 'upvote', '2024-06-20 15:30:00', 4, 1),
(3, 'upvote', '2024-06-21 09:00:00', 5, 1),
(4, 'downvote', '2024-06-21 16:00:00', 6, 1),
(5, 'upvote', '2024-06-18 16:00:00', 2, 2),
(6, 'upvote', '2024-06-18 18:30:00', 4, 2),
(7, 'upvote', '2024-06-19 10:00:00', 7, 2),
(8, 'upvote', '2024-06-19 14:15:00', 8, 2),
(9, 'upvote', '2024-06-15 11:00:00', 2, 3),
(10, 'upvote', '2024-06-15 14:30:00', 3, 3),
(11, 'upvote', '2024-06-16 08:00:00', 6, 3),
(12, 'upvote', '2024-06-22 20:00:00', 2, 4),
(13, 'upvote', '2024-06-23 07:30:00', 8, 4),
(14, 'upvote', '2024-06-23 12:00:00', 9, 4),
(15, 'upvote', '2024-06-19 18:00:00', 3, 5),
(16, 'downvote', '2024-06-20 10:30:00', 8, 5),
(17, 'upvote', '2024-06-21 13:45:00', 2, 6),
(18, 'upvote', '2024-06-22 16:00:00', 4, 6),
(19, 'upvote', '2024-06-16 10:00:00', 2, 7),
(20, 'upvote', '2024-06-16 15:30:00', 5, 7),
(21, 'upvote', '2024-06-17 12:00:00', 9, 7),
(22, 'upvote', '2024-06-18 08:00:00', 2, 8),
(23, 'upvote', '2024-06-18 14:15:00', 3, 8),
(24, 'upvote', '2024-06-23 17:00:00', 3, 9),
(25, 'upvote', '2024-06-24 09:30:00', 7, 9),
(26, 'downvote', '2024-06-14 15:00:00', 4, 10),
(27, 'downvote', '2024-06-15 11:30:00', 8, 10),
(28, 'upvote', '2024-06-24 10:00:00', 2, 11),
(29, 'upvote', '2024-06-25 14:30:00', 7, 11),
(30, 'upvote', '2024-06-20 19:00:00', 2, 12),
(31, 'upvote', '2024-06-21 08:30:00', 8, 12);

-- Seed Report Changes
INSERT INTO report_change (id, "changeType", "from", "to", created_at, "creatorId", "reportId") VALUES
(1, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-19 09:00:00', 1, 2),
(2, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-16 10:30:00', 1, 3),
(3, 'STATE', 'IN_PROGRESS', 'RESOLVED', '2024-06-17 14:00:00', 1, 3),
(4, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-20 11:00:00', 1, 5),
(5, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-17 16:30:00', 1, 7),
(6, 'STATE', 'IN_PROGRESS', 'RESOLVED', '2024-06-18 09:45:00', 1, 7),
(7, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-18 12:00:00', 1, 8),
(8, 'STATE', 'PENDING', 'REJECTED', '2024-06-15 13:30:00', 1, 10),
(9, 'STATE', 'PENDING', 'IN_PROGRESS', '2024-06-21 10:15:00', 1, 12);

-- Seed Notifications
INSERT INTO notification (id, type, "from", "to", "read", created_at, "userId", "reportId") VALUES
(1, 'STATE', 'PENDING', 'IN_PROGRESS', true, '2024-06-19 09:00:00', 3, 2),
(2, 'STATE', 'PENDING', 'IN_PROGRESS', false, '2024-06-16 10:30:00', 4, 3),
(3, 'STATE', 'IN_PROGRESS', 'RESOLVED', true, '2024-06-17 14:00:00', 4, 3),
(4, 'STATE', 'PENDING', 'IN_PROGRESS', false, '2024-06-20 11:00:00', 6, 5),
(5, 'STATE', 'PENDING', 'IN_PROGRESS', true, '2024-06-17 16:30:00', 8, 7),
(6, 'STATE', 'IN_PROGRESS', 'RESOLVED', true, '2024-06-18 09:45:00', 8, 7),
(7, 'STATE', 'PENDING', 'IN_PROGRESS', false, '2024-06-18 12:00:00', 9, 8),
(8, 'STATE', 'PENDING', 'REJECTED', true, '2024-06-15 13:30:00', 3, 10),
(9, 'STATE', 'PENDING', 'IN_PROGRESS', false, '2024-06-21 10:15:00', 5, 12),
(10, 'STATE', 'PENDING', 'IN_PROGRESS', true, '2024-06-20 08:00:00', 2, 1),
(11, 'STATE', 'PENDING', 'IN_PROGRESS', false, '2024-06-23 16:00:00', 5, 4),
(12, 'STATE', 'PENDING', 'IN_PROGRESS', true, '2024-06-22 12:30:00', 7, 6);

-- Seed Device Tokens
INSERT INTO device_tokens (id, token, platform, "isActive", "userId") VALUES
(1, 'fake_device_token_1_abc123', 'android', true, 1),
(2, 'fake_device_token_2_def456', 'ios', true, 2),
(3, 'fake_device_token_3_ghi789', 'android', true, 3),
(4, 'fake_device_token_4_jkl012', 'ios', true, 4),
(5, 'fake_device_token_5_mno345', 'android', true, 5),
(6, 'fake_device_token_7_pqr678', 'web', true, 7),
(7, 'fake_device_token_8_stu901', 'ios', true, 8),
(8, 'fake_device_token_9_vwx234', 'android', true, 9);

-- Seed User Reports Followed (many-to-many relationship)
INSERT INTO user_reports_followed (user_id, report_id) VALUES
(2, 1), (2, 3), (2, 5),
(3, 1), (3, 2), (3, 4), (3, 8),
(4, 1), (4, 3), (4, 6), (4, 7),
(5, 2), (5, 4), (5, 9), (5, 12),
(6, 5), (6, 11),
(7, 1), (7, 6), (7, 9), (7, 10),
(8, 2), (8, 7), (8, 8), (8, 12),
(9, 4), (9, 8), (9, 11);

-- Seed Refresh Tokens (some sample tokens for active users)
INSERT INTO refresh_token (id, token, created_at, expires_at, "userId") VALUES
(1, 'refresh_token_admin_2024_abc123def456', '2024-06-25 10:00:00', '2024-07-25 10:00:00', 1),
(2, 'refresh_token_carlos_2024_ghi789jkl012', '2024-06-24 15:30:00', '2024-07-24 15:30:00', 2),
(3, 'refresh_token_ana_2024_mno345pqr678', '2024-06-23 09:15:00', '2024-07-23 09:15:00', 3),
(4, 'refresh_token_pedro_2024_stu901vwx234', '2024-06-22 14:20:00', '2024-07-22 14:20:00', 4),
(5, 'refresh_token_sofia_2024_yza567bcd890', '2024-06-21 08:00:00', '2024-07-21 08:00:00', 7);

-- Seed Messages (chat messages)
INSERT INTO message (id, content, pinned, created_at, "senderId") VALUES
(1, '¡Bienvenidos al chat de InfraCheck! Aquí pueden discutir sobre los reportes de infraestructura.', true, '2024-01-15 12:00:00', 1),
(2, 'Recuerden que es importante reportar los problemas de infraestructura para mejorar nuestra comunidad.', true, '2024-01-16 09:00:00', 1),
(3, 'Hola a todos, he visto varios reportes sobre problemas de alumbrado público últimamente.', false, '2024-06-20 15:00:00', 2),
(4, 'Sí, es un problema recurrente. Especialmente en las zonas residenciales.', false, '2024-06-20 15:15:00', 3),
(5, '¿Alguien sabe cuánto tiempo toma típicamente que respondan a los reportes?', false, '2024-06-21 10:30:00', 4),
(6, 'En mi experiencia, los reportes de seguridad son los que más rápido atienden.', false, '2024-06-21 11:00:00', 5),
(7, 'Es importante que votemos y comentemos en los reportes para darles más visibilidad.', false, '2024-06-22 08:45:00', 7),
(8, 'Estoy de acuerdo. La participación ciudadana es clave.', false, '2024-06-22 09:00:00', 8),
(9, '¿Cómo puedo subir fotos de mejor calidad en mis reportes?', false, '2024-06-23 14:20:00', 6),
(10, 'Asegúrate de que haya buena iluminación y que la foto sea clara y enfocada.', false, '2024-06-23 14:35:00', 9);

-- Update sequences to current values
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('report_id_seq', (SELECT MAX(id) FROM report));
SELECT setval('report_image_id_seq', (SELECT MAX(id) FROM report_image));
SELECT setval('comment_id_seq', (SELECT MAX(id) FROM comment));
SELECT setval('vote_id_seq', (SELECT MAX(id) FROM vote));
SELECT setval('report_change_id_seq', (SELECT MAX(id) FROM report_change));
SELECT setval('notification_id_seq', (SELECT MAX(id) FROM notification));
SELECT setval('device_tokens_id_seq', (SELECT MAX(id) FROM device_tokens));
SELECT setval('refresh_token_id_seq', (SELECT MAX(id) FROM refresh_token));
SELECT setval('message_id_seq', (SELECT MAX(id) FROM message));

-- Display summary
SELECT 
    'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 
    'report' as table_name, COUNT(*) as records FROM report
UNION ALL
SELECT 
    'report_image' as table_name, COUNT(*) as records FROM report_image
UNION ALL
SELECT 
    'report_change' as table_name, COUNT(*) as records FROM report_change
UNION ALL
SELECT 
    'comment' as table_name, COUNT(*) as records FROM comment
UNION ALL
SELECT 
    'vote' as table_name, COUNT(*) as records FROM vote
UNION ALL
SELECT 
    'notification' as table_name, COUNT(*) as records FROM notification
UNION ALL
SELECT 
    'notification_preference' as table_name, COUNT(*) as records FROM notification_preference
UNION ALL
SELECT 
    'device_tokens' as table_name, COUNT(*) as records FROM device_tokens
UNION ALL
SELECT 
    'refresh_token' as table_name, COUNT(*) as records FROM refresh_token
UNION ALL
SELECT 
    'message' as table_name, COUNT(*) as records FROM message
ORDER BY table_name;

-- Verification queries
SELECT 'Database seeded successfully!' as status;
SELECT 'Admin user credentials: +56912345678 / admin123' as admin_info;
SELECT 'Regular user credentials: +56987654321 / password123' as user_info;
