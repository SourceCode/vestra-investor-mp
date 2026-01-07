import { DataSource } from 'typeorm';
import { AppDataSource } from '../../db/data-source';
import { Media, MediaType } from '../../db/entities/Media.entity';
import { User } from '../../db/entities/User.entity';
import { MediaService } from './media.service';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

describe('MediaService', () => {
    let connection: DataSource;
    let mediaService: MediaService;
    let user: User;

    const testFile = {
        originalname: 'test.jpg',
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024
    };

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        connection = AppDataSource;
        mediaService = new MediaService();
    });

    afterAll(async () => {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    beforeEach(async () => {
        await connection.synchronize(true);

        const userRepo = connection.getRepository(User);
        user = userRepo.create({
            email: 'uploader@example.com',
            passwordHash: 'hash',
            firstName: 'Upload',
            lastName: 'User'
        });
        await userRepo.save(user);
    });

    afterEach(() => {
        // Cleanup uploads
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (fs.existsSync(uploadDir)) {
            const files = fs.readdirSync(uploadDir);
            for (const file of files) {
                fs.unlinkSync(path.join(uploadDir, file));
            }
        }
    });

    it('should upload a file', async () => {
        const media = await mediaService.uploadMedia(
            testFile,
            MediaType.DEAL,
            randomUUID(),
            user.id
        );

        expect(media).toBeDefined();
        expect(media.id).toBeDefined();
        expect(media.entityType).toBe(MediaType.DEAL);
        expect(media.filename).toBe('test.jpg');
        expect(media.path).toMatch(/^\/uploads\/.+\.jpg$/);

        // Verify file exists on disk
        const fullPath = path.join(process.cwd(), 'public', media.path);
        expect(fs.existsSync(fullPath)).toBe(true);
    });

    it('should get entity media', async () => {
        const dealId = randomUUID();
        await mediaService.uploadMedia(testFile, MediaType.DEAL, dealId, user.id);
        await mediaService.uploadMedia(testFile, MediaType.DEAL, dealId, user.id);
        await mediaService.uploadMedia(testFile, MediaType.DEAL, randomUUID(), user.id);

        const media = await mediaService.getEntityMedia(MediaType.DEAL, dealId);
        expect(media.length).toBe(2);
    });

    it('should delete media', async () => {
        const media = await mediaService.uploadMedia(testFile, MediaType.DEAL, randomUUID(), user.id);
        const fullPath = path.join(process.cwd(), 'public', media.path);

        expect(fs.existsSync(fullPath)).toBe(true);

        const result = await mediaService.deleteMedia(media.id);
        expect(result).toBe(true);
        expect(fs.existsSync(fullPath)).toBe(false);

        const found = await connection.getRepository(Media).findOne({ where: { id: media.id } });
        expect(found).toBeNull();
    });
});
