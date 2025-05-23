--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 16.1

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--
CREATE SCHEMA IF NOT EXISTS public;



CREATE TYPE report_category_enum AS ENUM (
    'SECURITY',
    'INFRASTRUCTURE',
    'TRANSIT',
    'GARBAGE'
);
CREATE TYPE report_state_enum AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED'
);

CREATE TYPE users_role_enum AS ENUM (
    'ADMIN',
    'NEIGHBOR'
);



CREATE TYPE vote_type_enum AS ENUM (
    'upvote',
    'downvote'
);



CREATE TABLE comment (
    id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "creatorId" integer,
    "reportId" integer
);


ALTER TABLE comment ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: message; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE message (
    id integer NOT NULL,
    content text NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "senderId" integer
);



--
-- Name: message_id_seq; Type: SEQUENCE; Schema: public; Owner: dev_user
--

ALTER TABLE message ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME message_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE report (
    id integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "creatorId" integer,
    title character varying NOT NULL,
    is_visible boolean DEFAULT true NOT NULL,
    description text NOT NULL,
    latitude numeric(9,6) NOT NULL,
    longitude numeric(9,6) NOT NULL,
    state report_state_enum DEFAULT 'PENDING'::report_state_enum NOT NULL,
    category report_category_enum NOT NULL
);



--
-- Name: report_change; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE report_change (
    id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    "creatorId" integer,
    "reportId" integer
);



--
-- Name: report_change_id_seq; Type: SEQUENCE; Schema: public; Owner: dev_user
--

ALTER TABLE report_change ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME report_change_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE SEQUENCE report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;



ALTER SEQUENCE report_id_seq OWNED BY report.id;




CREATE TABLE user_reports_followed (
    user_id integer NOT NULL,
    report_id integer NOT NULL
);



--
-- Name: users; Type: TABLE; Schema: public; Owner: dev_user
--

CREATE TABLE users (
    id integer NOT NULL,
    phone_number character varying NOT NULL,
    password character varying NOT NULL,
    name character varying NOT NULL,
    last_name character varying NOT NULL,
    role users_role_enum DEFAULT 'NEIGHBOR'::users_role_enum NOT NULL,
    active boolean DEFAULT true NOT NULL
);




CREATE SEQUENCE users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




CREATE TABLE vote (
    id integer NOT NULL,
    "userId" integer,
    "reportId" integer,
    type vote_type_enum NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);



--
-- Name: vote_id_seq; Type: SEQUENCE; Schema: public; Owner: dev_user
--

ALTER TABLE vote ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME vote_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY report ALTER COLUMN id SET DEFAULT nextval('report_id_seq'::regclass);



ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: user_reports_followed PK_f79ab5072f347dd91b7f664be1f; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY user_reports_followed
    ADD CONSTRAINT "PK_f79ab5072f347dd91b7f664be1f" PRIMARY KEY (user_id, report_id);


--
-- Name: users UQ_aa517eb9a603fc94080a45ae983; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY users
    ADD CONSTRAINT "UQ_aa517eb9a603fc94080a45ae983" UNIQUE (number);


--
-- Name: comment comment_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT comment_pkey PRIMARY KEY (id);


--
-- Name: message message_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- Name: report_change report_change_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY report_change
    ADD CONSTRAINT report_change_pkey PRIMARY KEY (id);


--
-- Name: report report_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY report
    ADD CONSTRAINT report_pkey PRIMARY KEY (id);


--
-- Name: vote vote_pkey; Type: CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT vote_pkey PRIMARY KEY (id);


--
-- Name: IDX_015c134fffdf340991be5ee7fc; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE INDEX "IDX_015c134fffdf340991be5ee7fc" ON user_reports_followed USING btree (user_id);


--
-- Name: IDX_1fc33efbc6046e439c63d30338; Type: INDEX; Schema: public; Owner: dev_user
--

CREATE INDEX "IDX_1fc33efbc6046e439c63d30338" ON user_reports_followed USING btree (report_id);


--
-- Name: user_reports_followed FK_015c134fffdf340991be5ee7fc5; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY user_reports_followed
    ADD CONSTRAINT "FK_015c134fffdf340991be5ee7fc5" FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment FK_1cffb00d43787a8f9c4114223e1; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT "FK_1cffb00d43787a8f9c4114223e1" FOREIGN KEY ("reportId") REFERENCES report(id);


--
-- Name: user_reports_followed FK_1fc33efbc6046e439c63d303383; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY user_reports_followed
    ADD CONSTRAINT "FK_1fc33efbc6046e439c63d303383" FOREIGN KEY (report_id) REFERENCES report(id);


--
-- Name: report_change FK_220294ecd7678fc0466c2960e5a; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY report_change
    ADD CONSTRAINT "FK_220294ecd7678fc0466c2960e5a" FOREIGN KEY ("creatorId") REFERENCES users(id);


--
-- Name: vote FK_485ae089442bd8399de0ffb3f53; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT "FK_485ae089442bd8399de0ffb3f53" FOREIGN KEY ("reportId") REFERENCES report(id);


--
-- Name: comment FK_b6bf60ecb9f6c398e349adff52f; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY comment
    ADD CONSTRAINT "FK_b6bf60ecb9f6c398e349adff52f" FOREIGN KEY ("creatorId") REFERENCES users(id);


--
-- Name: message FK_bc096b4e18b1f9508197cd98066; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY message
    ADD CONSTRAINT "FK_bc096b4e18b1f9508197cd98066" FOREIGN KEY ("senderId") REFERENCES users(id);


--
-- Name: report FK_d39e0620f1c93d7c12bc6481c2a; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY report
    ADD CONSTRAINT "FK_d39e0620f1c93d7c12bc6481c2a" FOREIGN KEY ("creatorId") REFERENCES users(id);


--
-- Name: report_change FK_df30ad62672f83b809e7d152725; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY report_change
    ADD CONSTRAINT "FK_df30ad62672f83b809e7d152725" FOREIGN KEY ("reportId") REFERENCES report(id);


--
-- Name: vote FK_f5de237a438d298031d11a57c3b; Type: FK CONSTRAINT; Schema: public; Owner: dev_user
--

ALTER TABLE ONLY vote
    ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES users(id);


--
-- PostgreSQL database dump complete
--

