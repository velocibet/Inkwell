import { Injectable, Inject, BadGatewayException, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { Pool } from 'pg';
import { CreateNoteDto, UpdateNoteDto, CreateShareNoteDto } from './dto/create-note.dto';
import { ulid } from 'ulid';

@Injectable()
export class NotesService {
  constructor(
    @Inject('PG_CONNECTION') private db: Pool,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const {
      title,
      content,
      iv,
      tags = [],
      is_pinned = false
     } = createNoteDto;

    const id = ulid();
    const { rows } = await this.db.query(`
      INSERT INTO user_notes
      (id, user_id, title, content, iv, tags, is_pinned)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [id, userId, title, content, iv, tags, is_pinned])

    return {
      message: 'Note created successfully.',
      data: {
        id: rows[0].id
      }
    }
  }

  async findAll(userId: string) {
    const { rows } = await this.db.query(`
      SELECT id, title, content, iv, tags, is_pinned, is_archived, created_at, updated_at, is_deleted, deleted_at
      FROM user_notes
      WHERE user_id = $1
    `, [userId])

    return rows;
  }

  async findOne(userId: string, id: string) {
    const { rows } = await this.db.query(`
      SELECT *
      FROM user_notes
      WHERE id = $1
      LIMIT 1
      `, [id]
    )

    if (rows.length < 1) throw new BadRequestException("Note does not exist or you do not have permission.");

    const post = rows[0];
    if (post.user_id !== userId) throw new BadRequestException("Note does not exist or you do not have permission.");
    
    return post;
  }

  async update(userId: string, id: string, updateNoteDto: UpdateNoteDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let argIndex = 1;

    for (const [key, value] of Object.entries(updateNoteDto)) {
      if (value !== undefined) {
        fields.push(`${key} = $${argIndex}`);
        values.push(value);
        argIndex++;
      }
    }

    if (fields.length === 0) {
      return { message: 'No data to update.' };
    }

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE user_notes
      SET ${fields.join(', ')}
      WHERE id = $${argIndex} AND user_id = $${argIndex + 1}
      RETURNING id
    `;
    
    values.push(id, userId);

    const { rows } = await this.db.query(query, values);

    if (rows.length < 1) {
      throw new BadRequestException("Note does not exist or you do not have permission.");
    }

    return {
      message: 'Note updated successfully.',
      data: { id: rows[0].id }
    };
  }

  async softRemove(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      UPDATE user_notes
      SET is_deleted = true, deleted_at = NOW()
      WHERE user_id = $1 AND id = $2 AND is_deleted = false
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found or already deleted.");
    return "Note moved to trash.";
  }

  async permanentRemove(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      DELETE FROM user_notes
      WHERE user_id = $1 AND id = $2
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found.");
    return "Note permanently deleted.";
  }

  async restore(userId: string, id: string) {
    const { rowCount } = await this.db.query(`
      UPDATE user_notes
      SET is_deleted = false, deleted_at = NULL
      WHERE user_id = $1 AND id = $2 AND is_deleted = true
    `, [userId, id]);

    if (rowCount === 0) throw new BadRequestException("Note not found to restore.");
    return "Note restored successfully.";
  }

  /**
   * 비회원용 임시 노트 ID 발급
   */
  async createTempNoteId(ip: string, userAgent: string) {
    const countCheck = await this.db.query(`
      SELECT count(*) FROM temp_note_ids 
      WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 hour'
    `, [ip]);

    // 1시간에 5개 제한 수고링~
    if (parseInt(countCheck.rows[0].count) >= 5) {
      throw new BadRequestException("Too many requests. Please try again in an hour.");
    }

    const tempId = ulid();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.db.query(`
      INSERT INTO temp_note_ids (id, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4)
    `, [tempId, ip, userAgent, expiresAt]);

    return { id: tempId };
  }

  async shareNote(userId: string | null, noteId: string, createShareNoteDto: CreateShareNoteDto) {
    if (userId) {
      const ownershipCheck = await this.db.query(
        `SELECT id FROM user_notes WHERE id = $1 AND user_id = $2`,
        [noteId, userId]
      );
      if (ownershipCheck.rows.length < 1) {
        throw new BadRequestException("Note does not exist or you do not have permission.");
      }
    } else {
      const tempIdCheck = await this.db.query(
        `SELECT id FROM temp_note_ids WHERE id = $1 AND expires_at > NOW()`,
        [noteId]
      );
      if (tempIdCheck.rows.length < 1) {
        throw new BadRequestException("Invalid or expired session. Please refresh.");
      }
    }

    const { id, iv, encrypted_title, encrypted_content, is_burn_after_read, expires_at } = createShareNoteDto;

    const query = `
      INSERT INTO share_notes (id, iv, encrypted_title, encrypted_content, is_burn_after_read, expires_at, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, expires_at;
    `;

    try {
      const result = await this.db.query(query, [
        id, iv, encrypted_title, encrypted_content,
        is_burn_after_read ?? false, expires_at || null
      ]);

      return {
        success: true,
        shareId: result.rows[0].id,
        message: 'A secure share link was successfully created.'
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create shared link.');
    }
  }

  async getSharedNote(id: string) {
    const query = `
      SELECT id, iv, encrypted_title, encrypted_content, is_burn_after_read, expires_at
      FROM share_notes
      WHERE id = $1 AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    const { rows } = await this.db.query(query, [id]);

    if (rows.length < 1) {
      throw new BadRequestException("The link is invalid, expired, or has already been destroyed.");
    }

    const note = rows[0];

    if (note.is_burn_after_read) {
      await this.db.query(`DELETE FROM share_notes WHERE id = $1`, [id]);
    }

    return {
      message: 'Note retrieved successfully.',
      data: {
        iv: note.iv,
        title: note.encrypted_title,
        content: note.encrypted_content,
        is_burned: note.is_burn_after_read,
      }
    };
  }
}