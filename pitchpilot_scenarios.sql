--
-- PostgreSQL database dump
--

\restrict 4qcmvMbBbvSVlpUvEfCyHhMdXJvqHBl61YushkeZ7UC1zhy02uJcDqfeFPVpAV8

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: training_scenarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.training_scenarios (id, title, description, category, difficulty, customer_persona, situation, objective, target_competencies, is_active, created_at, updated_at) VALUES (1, 'Handling a Price Objection', 'Practice responding to a customer who believes the proposed solution is too expensive.', 'Objection Handling', 'beginner', 'A small business owner who is interested in the product but is highly price-conscious.', 'The customer understands the product but believes the price is higher than expected.', 'Understand the customer''s concern, communicate value clearly and respond without immediately offering a discount.', '{"Communication Clarity","Objection Handling","Value Communication"}', true, '2026-09-26 13:39:06.872994', '2026-09-26 13:39:06.872994');
INSERT INTO public.training_scenarios (id, title, description, category, difficulty, customer_persona, situation, objective, target_competencies, is_active, created_at, updated_at) VALUES (2, 'Competitor Comparison', 'Handle a prospect who is actively comparing your solution with a competing provider.', 'Competitive Selling', 'intermediate', 'An informed operations manager who has researched several competing solutions.', 'The prospect believes a competitor offers similar capabilities at a lower price.', 'Identify the customer''s priorities and communicate relevant differentiation without attacking the competitor.', '{"Needs Discovery","Persuasive Communication","Competitive Positioning"}', true, '2026-09-26 13:39:06.872994', '2026-09-26 13:39:06.872994');
INSERT INTO public.training_scenarios (id, title, description, category, difficulty, customer_persona, situation, objective, target_competencies, is_active, created_at, updated_at) VALUES (3, 'Discovering Customer Needs', 'Practice identifying customer needs before recommending a solution.', 'Needs Discovery', 'beginner', 'A business owner exploring possible solutions but unsure what they need.', 'The prospect has agreed to a conversation but has provided very little information about their challenges.', 'Use effective questions and active listening to uncover the customer''s needs before presenting a solution.', '{"Active Listening",Questioning,"Customer Engagement"}', true, '2026-09-26 13:39:06.872994', '2026-09-26 13:39:06.872994');
INSERT INTO public.training_scenarios (id, title, description, category, difficulty, customer_persona, situation, objective, target_competencies, is_active, created_at, updated_at) VALUES (4, 'Handling a Hesitant Decision Maker', 'Practice engaging a prospect who likes the solution but is reluctant to make a commitment.', 'Closing', 'advanced', 'A cautious decision maker who sees value in the solution but is concerned about implementation risk.', 'The sales conversation has progressed well but the customer continues postponing the final decision.', 'Identify the reason for hesitation, address the concern and guide the customer toward an appropriate next step.', '{"Objection Handling","Customer Engagement","Closing Skills","Persuasive Communication"}', true, '2026-09-26 13:39:06.872994', '2026-09-26 13:39:06.872994');


--
-- Name: training_scenarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.training_scenarios_id_seq', 4, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 4qcmvMbBbvSVlpUvEfCyHhMdXJvqHBl61YushkeZ7UC1zhy02uJcDqfeFPVpAV8

