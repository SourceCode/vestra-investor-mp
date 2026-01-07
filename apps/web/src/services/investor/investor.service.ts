import { AppDataSource } from '../../db/data-source';
import { InvestorProfile, InvestorStatus } from '../../db/entities/InvestorProfile.entity';
import { AccreditationStatus } from '../../db/entities/InvestorProfile.entity';

export class InvestorService {
    private repo = AppDataSource.getRepository(InvestorProfile);

    /**
     * Creates a new investor profile for a user.
     * @param userId The ID of the user (who is an investor)
     * @param data Initial profile data
     */
    async createProfile(userId: string, data: Partial<InvestorProfile> = {}): Promise<InvestorProfile> {
        const profile = this.repo.create({
            userId,
            status: InvestorStatus.PENDING,
            accreditationStatus: AccreditationStatus.UNKNOWN,
            ...data
        });
        return this.repo.save(profile);
    }

    /**
     * Retrieves the profile for a given user.
     */
    async getProfile(userId: string): Promise<InvestorProfile | null> {
        return this.repo.findOneBy({ userId });
    }

    /**
     * Updates an existing investor profile.
     */
    async updateProfile(userId: string, updates: Partial<InvestorProfile>): Promise<InvestorProfile> {
        const profile = await this.getProfile(userId);
        if (!profile) {
            throw new Error('Investor profile not found');
        }

        Object.assign(profile, updates);
        return this.repo.save(profile);
    }
}
