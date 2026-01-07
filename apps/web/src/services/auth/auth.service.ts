import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../db/entities/User.entity';
import { AppDataSource } from '../../db/data-source';
import { OrganizationService } from '../organization/organization.service';
import { InvestorService } from '../investor/investor.service';
import { OrganizationType } from '../../db/entities/Organization.entity';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod';
const SALT_ROUNDS = 10;

export interface SignUpDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    organizationName: string;
    organizationType: OrganizationType;
    isInvestor?: boolean;
}

export class AuthService {
    private userRepository = AppDataSource.getRepository(User);
    private orgService = new OrganizationService();
    private investorService = new InvestorService();

    async hashPassword(plain: string): Promise<string> {
        return bcrypt.hash(plain, SALT_ROUNDS);
    }

    async verifyPassword(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }

    generateToken(user: User): string {
        return jwt.sign(
            {
                userId: user.id,
                email: user.email,
                // Add roles here later if needed in token
            },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
    }

    async signUp(data: SignUpDto): Promise<{ user: User; token: string }> {
        const existingUser = await this.userRepository.findOneBy({ email: data.email });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const passwordHash = await this.hashPassword(data.password);

        const user = this.userRepository.create({
            email: data.email,
            passwordHash,
            firstName: data.firstName,
            lastName: data.lastName,
            isActive: true
        });

        const savedUser = await this.userRepository.save(user);

        // Create Default Organization
        await this.orgService.createOrganization(
            data.organizationName,
            data.organizationType,
            savedUser
        );

        // Create Investor Profile if applicable
        if (data.isInvestor || data.organizationType === OrganizationType.INVESTOR) {
            await this.investorService.createProfile(savedUser.id);
        }

        const token = this.generateToken(savedUser);

        return { user: savedUser, token };
    }

    async signIn(email: string, password: string): Promise<{ user: User; token: string }> {
        const user = await this.userRepository.findOneBy({ email });

        if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
        }

        const isValid = await this.verifyPassword(password, user.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        if (!user.isActive) {
            throw new Error('Account inactive');
        }

        const token = this.generateToken(user);

        return { user, token };
    }
}
