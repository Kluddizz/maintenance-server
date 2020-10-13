--
-- PostgreSQL database dump
--

-- Dumped from database version 12.4
-- Dumped by pg_dump version 12.4

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

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    street character varying(50),
    city character varying(50),
    zip integer,
    email character varying(255),
    contactperson character varying(255),
    phone character varying(255)
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: maintenance_tag_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_tag_assignments (
    id integer NOT NULL,
    maintenanceid integer NOT NULL,
    tagid integer NOT NULL
);


ALTER TABLE public.maintenance_tag_assignments OWNER TO postgres;

--
-- Name: maintenance_tag_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenance_tag_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.maintenance_tag_assignments_id_seq OWNER TO postgres;

--
-- Name: maintenance_tag_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenance_tag_assignments_id_seq OWNED BY public.maintenance_tag_assignments.id;


--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    frequency integer,
    systemid integer NOT NULL,
    userid integer,
    stateid integer DEFAULT 1,
    start_date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.maintenances OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.maintenances_id_seq OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.states (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    color character varying(7)
);


ALTER TABLE public.states OWNER TO postgres;

--
-- Name: states_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.states_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.states_id_seq OWNER TO postgres;

--
-- Name: states_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.states_id_seq OWNED BY public.states.id;


--
-- Name: systems; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.systems (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    street character varying(50),
    city character varying(50),
    zip integer,
    customerid integer NOT NULL
);


ALTER TABLE public.systems OWNER TO postgres;

--
-- Name: systems_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.systems_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.systems_id_seq OWNER TO postgres;

--
-- Name: systems_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.systems_id_seq OWNED BY public.systems.id;


--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tags_id_seq OWNER TO postgres;

--
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(255) NOT NULL,
    firstname character varying(50),
    lastname character varying(50),
    roleid integer
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: maintenance_tag_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_tag_assignments ALTER COLUMN id SET DEFAULT nextval('public.maintenance_tag_assignments_id_seq'::regclass);


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: states id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.states ALTER COLUMN id SET DEFAULT nextval('public.states_id_seq'::regclass);


--
-- Name: systems id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systems ALTER COLUMN id SET DEFAULT nextval('public.systems_id_seq'::regclass);


--
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: maintenance_tag_assignments maintenance_tag_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_tag_assignments
    ADD CONSTRAINT maintenance_tag_assignments_pkey PRIMARY KEY (id);


--
-- Name: maintenances maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: states states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);


--
-- Name: systems systems_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systems
    ADD CONSTRAINT systems_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: maintenance_tag_assignments maintenance_tag_assignments_maintenanceid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_tag_assignments
    ADD CONSTRAINT maintenance_tag_assignments_maintenanceid_fkey FOREIGN KEY (maintenanceid) REFERENCES public.maintenances(id) ON DELETE CASCADE;


--
-- Name: maintenance_tag_assignments maintenance_tag_assignments_tagid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_tag_assignments
    ADD CONSTRAINT maintenance_tag_assignments_tagid_fkey FOREIGN KEY (tagid) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: maintenances maintenances_stateid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_stateid_fkey FOREIGN KEY (stateid) REFERENCES public.states(id) ON DELETE SET NULL;


--
-- Name: maintenances maintenances_systemid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_systemid_fkey FOREIGN KEY (systemid) REFERENCES public.systems(id) ON DELETE CASCADE;


--
-- Name: maintenances maintenances_userid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_userid_fkey FOREIGN KEY (userid) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: systems systems_customerid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.systems
    ADD CONSTRAINT systems_customerid_fkey FOREIGN KEY (customerid) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: users users_roleid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_roleid_fkey FOREIGN KEY (roleid) REFERENCES public.roles(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

