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
-- Data for Name: states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.states (id, name, color) FROM stdin;
1	Ausstehend	#c4c4c4
2	In Bearbeitung	#ffff66
3	Abgeschlossen	#66ff66
4	Protokoll angefertigt	#666bff
5	Bezahlt	#66ffcc
\.


--
-- Name: states_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.states_id_seq', 7, true);


--
-- PostgreSQL database dump complete
--

