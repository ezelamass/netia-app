-- Chat: RAG que recupera de verdad, búsqueda cerrada al service role, e idempotencia/rate limit de mensajes.
-- El código de las Edge Functions funciona también sin esta migración (reintenta sin client_message_id).

-- M1: RAG. ivfflat creado con las tablas vacías tiene recall pésimo; hnsw no depende de los datos.
DROP INDEX IF EXISTS public.idx_rag_tino_embedding;
DROP INDEX IF EXISTS public.idx_rag_zahia_embedding;
DROP INDEX IF EXISTS public.idx_rag_roma_embedding;
CREATE INDEX idx_rag_tino_embedding  ON public.rag_tino  USING hnsw (embedding extensions.vector_cosine_ops);
CREATE INDEX idx_rag_zahia_embedding ON public.rag_zahia USING hnsw (embedding extensions.vector_cosine_ops);
CREATE INDEX idx_rag_roma_embedding  ON public.rag_roma  USING hnsw (embedding extensions.vector_cosine_ops);

-- match_rag_documents es SECURITY DEFINER y solo la usa avatar-chat con service role.
REVOKE ALL ON FUNCTION public.match_rag_documents(text, extensions.vector, int, float) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_rag_documents(text, extensions.vector, int, float) TO service_role;

-- M2: mensajes. Orden estable, reintento sin duplicar y consulta de rate limit.
ALTER TABLE public.ai_messages ADD COLUMN IF NOT EXISTS client_message_id text;
CREATE UNIQUE INDEX IF NOT EXISTS ai_messages_client_msg_uniq
  ON public.ai_messages (conversation_id, client_message_id) WHERE client_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv_created ON public.ai_messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user_role_created ON public.ai_messages (role, created_at DESC);
