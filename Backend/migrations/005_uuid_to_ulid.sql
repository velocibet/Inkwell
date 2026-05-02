ALTER TABLE temp_note_ids
ALTER COLUMN id DROP DEFAULT;

ALTER TABLE temp_note_ids
ALTER COLUMN id TYPE character varying(26)
USING id::text;

ALTER TABLE temp_note_ids
ADD CONSTRAINT temp_note_ids_id_length_check
CHECK (char_length(id) = 26);