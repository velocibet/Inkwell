CREATE TABLE temp_note_ids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_converted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_temp_notes_expires_at ON temp_note_ids (expires_at);
CREATE INDEX idx_temp_notes_ip ON temp_note_ids (ip_address);