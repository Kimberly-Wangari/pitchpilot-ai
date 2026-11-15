--
-- PostgreSQL database dump
--

\restrict EsswIeQRgabXz0g9vUWVU8aCqdeD8YvFMklKW8trvqPZdmpP7n9W2p0t5hFCGAN

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_messages (
    id integer NOT NULL,
    session_id integer NOT NULL,
    sender character varying(20) NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT conversation_messages_content_check CHECK ((length(TRIM(BOTH FROM content)) > 0)),
    CONSTRAINT conversation_messages_sender_check CHECK (((sender)::text = ANY ((ARRAY['agent'::character varying, 'customer'::character varying, 'system'::character varying])::text[])))
);


--
-- Name: conversation_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversation_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversation_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversation_messages_id_seq OWNED BY public.conversation_messages.id;


--
-- Name: manager_access_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_access_requests (
    id integer NOT NULL,
    user_id integer NOT NULL,
    reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reviewed_by integer,
    review_note text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reviewed_at timestamp without time zone,
    CONSTRAINT manager_access_requests_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])))
);


--
-- Name: manager_access_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.manager_access_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: manager_access_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.manager_access_requests_id_seq OWNED BY public.manager_access_requests.id;


--
-- Name: manager_agents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_agents (
    manager_id integer NOT NULL,
    agent_id integer NOT NULL,
    assigned_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT manager_agents_no_self_assignment CHECK ((manager_id <> agent_id))
);


