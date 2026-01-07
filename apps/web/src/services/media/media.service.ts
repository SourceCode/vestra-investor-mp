import { AppDataSource } from '../../db/data-source';
import { Media, MediaType } from '../../db/entities/Media.entity';
import fs from 'fs';
import path from 'path';

export class MediaService {
    private mediaRepo = AppDataSource.getRepository(Media);
    private uploadDir = path.join(process.cwd(), 'public', 'uploads');

    constructor() {
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadMedia(
        file: { originalname: string, buffer: Buffer, mimetype: string, size: number },
        entityType: MediaType,
        entityId: string,
        uploaderId: string
    ): Promise<Media> {
        const ext = path.extname(file.originalname);
        const storedFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        const storedPath = path.join(this.uploadDir, storedFilename);
        const relativePath = `/uploads/${storedFilename}`;

        // Ensure directory exists (again, just in case)
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }

        // Write file to disk
        fs.writeFileSync(storedPath, file.buffer);

        // Create DB record
        const media = this.mediaRepo.create({
            filename: file.originalname,
            path: relativePath,
            mimeType: file.mimetype,
            size: file.size,
            entityType,
            entityId,
            uploaderId
        });

        return await this.mediaRepo.save(media);
    }

    async getEntityMedia(entityType: MediaType, entityId: string): Promise<Media[]> {
        return await this.mediaRepo.find({
            where: { entityType, entityId },
            order: { createdAt: 'DESC' }
        });
    }

    async deleteMedia(mediaId: string): Promise<boolean> {
        const media = await this.mediaRepo.findOne({ where: { id: mediaId } });
        if (!media) return false;

        // Try to delete file from disk
        const fullPath = path.join(process.cwd(), 'public', media.path);
        if (fs.existsSync(fullPath)) {
            try {
                fs.unlinkSync(fullPath);
            } catch (err) {
                console.error(`Failed to delete file: ${fullPath}`, err);
                // Continue to delete DB record even if file delete fails (orphaned file is better than orphaned implementation)
            }
        }

        await this.mediaRepo.remove(media);
        return true;
    }
}
