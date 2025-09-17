--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Homebrew)
-- Dumped by pg_dump version 16.9 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_event_id_foreign;
DROP INDEX IF EXISTS public.registrations_status_index;
DROP INDEX IF EXISTS public.registrations_confirmation_code_index;
DROP INDEX IF EXISTS public.admin_users_email_index;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_event_id_email_unique;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_confirmation_code_unique;
ALTER TABLE IF EXISTS ONLY public.knex_migrations DROP CONSTRAINT IF EXISTS knex_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public.knex_migrations_lock DROP CONSTRAINT IF EXISTS knex_migrations_lock_pkey;
ALTER TABLE IF EXISTS ONLY public.events DROP CONSTRAINT IF EXISTS events_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_pkey;
ALTER TABLE IF EXISTS ONLY public.admin_users DROP CONSTRAINT IF EXISTS admin_users_email_unique;
ALTER TABLE IF EXISTS public.knex_migrations_lock ALTER COLUMN index DROP DEFAULT;
ALTER TABLE IF EXISTS public.knex_migrations ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS public.registrations;
DROP SEQUENCE IF EXISTS public.knex_migrations_lock_index_seq;
DROP TABLE IF EXISTS public.knex_migrations_lock;
DROP SEQUENCE IF EXISTS public.knex_migrations_id_seq;
DROP TABLE IF EXISTS public.knex_migrations;
DROP TABLE IF EXISTS public.events;
DROP TABLE IF EXISTS public.admin_users;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role text DEFAULT 'viewer'::text,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT admin_users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'viewer'::text])))
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    registration_deadline timestamp with time zone NOT NULL,
    venue_name character varying(255) NOT NULL,
    venue_address character varying(255) NOT NULL,
    venue_city character varying(255) NOT NULL,
    venue_google_maps_url character varying(255),
    max_attendees integer DEFAULT 100 NOT NULL,
    enable_waitlist boolean DEFAULT true,
    agenda jsonb,
    organizer_name character varying(255) NOT NULL,
    organizer_logo_url character varying(255),
    collaborator_name character varying(255),
    collaborator_logo_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    company character varying(255) NOT NULL,
    "position" character varying(255),
    nif_cif character varying(255),
    status text DEFAULT 'confirmed'::text,
    confirmation_code character varying(255),
    qr_code_url character varying(255),
    confirmed_at timestamp with time zone,
    checked_in_at timestamp with time zone,
    email_sent boolean DEFAULT false,
    notes text,
    additional_data jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT registrations_status_check CHECK ((status = ANY (ARRAY['confirmed'::text, 'waitlist'::text, 'cancelled'::text, 'attended'::text])))
);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Data for Name: admin_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.admin_users (id, email, password, name, role, is_active, last_login, created_at, updated_at) FROM stdin;
d3dc2aab-50e0-4041-921b-38970960d37d	admin@solarland.com	$2a$10$cLj3qtBIibM9KheZcdZ8heIEnpQ1I478IIHTEdpNwZFofBYdyf6Ye	Administrador	admin	t	2025-09-17 14:13:20.726+01	2025-09-17 13:42:33.550473+01	2025-09-17 13:42:33.550473+01
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, description, event_date, registration_deadline, venue_name, venue_address, venue_city, venue_google_maps_url, max_attendees, enable_waitlist, agenda, organizer_name, organizer_logo_url, collaborator_name, collaborator_logo_url, is_active, created_at, updated_at) FROM stdin;
2ce95cce-f15b-4cfe-b00e-adb34741cb30	Curso Presencial SolarEdge - Optimización Real	Nos complace invitarle al curso presencial, organizado junto con nuestro fabricante SolarEdge, que tendrá lugar el próximo 2 de octubre en nuestras instalaciones en Fuerteventura.\n\nDurante el evento, se presentará la colaboración estratégica entre SolarEdge y Solarland, se explicará en detalle la solución SolarEdge, poniendo especial énfasis en cómo la optimización real marca la diferencia. Además, se realizarán demostraciones prácticas de nuestros softwares, seguidas de una sesión de preguntas y respuestas para resolver todas sus dudas.	2025-10-02 15:00:00+01	2025-09-30 23:59:00+01	Solarland S.L.	C/ La Vista, 6. Villaverde, La Oliva	Fuerteventura	https://maps.google.com/?q=Solarland+SL+Fuerteventura	50	t	[{"time": "15:00 - 15:30", "title": "Registro de asistentes y café de bienvenida", "description": "Recepción y acreditación de participantes"}, {"time": "15:30 - 17:30", "title": "El valor añadido de la solución optimizada SolarEdge", "description": "Presentación técnica y casos de éxito"}, {"time": "17:30 - 18:00", "title": "Pausa", "description": "Networking y refrigerio"}, {"time": "18:00 - 20:00", "title": "Demostraciones prácticas", "description": "Sesión práctica y preguntas y respuestas"}, {"time": "20:00 - 20:30", "title": "Cóctel y networking", "description": "Cierre del evento con networking"}]	Solarland	/logos/solarland-logo.png	SolarEdge	/logos/solaredge-logo.png	t	2025-09-17 14:06:52.108894+01	2025-09-17 14:18:50.883+01
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	001_create_events_table.js	1	2025-09-17 13:42:19.424+01
2	002_create_registrations_table.js	1	2025-09-17 13:42:19.435+01
3	003_create_admin_users_table.js	1	2025-09-17 13:42:19.442+01
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, event_id, first_name, last_name, email, phone, company, "position", nif_cif, status, confirmation_code, qr_code_url, confirmed_at, checked_in_at, email_sent, notes, additional_data, created_at, updated_at) FROM stdin;
\.


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 3, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: admin_users admin_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_unique UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_confirmation_code_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_confirmation_code_unique UNIQUE (confirmation_code);


--
-- Name: registrations registrations_event_id_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_email_unique UNIQUE (event_id, email);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: admin_users_email_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_users_email_index ON public.admin_users USING btree (email);


--
-- Name: registrations_confirmation_code_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registrations_confirmation_code_index ON public.registrations USING btree (confirmation_code);


--
-- Name: registrations_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registrations_status_index ON public.registrations USING btree (status);


--
-- Name: registrations registrations_event_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_event_id_foreign FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