--
-- Name: manager_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.manager_invitations (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    accepted_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: manager_invitations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.manager_invitations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: manager_invitations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.manager_invitations_id_seq OWNED BY public.manager_invitations.id;


--
-- Name: oauth_accounts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_accounts (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    provider character varying(20) NOT NULL,
    provider_user_id character varying(255) NOT NULL,
    provider_email character varying(320),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT oauth_accounts_provider_check CHECK (((provider)::text = ANY ((ARRAY['google'::character varying, 'microsoft'::character varying, 'apple'::character varying])::text[])))
);


--
-- Name: oauth_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.oauth_accounts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: oauth_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.oauth_accounts_id_seq OWNED BY public.oauth_accounts.id;


--
-- Name: oauth_flows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_flows (
    id uuid NOT NULL,
    provider character varying(20) NOT NULL,
    purpose character varying(10) NOT NULL,
    state_hash character(64) NOT NULL,
    nonce character varying(255) NOT NULL,
    code_verifier character varying(255) NOT NULL,
    linking_user_id integer,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT oauth_flows_provider_check CHECK (((provider)::text = ANY ((ARRAY['google'::character varying, 'microsoft'::character varying, 'apple'::character varying])::text[]))),
    CONSTRAINT oauth_flows_purpose_check CHECK (((purpose)::text = ANY ((ARRAY['login'::character varying, 'link'::character varying])::text[])))
);


--
-- Name: oauth_login_tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_login_tickets (
    id uuid NOT NULL,
    ticket_hash character(64) NOT NULL,
    user_id integer NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: otp_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_challenges (
    id uuid NOT NULL,
    user_id integer NOT NULL,
    purpose character varying(20) NOT NULL,
    code_hash character(64) NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    verified_at timestamp with time zone,
    reset_token_hash text,
    CONSTRAINT otp_challenges_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT otp_challenges_purpose_check CHECK (((purpose)::text = ANY ((ARRAY['register'::character varying, 'login'::character varying, 'reset'::character varying])::text[])))
);


--
-- Name: training_scenarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_scenarios (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    description text NOT NULL,
    category character varying(100) NOT NULL,
    difficulty character varying(20) NOT NULL,
    customer_persona text NOT NULL,
    situation text NOT NULL,
    objective text NOT NULL,
    target_competencies text[] NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT training_scenarios_difficulty_check CHECK (((difficulty)::text = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::text[])))
);


--
-- Name: training_scenarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_scenarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_scenarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_scenarios_id_seq OWNED BY public.training_scenarios.id;


--
-- Name: training_session_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_session_evaluations (
    session_id integer NOT NULL,
    scores jsonb NOT NULL,
    overall_score numeric(5,2),
    assessed_competencies smallint NOT NULL,
    strengths jsonb NOT NULL,
    improvements jsonb NOT NULL,
    feedback text NOT NULL,
    model text NOT NULL,
    evaluated_message_count integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: training_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.training_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    scenario_id integer NOT NULL,
    status character varying(20) DEFAULT 'in_progress'::character varying NOT NULL,
    started_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT training_sessions_status_check CHECK (((status)::text = ANY ((ARRAY['in_progress'::character varying, 'completed'::character varying, 'abandoned'::character varying])::text[])))
);


--
-- Name: training_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.training_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: training_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.training_sessions_id_seq OWNED BY public.training_sessions.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255),
    role character varying(20) DEFAULT 'agent'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    manager_id integer,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['agent'::character varying, 'manager'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: conversation_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages ALTER COLUMN id SET DEFAULT nextval('public.conversation_messages_id_seq'::regclass);


--
-- Name: manager_access_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_access_requests ALTER COLUMN id SET DEFAULT nextval('public.manager_access_requests_id_seq'::regclass);


--
-- Name: manager_invitations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_invitations ALTER COLUMN id SET DEFAULT nextval('public.manager_invitations_id_seq'::regclass);


--
-- Name: oauth_accounts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts ALTER COLUMN id SET DEFAULT nextval('public.oauth_accounts_id_seq'::regclass);


--
-- Name: training_scenarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_scenarios ALTER COLUMN id SET DEFAULT nextval('public.training_scenarios_id_seq'::regclass);


--
-- Name: training_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions ALTER COLUMN id SET DEFAULT nextval('public.training_sessions_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: manager_access_requests manager_access_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_access_requests
    ADD CONSTRAINT manager_access_requests_pkey PRIMARY KEY (id);


--
-- Name: manager_agents manager_agents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_agents
    ADD CONSTRAINT manager_agents_pkey PRIMARY KEY (manager_id, agent_id);


--
-- Name: manager_invitations manager_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_invitations
    ADD CONSTRAINT manager_invitations_pkey PRIMARY KEY (id);


--
-- Name: manager_invitations manager_invitations_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_invitations
    ADD CONSTRAINT manager_invitations_token_hash_key UNIQUE (token_hash);


--
-- Name: oauth_accounts oauth_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_pkey PRIMARY KEY (id);


--
-- Name: oauth_flows oauth_flows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_flows
    ADD CONSTRAINT oauth_flows_pkey PRIMARY KEY (id);


--
-- Name: oauth_flows oauth_flows_state_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_flows
    ADD CONSTRAINT oauth_flows_state_hash_key UNIQUE (state_hash);


--
-- Name: oauth_login_tickets oauth_login_tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_login_tickets
    ADD CONSTRAINT oauth_login_tickets_pkey PRIMARY KEY (id);


--
-- Name: oauth_login_tickets oauth_login_tickets_ticket_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_login_tickets
    ADD CONSTRAINT oauth_login_tickets_ticket_hash_key UNIQUE (ticket_hash);


--
-- Name: otp_challenges otp_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_challenges
    ADD CONSTRAINT otp_challenges_pkey PRIMARY KEY (id);


--
-- Name: training_scenarios training_scenarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_scenarios
    ADD CONSTRAINT training_scenarios_pkey PRIMARY KEY (id);


--
-- Name: training_session_evaluations training_session_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_session_evaluations
    ADD CONSTRAINT training_session_evaluations_pkey PRIMARY KEY (session_id);


--
-- Name: training_sessions training_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_pkey PRIMARY KEY (id);


--
-- Name: oauth_accounts unique_provider_identity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT unique_provider_identity UNIQUE (provider, provider_user_id);


--
-- Name: oauth_accounts unique_user_provider; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT unique_user_provider UNIQUE (user_id, provider);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_conversation_messages_session; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_messages_session ON public.conversation_messages USING btree (session_id, id);


--
-- Name: idx_manager_agents_agent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_manager_agents_agent ON public.manager_agents USING btree (agent_id);


--
-- Name: idx_manager_invitations_pending_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_manager_invitations_pending_user ON public.manager_invitations USING btree (user_id) WHERE (accepted_at IS NULL);


--
-- Name: idx_otp_challenges_user_purpose; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_otp_challenges_user_purpose ON public.otp_challenges USING btree (user_id, purpose);


--
-- Name: idx_users_manager_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_manager_id ON public.users USING btree (manager_id);


--
-- Name: oauth_accounts_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_accounts_user_id_idx ON public.oauth_accounts USING btree (user_id);


--
-- Name: oauth_flows_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_flows_expires_at_idx ON public.oauth_flows USING btree (expires_at);


--
-- Name: oauth_login_tickets_expires_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX oauth_login_tickets_expires_at_idx ON public.oauth_login_tickets USING btree (expires_at);


--
-- Name: otp_challenges_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_challenges_expiry_idx ON public.otp_challenges USING btree (expires_at) WHERE (consumed_at IS NULL);


--
-- Name: otp_challenges_user_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX otp_challenges_user_purpose_idx ON public.otp_challenges USING btree (user_id, purpose, created_at DESC);


--
-- Name: unique_pending_manager_request; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX unique_pending_manager_request ON public.manager_access_requests USING btree (user_id) WHERE ((status)::text = 'pending'::text);


--
-- Name: conversation_messages conversation_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.training_sessions(id) ON DELETE CASCADE;


--
-- Name: manager_access_requests manager_access_requests_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_access_requests
    ADD CONSTRAINT manager_access_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: manager_access_requests manager_access_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_access_requests
    ADD CONSTRAINT manager_access_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: manager_agents manager_agents_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_agents
    ADD CONSTRAINT manager_agents_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: manager_agents manager_agents_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_agents
    ADD CONSTRAINT manager_agents_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: manager_invitations manager_invitations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.manager_invitations
    ADD CONSTRAINT manager_invitations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: oauth_accounts oauth_accounts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_accounts
    ADD CONSTRAINT oauth_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: oauth_flows oauth_flows_linking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_flows
    ADD CONSTRAINT oauth_flows_linking_user_id_fkey FOREIGN KEY (linking_user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: oauth_login_tickets oauth_login_tickets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_login_tickets
    ADD CONSTRAINT oauth_login_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: otp_challenges otp_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_challenges
    ADD CONSTRAINT otp_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: training_session_evaluations training_session_evaluations_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_session_evaluations
    ADD CONSTRAINT training_session_evaluations_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.training_sessions(id) ON DELETE CASCADE;


--
-- Name: training_sessions training_sessions_scenario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_scenario_id_fkey FOREIGN KEY (scenario_id) REFERENCES public.training_scenarios(id) ON DELETE RESTRICT;


--
-- Name: training_sessions training_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.training_sessions
    ADD CONSTRAINT training_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict EsswIeQRgabXz0g9vUWVU8aCqdeD8YvFMklKW8trvqPZdmpP7n9W2p0t5hFCGAN

